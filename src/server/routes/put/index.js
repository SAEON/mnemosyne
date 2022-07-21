import { KEY } from '../../../config/index.js'
import { createWriteStream } from 'fs'
import mkdirp from 'mkdirp'
import { stat, access } from 'fs/promises'
import { extname, dirname, basename } from 'path'
import mime from 'mime'

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

  // Check if the resource exists
  const exists = await access(absolutePath)
    .then(() => true)
    .catch(() => false)

  // If it exists return 409
  if (exists) {
    res.statusCode = 409
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
  const filename = basename(absolutePath)

  // Ensure dir exists
  await mkdirp(dir)

  // Stream file contents to disk
  const stream = createWriteStream(absolutePath)
  stream.on('open', () => req.pipe(stream))

  // Wait until the file is written
  await new Promise(resolve => {
    stream.on('close', resolve)
  })

  // Respond with new resource info
  res.writeHead(201, {
    'Content-Location': href,
  })

  res.end()
}
