import { KEY } from '../../../config/index.js'
import { createWriteStream } from 'fs'
import { unlink } from 'fs/promises'
import { error, info } from '../../../logger/index.js'
import { mkdirp } from 'mkdirp'
import { dirname } from 'path'
import authorize from '../../../lib/authorize.js'
import { isPathAccessible, validatePath } from '../../../lib/path-fns.js'
import { res201, res400, res401, res405, res409, res500 } from '../../../lib/http-fns.js'

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
    res405(res)
    return
  }

  // Validate the path
  const path = validatePath(_paths)

  // Ensure that user has permission for the requested upload path
  if (!authorize(user, path)) {
    res401(res)
    return
  }

  // Check if resource already exists
  if (await isPathAccessible(path)) {
    res409(res)
    return
  }

  // Get upload path
  const dir = dirname(path)

  // Ensure dir exists
  await mkdirp(dir)

  // Stream file contents to disk
  const stream = createWriteStream(path)

  // Delete failed uploads
  stream.on('error', async err => {
    await unlink(path)
    error(err)
    res500(res)
  })

  // Keep track of how much is received
  let received = 0
  req.on('data', chunk => {
    received += chunk.length
    info(`[${path}] Received ${received} bytes`)
  })

  req.pipe(stream)

  // Handle aborted requests
  req.on('aborted', async () => {
    error('Connection terminated by client')
    await unlink(path)
    res400(res)
  })

  // Respond with success
  await new Promise(resolve => {
    stream.on('close', async () => {
      const msg = `Received ${received} bytes`
      info(`[${path}] complete`)
      res201({ res, msg, href })
      resolve()
    })
  })
}
