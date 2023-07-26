import os from 'os'
import { normalize, join, parse, sep } from 'path'
import { stat, readdir, access, lstat, rmdir, unlink } from 'fs/promises'
import { nanoid } from 'nanoid'
import { error } from '../logger/index.js'

// Don't forget to handle errors!
export async function deletePath(path) {
  const stats = await lstat(path)
  if (stats.isDirectory()) {
    await rmdir(path, { recursive: false })
  } else if (stats.isFile()) {
    await unlink(path)
  } else {
    throw new Error('Unexpected file descriptor found - not a directory or a file')
  }
}

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
    const entries = isDirectory
      ? (await readdir(normalizedPath)).sort((a, b) => {
          const nameA = a.split('.').slice(0, -1).join('.')
          const nameB = b.split('.').slice(0, -1).join('.')
          if (nameA !== nameB) {
            return nameA.localeCompare(nameB)
          } else {
            return a.localeCompare(b)
          }
        })
      : undefined
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
    }),
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
  } catch {
    return false
  }
}

export const validatePath = paths => {
  // If the paths array doesn't contain exactly one item, return undefined
  if (paths?.length !== 1) return undefined

  // Return the first path in the array
  const [firstPath] = paths
  return firstPath.path
}

