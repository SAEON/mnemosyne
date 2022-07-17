import { join, normalize } from 'path'
import { homedir } from 'os'
const argv = process.argv.slice(2)

// Validate argv: one value per flag
argv.forEach((str, i) => {
  if (i % 2 === 0 && !str.startsWith('--')) {
    throw new Error('CLI error. Expected flag (--<flag-name>)')
  }
})

// Validate argv: All flags have a value
if (argv.length % 2) {
  throw new Error('CLI error. Every flag should have a value')
}

// Parse args
const args = argv.reduce((a, c, i) => {
  if (argv[i].startsWith('--')) {
    a[argv[i].replace('--', '')] = argv[i + 1]
  }
  return a
}, {})

// --port
args.port = args.port || 3000

// --hostname
args.hostname = args.hostname || '0.0.0.0'

// --key
if (!args['key']) {
  console.warn(
    '\n*** WARNING ***\nAuthentication key CLI argument (--key) missing.\nUploading is disabled\n'
  )
}

// --volume
if (!args['volume']) {
  const volume =
    process.platform === 'darwin'
      ? normalize(join(homedir(), 'Library', 'Caches', 'mnemosyne'))
      : process.platform === 'win32'
      ? normalize(
          join(process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'), 'mnemosyne-cache')
        )
      : normalize(join(process.env.XDG_CACHE_HOME || join(homedir(), '.cache'), 'mnemosyne'))

  console.warn(
    '\n*** WARNING ***\nVolume CLI argument (--volume) missing.\nUsing temporary cache',
    volume,
    '\n'
  )

  args.volume = volume
}

export const PORT = args.port
export const HOSTNAME = args.hostname
export const VOLUME = args.volume
export const KEY = args['key']
