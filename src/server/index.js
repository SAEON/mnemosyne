import { createServer } from 'http'
import { info, error } from '../logger/index.js'
import { options, head, get, put, post, httpDelete } from './routes/index.js'
import applyMiddleware, {
  cors,
  checkContinue,
  userinfo,
  parseResource,
  createContext,
} from './middleware/index.js'
import { res404, res500 } from '../lib/http-fns.js'

// Exported to be testable
export const httpCallback = async (req, res) => {
  info('HTTP request path', req.url)
  const ctx = createContext(req, res, server)

  try {
    // Apply middleware
    await applyMiddleware(ctx, userinfo, parseResource, cors)

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
        res404(res)
        break
    }
  } catch (e) {
    error('Unexpected server error', e)
    res500(res)
  }
}

// Exported to be testable
export const checkContinueHandler = async (req, res) =>
  await applyMiddleware(
    createContext(req, res, server),
    userinfo,
    parseResource,
    cors,
    checkContinue,
  )

var server = createServer(httpCallback)
server.on('checkContinue', checkContinueHandler)

export default server
