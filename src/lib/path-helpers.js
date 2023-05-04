import os from 'os'
import { normalize, join } from 'path'
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

export async function getAbsolutePath(directory, pathname, i) {
  const normalizedPath = normalize(join(directory, pathname))
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

// Make sure to pass SORTED directories array!
export async function getAbsolutePaths(directories, pathname) {
  const paths = await Promise.all(
    directories.map((volume, i) => getAbsolutePath(volume, pathname, i))
  )
  return paths.filter(Boolean)
}
