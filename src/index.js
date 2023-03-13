import server from './server/index.js'
import { PORT, HOSTNAME } from './config/index.js'
import { info, error } from './logger/index.js'

server.listen(PORT, HOSTNAME, () => {
  info('===============================================')
  info(`MNEMOSYNE SERVER STARTED on http://${HOSTNAME}:${PORT}`)
  info('===============================================')
})

process.on('uncaughtException', err => {
  error(err)
})
