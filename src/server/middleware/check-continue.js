import { access } from 'fs/promises'
import authorize from '../../lib/authorize.js'
import { res401, res409 } from '../../lib/http-fns.js'
import { validatePath } from '../../lib/path-fns.js'

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
export default async function () {
  const {
    server,
    auth: { user },
    resource: { _paths },
    req,
    res,
  } = this

  // Validate the path
  const path = validatePath(_paths)

  // Ensure that user has permission for the requested path
  if (!authorize(user, path)) {
    res401(res)
    return
  }

  // Check if the resource exists
  const exists = await access(path)
    .then(() => true)
    .catch(() => false)

  if (exists) {
    // PUT not allowed
    if (req.method === 'PUT') {
      res409(res)
      return
    }

    // POST and DELETE are allowed
  }

  // Otherwise continue the request
  res.writeContinue()
  server.emit('request', req, res)
}
