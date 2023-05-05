import { info } from '../../logger/index.js'

export default function (args) {
  info(`Node.js ${process.version}`)
  info()
  info('--hostname', args.hostname)
  info('--port', args.port)
  args.volume.forEach(v => {
    info('--volume', v)
  })
  info('--key', args.key ? '***' : undefined)
  args.login.forEach(v => {
    info('--login', v)
  })
  info()
}
