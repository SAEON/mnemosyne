import server from './server/index.js'
import { PORT, HOSTNAME } from './config/index.js'
import { info } from './logger/index.js'

server.listen(PORT, HOSTNAME, () => {
  info('===============================================')
  info(`MNEMOSYNE SERVER STARTED on http://${HOSTNAME}:${PORT}`)
  info('===============================================')
})
