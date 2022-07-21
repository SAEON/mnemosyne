import arg from 'arg'
import { join, normalize } from 'path'
import { homedir } from 'os'
import { info, warn } from '../logger/index.js'

const args = {}

const _args = arg({
  '--port': process.env.PORT ? arg.flag(() => process.env.PORT) : Number,
  '--hostname': process.env.HOSTNAME ? arg.flag(() => process.env.HOSTNAME) : String,
  '--key': process.env.KEY ? arg.flag(() => process.env.KEY) : String,
  '--volume': process.env.VOLUME ? arg.flag(() => process.env.VOLUME) : String,
  '-p': '--port',
  '-h': '--hostname',
  '-k': '--key',
  '-v': '--volume',
})

info('Starting mnemosyne server...')
info()

// --port
args.port = _args['--port'] || 3000

// --hostname
args.hostname = _args['--hostname'] || '0.0.0.0'

// --key
if (!_args['--key'] || _args['--key'].toLowerCase() === 'false') {
  warn('*** WARNING ***')
  warn('Authentication key CLI argument (--key) missing.')
  warn('Uploading is disabled')
  warn()
} else {
  args.key = _args['--key']
}

// --volume
if (!_args['--volume'] || _args['--volume'].toLowerCase() === 'false') {
  const volume =
    process.platform === 'darwin'
      ? normalize(join(homedir(), 'Library', 'Caches', 'mnemosyne'))
      : process.platform === 'win32'
      ? normalize(
          join(process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'), 'mnemosyne-cache')
        )
      : normalize(join(process.env.XDG_CACHE_HOME || join(homedir(), '.cache'), 'mnemosyne'))

  warn('*** WARNING ***')
  warn('Volume CLI argument (--volume) missing.')
  warn('Using temporary cache', volume)
  warn()

  args.volume = volume
}

info('--hostname', args.hostname)
info('--port', args.port)
info('--volume', args.volume)
info('--key', args.key ? '***' : undefined)
info()

export const PORT = args.port
export const HOSTNAME = args.hostname
export const VOLUME = args.volume
export const KEY = args.key
