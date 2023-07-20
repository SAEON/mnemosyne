import { info } from '../../logger/index.js'
import { bytesToHumanReadable } from '../../lib/helper-fns.js'

export default function (args) {
  info(`Node.js ${process.version}`)
  info()
  info('--hostname', args.hostname)
  info('--port', args.port)
  info('--throttle-downloads', `${bytesToHumanReadable(args['throttle-downloads'])}/s`)
  args.volume?.forEach(v => {
    info('--volume', v)
  })
  if (args.key) info('--key', '***')
  args.login?.forEach(v => {
    info('--login', v)
  })
  info()
}
