import parseResource from './parse-resource.js'
import { access } from 'fs/promises'

export default async function (req, res) {
  const server = this

  const ctx = { req, res }
  await parseResource.call(ctx)

  const {
    resource: { absolutePath },
  } = ctx

  // Check if the resource exists
  const exists = await access(absolutePath)
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
