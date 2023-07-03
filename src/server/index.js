import { createServer } from 'http'
import { info, error } from '../logger/index.js'
import { options, head, get, put, _404, post, httpDelete } from './routes/index.js'
import parseResource from './middleware/parse-resource.js'
import setResponseHeaders from './middleware/set-response-headers.js'
import checkContinue from './middleware/check-continue.js'

/**
 * httpCallback
 * Exported for testing purposes
 *
 * @param {Object} req HTTP Request object
 * @param {Object} res HTTP Response object
 */
export const httpCallback = async (req, res) => {
  info('HTTP request path', req.url)
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

      case 'POST':
        await post.call(ctx, req, res)
        break

      case 'DELETE':
        await httpDelete.call(ctx, req, res)
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
}

/**
 * checkContinue handler
 *
 * Exported for testing reasons
 * @param  {...any} args
 */
export const checkContinueHandler = async (...args) => {
  await checkContinue.call(server, ...args)
}

const server = createServer(httpCallback)
server.on('checkContinue', checkContinueHandler)

export default server
