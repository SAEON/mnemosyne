import { access } from 'fs/promises'
import { KEY } from '../../../config/index.js'
import { createResource } from '../post/index.js'
import authenticate from '../../../lib/authenticate.js'

export default async function () {
  const {
    req,
    res,
    resource: {
      _paths,
      url: { href },
    },
  } = this

  // Ensure that uploads are enabled for this server
  if (!KEY) {
    res.writeHead(405, { 'Content-Type': 'text/plain' })
    res.write('PUT has been disabled for this server')
    res.end()
    return
  }

  // Ensure that a valid token is used
  try {
    authenticate(req)
  } catch (e) {
    error(e)
    res.statusCode = 401
    res.write('Unauthorized')
    res.end()
    return
  }

  // Check if the resource exists
  let exists
  try {
    await access(path)
    exists = true
  } catch {
    exists = false
  }

  // If it exists return 409
  if (exists) {
    const msg = 'Conflict. Upload path already exists'
    res.writeHead(409, msg, { 'Content-Type': 'text/plain' })
    res.write(msg)
    res.end()
    return
  }

  return createResource.call(this)
}
