import parseResource from './parse-resource.js'
import { error, info } from '../../logger/index.js'
import { access } from 'fs/promises'
import authorize from '../../lib/authorize.js'
import { res204, res401, res409 } from '../../lib/http-fns.js'

/**
 * This middleware function is only called
 * for POST and PUT requests, when a client
 * wants to check that it can send a large
 * payload of data. So assume the attempt
 * is to write a resource.
 *
 * In the future it may be necessary to update
 * to allow GET requests with large bodies.
 *
 * (i.e. in the future it may be that non-
 * authenticated requests to this may be
 * required. For now, authentication is
 * necessary)
 */
export default async function (req, res) {
  const server = this

  const ctx = { req, res }
  await parseResource.call(ctx)

  const {
    resource: {
      _paths: [{ path }],
    },
  } = ctx

  try {
    const user = authorize(req)
    info('Authenticated (checkContinue)', user, path)
  } catch (e) {
    error(e)
    res401(res)
    return
  }

  if (req.method === 'DELETE' && !path) {
    res204(res)
    return
  }

  // Check if the resource exists
  const exists = await access(path)
    .then(() => true)
    .catch(() => false)

  if (exists) {
    if (req.method === 'PUT') {
      res409(res)
      return
    }
  }

  // Otherwise continue the request
  res.writeContinue()
  server.emit('request', req, res)
}
