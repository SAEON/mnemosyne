import os from 'os'
import { normalize, join, parse, sep } from 'path'
import { stat, readdir, access } from 'fs/promises'
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

async function checkDirExists(volume, pathname) {
  const dir = parse(pathname).dir.split(sep).filter(Boolean)[0] || '/'
  try {
    await stat(normalize(join(volume, dir)))
    return true
  } catch (error) {
    return false
  }
}

async function fetchPathStats(normalizedPath) {
  try {
    const stats = await stat(normalizedPath)
    const size = stats.size
    const isFile = stats.isFile()
    const isDirectory = stats.isDirectory()
    const entries = isDirectory ? (await readdir(normalizedPath)).sort() : undefined
    return { stats, size, isFile, isDirectory, entries }
  } catch (error) {
    return undefined
  }
}

export async function getAbsolutePath(volume, pathname, i, method) {
  const normalizedPath = normalize(join(volume, pathname))

  if (['PUT', 'POST'].includes(method)) {
    const dirExists = await checkDirExists(volume, pathname)
    if (dirExists) {
      return { path: normalizedPath }
    }
  } else {
    const pathStats = await fetchPathStats(normalizedPath)
    if (pathStats) {
      return {
        path: normalizedPath,
        ...pathStats,
        v: i,
      }
    }
  }
  return undefined
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

export const validatePath = (response, paths, shouldSkipResponse = false) => {
  // If the paths array doesn't contain exactly one item, return undefined
  if (paths.length !== 1) {
    // Only send response if not skipped
    if (!shouldSkipResponse) {
      const message =
        'Conflict. Ambiguous upload path specified targeting multiple possible volumes. Please specify an existing root directory.'
      res409(response, message)
    }
    return undefined
  }

  // Return the first path in the array
  const [firstPath] = paths
  return firstPath.path
}

