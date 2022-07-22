import { KEY, decrypt, USERS } from '../../../config/index.js'
import { createWriteStream } from 'fs'
import { error, info } from '../../../logger/index.js'
import mkdirp from 'mkdirp'
import { access } from 'fs/promises'
import { extname, dirname } from 'path'

export default async function () {
  const {
    req,
    res,
    resource: {
      absolutePath,
      url: { href },
    },
  } = this

  // Ensure that uploads are enabled for this server
  if (!KEY) {
    res.writeHead(405, {
      'Content-Type': 'text/plain',
    })
    res.write('PUT has been disabled for this server')
    res.end()
    return
  }

  // Ensure that a valid token is used
  const { authorization } = req.headers
  try {
    if (!authorization) throw 401
    const token = authorization.match(/((?![Bearer\s+])).*$/i)[0]
    const user = decrypt(token)
    if (!USERS.includes(user)) throw 401
    info('Authenticated', user, absolutePath)
  } catch (e) {
    error(e)
    res.statusCode = 401
    res.write('Unauthorized')
    res.end()
    return
  }

  // Check if the resource exists
  const exists = await access(absolutePath)
    .then(() => true)
    .catch(() => false)

  // If it exists return 409
  if (exists) {
    const msg = 'Conflict. Upload path already exists'
    res.writeHead(409, msg)
    res.write(msg)
    res.end()
    return
  }

  // Get resource has a file extension
  const ext = extname(absolutePath)

  // All uploads must have a file extension
  if (!ext) {
    res.writeHead(400, {
      'Content-Type': 'text/plain',
    })
    res.write('All uploads must have a file extension')
    res.end()
    return
  }

  // Get upload path
  const dir = dirname(absolutePath)

  // Ensure dir exists
  await mkdirp(dir)

  // Stream file contents to disk
  const stream = createWriteStream(absolutePath)
  req.pipe(stream)

  // Keep track of how much is received
  let received = 0
  req.on('data', chunk => {
    received += chunk.length
  })

  // Wait until the file is written
  await new Promise(resolve => {
    stream.on('close', resolve)
  })

  // Respond with new resource info
  const msg = `Received ${received} bytes`
  res.writeHead(201, msg, {
    'Content-Type': 'text/plain',
    'Content-Location': href,
  })
  res.write(msg)

  res.end()
}
