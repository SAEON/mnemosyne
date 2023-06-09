import { mkdirp } from 'mkdirp'
import { warn } from '../../logger/index.js'
import { getCacheDir } from '../../lib/path-helpers.js'
import { readdir, stat } from 'fs/promises'
import { join, normalize } from 'path'

export default async function configureVolumes(args) {
  if (!args.volume?.length) {
    const cacheDir = getCacheDir()
    warn('*** WARNING ***')
    warn('Volume CLI argument (--volume) missing')
    warn('Using temporary cache:', cacheDir)
    warn()
    args.volume = [cacheDir]
    await Promise.all(args.volume.map(v => mkdirp(v)))
  } else {
    /**
     * Ensure that multiple volumes don't
     * contain the same top level directories.
     * Top level files are fine - but not top level
     * directories
     */
    const index = {}
    for (const volume of args.volume) {
      const entries = await readdir(volume)
      for (const entry of entries) {
        if (index[entry]) {
          throw new Error(
            `Top level directory collision. Volumes cannot have top level directories of the same name (directory: "${entry}"). This makes it impossible to work out the destination of uploads with nested path targets`
          )
        }
        const stats = await stat(normalize(join(volume, entry)))
        if (stats.isDirectory()) {
          index[entry] = 1
        }
      }
    }
  }
}
