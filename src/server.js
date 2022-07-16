import { createServer } from 'http'
import { info } from './log.js'

const server = createServer(async (req, res) => {
  info('HTTP request', req.url)
})

export default server
