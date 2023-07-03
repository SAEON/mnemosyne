import os from 'os'
import { normalize, join, parse, sep } from 'path'
import { stat, readdir, access, mkdtemp } from 'fs/promises'
import { res409 } from './http-fns.js'
import { nanoid } from 'nanoid'
import { error } from '../logger/index.js'

/**
 * Don't use os.tmpdir() as that
 * will result in a cache that is
 * reset on computer reboot
 */
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

export const getTempDir = async () => {
  return join(getCacheDir(), nanoid())
}

export async function getAbsolutePath(volume, pathname, i, method) {
  const normalizedPath = normalize(join(volume, pathname))

  /**
   * PUT requests specify a
   * path that doesn't exist yet
   *
   * POST is treated the same as
   * PUT in this case
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

/**
 * Check if a path exists
 * (is accessible or not)
 */
export const isPathAccessible = async p => {
  try {
    await access(p)
    return true
  } catch (err) {
    error(`Error accessing path (ignore) ${p}:`, err)
    return false
  }
}

export const getValidatedPath = (res, _paths) => {
  if (_paths.length !== 1) {
    res409(
      res,
      'Conflict. Ambiguous upload path specified targeting multiple possible volumes. Please specify an existing root directory.'
    )
    return undefined
  }
  const { path } = _paths[0]
  return path
}
