import parseResource from './parse-resource.js'
import { error, info } from '../../logger/index.js'
import { access } from 'fs/promises'
import authenticate from '../../lib/authenticate.js'

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
    resource: { _paths },
  } = ctx

  try {
    const user = authenticate(req)
    info('Authenticated (checkContinue)', user, _paths.map(({ path }) => path).join('\n '))
  } catch (e) {
    error(e)
    res.statusCode = 401
    res.write('Unauthorized')
    res.end()
    return
  }

  // Check if the resource exists
  const exists = await access(_paths)
    .then(() => true)
    .catch(() => false)

  // If it exists return 409
  if (exists) {
    // TODO - only respond this to authenticated users
    const msg = 'Conflict. Upload path already exists'
    res.writeHead(409, msg)
    res.write(msg)
    res.end()
    return
  }

  // Otherwise continue the request
  res.writeContinue()
  server.emit('request', req, res)
}
