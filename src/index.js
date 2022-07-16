import server from './server.js'
import { PORT, HOSTNAME } from './args.js'
import { info } from './log.js'

server.listen(PORT, HOSTNAME, () => {
  info('===============================================')
  info(`MNEMOSYNE SERVER STARTED on http://${HOSTNAME}:${PORT}`)
  info('===============================================')
})
