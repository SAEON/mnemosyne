import os from 'os'
import { normalize, join, parse, sep } from 'path'
import { stat, readdir } from 'fs/promises'

export function getCacheDir() {
  switch (process.platform) {
    case 'darwin':
      return join(os.homedir(), 'Library', 'Caches', 'mnemosyne')
    case 'win32':
      return join(process.env.LOCALAPPDATA || os.homedir(), 'AppData', 'Local', 'mnemosyne-cache')
    default:
      return join(process.env.XDG_CACHE_HOME || os.homedir(), '.cache', 'mnemosyne')
  }
}

export async function getAbsolutePath(volume, pathname, i, method) {
  const normalizedPath = normalize(join(volume, pathname))

  /**
   * Some requests specify a
   * path that doesn't exist yet
   *  => PUT
   */
  if (method === 'PUT') {
    const dir =
      parse(pathname)
        .dir.split(sep)
        .filter(_ => _)[0] || '/'

    try {
      await stat(normalize(join(volume, dir)))
      return { path: normalizedPath }
    } catch (error) {
      return undefined
    }
  }

  /**
   * Other requests specify a
   * path that needs to already
   * exist
   *  => GET
   *  => HEAD
   *  => OPTIONS
   *  => POST
   */

  try {
    const stats = await stat(normalizedPath)
    const size = stats.size
    const isFile = stats.isFile()
    const isDirectory = stats.isDirectory()
    const entries = isDirectory ? (await readdir(normalizedPath)).sort() : undefined
    return {
      path: normalizedPath,
      stats,
      size,
      isFile,
      isDirectory,
      entries,
      v: i,
    }
  } catch (error) {
    return undefined
  }
}

/**
 * Make sure to pass SORTED directories array!
 * This allows for mounting directories with duplicated
 * filenames, and retrieving the correct file
 **/
export async function getAbsolutePaths(volumes, pathname, method) {
  const paths = await Promise.all(
    volumes.map(async (volume, i) => {
      return await getAbsolutePath(volume, pathname, i, method)
    })
  )
  return paths.filter(Boolean)
}
