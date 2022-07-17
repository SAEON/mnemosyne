import { createServer } from 'http'
import { info } from '../logger/index.js'
import options from './routes/options/index.js'
import head from './routes/head/index.js'
import get from './routes/get/index.js'
import put from './routes/put/index.js'
import _404 from './routes/404.js'

const server = createServer(async (req, res) => {
  info('HTTP request', req.url)
  const method = req.method?.toUpperCase()

  switch (method) {
    case 'HEAD':
      await head(req, res)
      break

    case 'OPTIONS':
      await options(req, res)
      break

    case 'GET':
      await get(req, res)
      break

    case 'PUT':
      await put(req, res)
      break

    default:
      await _404(req, res)
      break
  }
})

export default server
