import { createServer } from 'http'
import { info, error } from '../logger/index.js'
import options from './routes/options/index.js'
import head from './routes/head/index.js'
import get from './routes/get/index.js'
import put from './routes/put/index.js'
import _404 from './routes/404.js'
import parseResource from './middleware/parse-resource.js'
import setResponseHeaders from './middleware/set-response-headers.js'
import checkContinue from './middleware/check-continue.js'

const server = createServer(async (req, res) => {
  // Log incoming request
  info('HTTP request path', req.url)

  // Create request context
  const ctx = { req, res, server }

  try {
    // Apply middleware
    await parseResource.call(ctx)
    await setResponseHeaders.call(ctx)

    // Route request based on method
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
    // Handle unexpected server error
    error('Unexpected server error', e)
    res.statusCode = 500
    res.end()
  }
}).on('checkContinue', async (...args) => await checkContinue.call(server, ...args))

export default server
