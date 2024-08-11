const core = require('@actions/core')

const { arch, platform } = process

exports.getMapOfArrays = function getMapOfArrays(name) {
  return core.getInput(name)
    .split(/\r?\n/)
    .reduce((map, line) => {
      let [plat, aliases] = line.split(':');
      plat = plat.trim()
      if (!plat) return map
      map[plat] = aliases
        .split(',')
        .map(arch => arch.trim())
        .filter(arch => arch);
      return map
    }, {})
}

exports.getArchiveSuffixes = function getArchiveSuffixes(platformSuffixes, archSuffixes) {
  const plats = platformSuffixes[platform] || []
  if (!plats.includes(platform)) plats.push(platform)
  const archs = archSuffixes[arch] || []
  if (!archs.includes(arch)) archs.push(arch)
  return plats.flatMap(plat => archs.map(arch => `-${plat}-${arch}.zip`))
}
