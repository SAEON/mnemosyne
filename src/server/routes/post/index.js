import { KEY } from '../../../config/index.js'
import { createWriteStream } from 'fs'
import { isPathAccessible, getTempDir, getValidatedPath } from '../../../lib/path-fns.js'
import { unlink, rename, rmdir } from 'fs/promises'
import { error } from '../../../logger/index.js'
import { mkdirp } from 'mkdirp'
import { dirname, join, normalize, basename } from 'path'
import authenticate from '../../../lib/authenticate.js'
import { res201, res400, res401, res405, res500 } from '../../../lib/http-fns.js'

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

  // Ensure that a valid token is used
  try {
    authenticate(req)
  } catch (e) {
    error(e)
    res401(res)
    return
  }

  // Validate the path
  const path = getValidatedPath(res, _paths)
  if (!path) return

  /**
   * Unlike with PUT requests,
   * if the resource already exists
   * then upload to a temp path, and once
   * completed, mv the temp file to the
   * intended location. This makes the
   * update atomic
   */
  let tempDir = undefined
  let tempPath = undefined
  if (await isPathAccessible(path)) {
    tempDir = await getTempDir()
    tempPath = normalize(join(tempDir, basename(path)))
  }

  // Get upload path
  const dir = dirname(path)

  // Ensure dir exists
  await mkdirp(dir)

  // Stream file contents to disk
  const stream = createWriteStream(tempPath || path)

  // Delete failed uploads
  stream.on('error', async err => {
    await unlink(tempPath || path)
    if (tempDir) await unlink(tempDir)
    error(err)
    res500(res)
  })

  // Keep track of how much is received
  let received = 0
  req.on('data', chunk => {
    received += chunk.length
    console.info(`[${tempPath || path}] Received ${received} bytes`)
  })

  req.pipe(stream)

  // Handle aborted requests
  req.on('aborted', async () => {
    error('Connection terminated by client')
    await unlink(tempPath || path)
    if (tempDir) await unlink(tempDir)
    res400(res)
  })

  // Respond with success
  await new Promise(resolve => {
    stream.on('close', async () => {
      const msg = `Received ${received} bytes`
      if (tempPath) {
        await rename(tempPath, path)
        await unlink(tempPath)
        await rmdir(tempDir)
      }
      console.info(`[${path}] complete`)
      res201({ res, msg, href })
      resolve()
    })
  })
}
