import { createServer } from 'http'
import { info, error } from '../logger/index.js'
import options from './routes/options/index.js'
import head from './routes/head/index.js'
import get from './routes/get/index.js'
import put from './routes/put/index.js'
import _404 from './routes/404.js'
import parseResource from './middleware/parse-resource.js'
import setResponseHeaders from './middleware/set-response-headers.js'

const server = createServer(async (req, res) => {
  info('HTTP request path', req.url)

  // Request context
  const ctx = { req, res }

  try {
    // Middleware
    await parseResource.call(ctx)
    await setResponseHeaders.call(ctx)

    // Router
    switch (req.method?.toUpperCase()) {
      case 'HEAD':
        await head.call(ctx, req, res)
        break

      case 'OPTIONS':
        await options.call(ctx, req, res)
        break

      case 'GET':
        await get.call(ctx, req, res)
        break

      case 'PUT':
        await put.call(ctx, req, res)
        break

      default:
        await _404.call(ctx, req, res)
        break
    }
  } catch (e) {
    error('Unexpected server error', e)
    res.statusCode = 500
    res.end()
  }
})

export default server
