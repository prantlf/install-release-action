import * as core from '@actions/core'

const { arch, platform } = process

export function getMapOfArrays(name, getInput) {
  const value = getInput ? getInput(name) : core.getInput(name)
  return value
    .split(/\r?\n/)
    .reduce((map, line) => {
      let [plat, aliases] = line.split(':')
      plat = plat.trim()
      if (!plat) return map
      map[plat] = aliases
        .split(',')
        .map(arch => arch.trim())
        .filter(arch => arch)
      return map
    }, {})
}

export function getArchiveSuffixes(platformSuffixes, archSuffixes) {
  const plats = platformSuffixes[platform] || []
  if (!plats.includes(platform)) plats.push(platform)
  const archs = archSuffixes[arch] || []
  if (!archs.includes(arch)) archs.push(arch)
  return plats.flatMap(plat => archs.map(arch => `-${plat}-${arch}.zip`))
}
