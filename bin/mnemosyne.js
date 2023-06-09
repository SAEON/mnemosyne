#!/usr/bin/env node
import server from '../src/server/index.js'
import { PORT, HOSTNAME } from '../src/config/index.js'
import { info, error } from '../src/logger/index.js'

server.listen(PORT, HOSTNAME, () => {
  info(`MNEMOSYNE SERVER STARTED`, '✔️')
  info(`View on http://${HOSTNAME}:${PORT}`)
})

process.on('uncaughtException', err => {
  error(err)
})
