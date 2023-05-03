import server from './server/index.js'
import { PORT, HOSTNAME } from './config/index.js'
import { info, error } from './logger/index.js'

server.listen(PORT, HOSTNAME, () => {
  info(`MNEMOSYNE SERVER STARTED`)
  info(`View on http://${HOSTNAME}:${PORT}`)
})

process.on('uncaughtException', err => {
  error(err)
})
