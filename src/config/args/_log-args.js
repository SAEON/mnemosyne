import { info } from '../../logger/index.js'

export default function (args) {
  info(`Node.js ${process.version}`)
  info()
  info('--hostname', args.hostname)
  info('--port', args.port)
  args.volume?.forEach(v => {
    info('--volume', v)
  })
  if (args.key) info('--key', '***')
  args.login?.forEach(v => {
    info('--login', v)
  })
  info()
}
