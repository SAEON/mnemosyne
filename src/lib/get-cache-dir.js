import path from 'path'
import os from 'os'

export default function getCacheDir() {
  switch (process.platform) {
    case 'darwin':
      return path.join(os.homedir(), 'Library', 'Caches', 'mnemosyne')
    case 'win32':
      return path.join(
        process.env.LOCALAPPDATA || os.homedir(),
        'AppData',
        'Local',
        'mnemosyne-cache'
      )
    default:
      return path.join(process.env.XDG_CACHE_HOME || os.homedir(), '.cache', 'mnemosyne')
  }
}
