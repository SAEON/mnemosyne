import { KEY } from '../../../config/index.js'
import { createWriteStream } from 'fs'
import { isPathAccessible, getTempDir, validatePath } from '../../../lib/path-fns.js'
import { unlink, rename, copyFile, rmdir } from 'fs/promises'
import { error, info, warn } from '../../../logger/index.js'
import { mkdirp } from 'mkdirp'
import { dirname, join, normalize, basename } from 'path'
import authorize from '../../../lib/authorize.js'
import { res201, res400, res401, res405, res500 } from '../../../lib/http-fns.js'

export default async function ({
  req,
  res,
  auth: { user },
  resource: {
    _paths,
    url: { href },
  },
}) {
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
    console.log(path)
    tempDir = await getTempDir()
    tempPath = normalize(join(tempDir, basename(path)))
  }

  // Get upload path
  const dir = dirname(path)

  // Ensure dir exists
  await mkdirp(dir)
  if (tempDir) await mkdirp(tempDir)

  // Stream file contents to disk
  const stream = createWriteStream(tempPath || path)

  // Delete failed uploads
  stream.on('error', async err => {
    error(err)
    try {
      await unlink(tempPath || path)
      if (tempDir) await unlink(tempDir)
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err
      }
    }
    res500(res)
  })

  // Keep track of how much is received
  let received = 0
  req.on('data', chunk => {
    received += chunk.length
  })

  // Start the upload
  req.pipe(stream)

  // Handle aborted requests
  req.on('aborted', async () => {
    error('Connection terminated by client')
    try {
      await unlink(tempPath || path)
      if (tempDir) await unlink(tempDir)
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err
      }
    }
    res400(res)
  })

  // Process the request
  await new Promise(resolve => {
    stream.on('close', async () => {
      const msg = `Received ${received} bytes`

      if (tempPath) {
        /**
         * Attempt to rename the file first, as it's the most efficient method.
         * If the cache directory and the target path are on different volumes,
         * this may fail. In such a case, we fall back to copying the file to
         * the new volume and deleting the temp file.
         */
        try {
          await rename(tempPath, path)
          info(`File renamed from [${tempPath}] to [${path}]`)
        } catch (renameErr) {
          warn(
            `Renaming from [${tempPath}] to [${path}] failed. Falling back to copy/delete...`,
            renameErr,
          )
          try {
            await copyFile(tempPath, path)
            await unlink(tempPath)
            info(`File copied from [${tempPath}] to [${path}]`)
          } catch (copyDeleteErr) {
            throw new Error(
              `Failed to copy/delete from [${tempPath}] to [${path}]: ${copyDeleteErr}`,
            )
          }
        }

        // Attempt to remove the temporary directory
        try {
          await rmdir(tempDir)
        } catch (rmdirErr) {
          if (rmdirErr.code !== 'ENOENT') {
            throw new Error(`Failed to remove temporary directory [${tempDir}]: ${rmdirErr}`)
          }
        }
      }

      info(`File transfer to [${path}] completed`)
      res201({ res, msg, href })
      resolve()
    })
  })
}
