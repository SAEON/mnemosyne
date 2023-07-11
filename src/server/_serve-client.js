import { createReadStream } from 'fs'
import { access, constants as fsConstants } from 'fs/promises'
import path from 'path'
import mime from 'mime'
import { error } from '../logger/index.js'
import { res404, res500 } from '../lib/http-fns.js'
import { basePath } from '../config/index.js'

export default async function (res, _pathname) {
  // The request already points to /client/*
  const pathname = path.join(basePath, _pathname)

  try {
    // Check if file exists
    await access(pathname, fsConstants.F_OK)

    // Use the mime library to get the MIME type based on the file extension
    const mimeType = mime.getType(pathname)

    // Set the response header
    res.setHeader('Content-type', mimeType || 'text/plain')

    // Create a read stream for the file and pipe it to the response
    const stream = createReadStream(pathname)

    // If an error occurs while reading the file, log it and send a 500 response
    stream.on('error', streamErr => {
      error(streamErr)
      res500(res)
    })

    stream.pipe(res)
  } catch (e) {
    if (e.code === 'ENOENT') {
      res404(res)
    } else {
      error(e)
      res500(res)
    }
  }
}
