import { mkdirp } from 'mkdirp'
import { warn } from '../../logger/index.js'
import { getCacheDir } from '../../lib/path-helpers.js'

export default async function configureVolumes(args) {
  if (!args.volume.length) {
    const cacheDir = getCacheDir()
    warn(
      '*** WARNING ***\nVolume CLI argument (--volume) missing.\nUsing temporary cache:',
      cacheDir,
      '\n'
    )
    args.volume = [cacheDir]
  } else {
    await Promise.all(args.volume.map(v => mkdirp(v)))
  }
}
