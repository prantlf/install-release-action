if (typeof global.crypto !== 'object') {
  global.crypto = {}
}
if (typeof global.crypto.getRandomValues !== 'function') {
  global.crypto.getRandomValues = getRandomValues
}

const { join, resolve } = require('path')
const core = require('@actions/core')
const { exec } = require("@actions/exec")
const io = require('@actions/io')
const httpm = require('@actions/http-client')
const tc = require('@actions/tool-cache')
const { access, symlink } = require('fs').promises
const MersenneTwister = require('mersenne-twister')
const { clean, satisfies, valid } = require('semver')
const { getMapOfArrays, getArchiveSuffixes } = require('./lib')

const { platform } = process
let platformSuffixes, archSuffixes

const twister = new MersenneTwister(Math.random() * Number.MAX_SAFE_INTEGER)
function getRandomValues(dest) {
  for (let i = dest.length; --i >= 0;) {
    dest[i] = Math.floor(twister.random() * 256)
  }
  return dest
}

const exists = file => access(file).then(() => true, () => false)

let { GITHUB_WORKSPACE: workspace, GITHUB_TOKEN: envToken } = process.env

async function request(token, repo, path) {
  const http = new httpm.HttpClient()
  const url = `https://api.github.com/repos/${repo}/${path}`
  core.info(`Get ${url}`)
  const res = await http.get(url, {
		Accept: 'application/json',
		Authorization: `Bearer ${token}`,
    'User-Agent': 'prantlf/install-release-action',
    'X-GitHub-Api-Version': '2022-11-28'
	})
  if (res.message.statusCode !== 200) {
    const err = new Error(`GET ${url} failed: ${res.message.statusCode} ${res.message.statusMessage}`)
    err.response = res
    throw err
  }
  return JSON.parse(await res.readBody())
}

function delay() {
  const delay = (5 + 5 * Math.random()) * 1000
  core.info(`Wait ${delay} ms before trying again`)
  return new Promise(resolve => setTimeout(resolve, delay))
}

async function retry(action) {
  for (let attempt = 0;;) {
    try {
      return await action()
    } catch (err) {
      if (++attempt === 3) throw err
      core.warning(err)
    }
    await delay()
  }
}

function safeRequest(token, repo, path) {
  return retry(() => request(token, repo, path))
}

async function getRelease(token, name, repo, version) {
  const suffixes = getArchiveSuffixes(platformSuffixes, archSuffixes)
  const archives = name && suffixes.map(suffix => `${name}${suffix}`)
  const releases = await safeRequest(token, repo, 'releases')
  core.debug(`${releases.length} releases found`)
  for (let { tag_name: tag, created_at: date, assets } of releases) {
    const cleanedTag = clean(tag)
    if (cleanedTag) tag = cleanedTag;
    core.debug(`Check tag ${tag}`)
    if (valid(tag) && (version === 'latest' || satisfies(tag, version))) {
      for (const { name: file, browser_download_url: url } of assets) {
        core.debug(`Check asset ${file}`)
        if (archives) {
          if (archives.includes(file)) return { name, tag, date, url }
        } else {
          const suffix = suffixes.find(suffix => file.endsWith(suffix))
          if (suffix) {
            const name = file.substring(0, file.length - suffix.length)
            return { name, tag, date, url }
          }
        }
      }
      throw new Error(`no suitable archive found for ${tag}`)
    }
  }
  throw new Error(`version matching "${version}" not found`)
}

async function getVersion(exePath) {
  let out
  await exec(exePath, ['-V'], {
    listeners: {
      stdout: data => {
        out = out ? Buffer.concat([out, data]) : data
      }
    }
  })
  return out.toString().trim()
}

async function install(url, name, tag, useCache)  {
  const exeDir = join(workspace, `../${name}-${tag}`)
  let exe = name
  if (platform === 'win32') exe += '.exe'
  const exePath = join(exeDir, exe)
  core.debug(`Executable expected at "${exePath}"`)

  let usedCache = true

  if (useCache && await exists(exePath)) {
    core.info(`"${exePath}" found on disk`)
  } else {
    let cacheDir = useCache && tc.find(name, tag)

    if (cacheDir) {
      core.info(`"${cacheDir}" found in cache`)
    } else {
      usedCache = false
      let archive

      try {
        if (await exists(exeDir)) io.rmRF(exeDir)

        core.info(`Download "${url}"`)
        archive = await retry(() => tc.downloadTool(url))

        core.info(`Extract "${exe}" to "${exeDir}"`)
        await io.mkdirP(exeDir)
        await tc.extractZip(archive, exeDir)

        try {
          if (useCache) {
            cacheDir = await tc.cacheDir(exeDir, name, tag)
            core.info(`Cached "${cacheDir}"`)
          }
        } catch (err) {
          await io.rmRF(exeDir)
          throw err
        }
      } finally {
        archive && await io.rmRF(archive)
      }
    }

    if (!(await exists(exePath))) {
      core.info(`Link "${exeDir}"`)
      if (await exists(exeDir)) await io.rmRF(exeDir)
      await symlink(cacheDir, exeDir, 'junction')
    }
  }

  return { exeDir, exePath, usedCache }
}

async function run() {
  const repo = core.getInput('repo')
  if (!repo) throw new Error('missing repo')
  let version = core.getInput('version')
  const cleanedVersion = clean(version)
  if (cleanedVersion) version = cleanedVersion;
  const name = core.getInput('name')
  const useCache = core.getBooleanInput('use-cache')
  core.info(`Download ${version} from ${repo}${name ? 'named ' + name : ''}${useCache ? '' : ', no cache'}`)
  platformSuffixes = getMapOfArrays('platforms')
  archSuffixes = getMapOfArrays('architectures')

  const token = core.getInput('token') || envToken
  if (!token) throw new Error('missing token')

  if (workspace) workspace = resolve(workspace)
  else throw new Error('missing workspace')

  const { name: name2, tag, date, url } = await getRelease(token, name, repo, version)
  core.info(`Resolved ${name2} ${tag} from ${date} at ${url}`)

  const { exeDir, exePath, usedCache } = await install(url, name2, tag, useCache)

  core.info(`Add "${exeDir}" to PATH`)
  core.addPath(exeDir)

  const actualVersion = await getVersion(exePath)
  core.setOutput('version', actualVersion)
  core.setOutput('bin-path', exeDir)
  core.setOutput('exe-path', exePath)
  core.setOutput('used-cache', usedCache)
}

run().catch(err => core.setFailed(err))
