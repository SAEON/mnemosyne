import Accept from '@hapi/accept'
import { createReadStream } from 'node:fs'
import zlib, { createBrotliCompress, createDeflate, createGzip } from 'node:zlib'
import { pipeline } from 'node:stream/promises'
import mime from 'mime'
import FileStreamThrottle from './_file-stream-throttle.js'
import HttpResStreamThrottle from './_res-stream-throttle.js'

export default async ({ size, contentLength, request, response, file, start, end }) => {
  const encoding = Accept.encoding(request.headers['accept-encoding'], ['gzip', 'deflate', 'br'])

  response.setHeader('Content-Type', mime.getType(file))
  response.setHeader('Vary', 'Accept-Encoding')

  if (encoding) {
    response.setHeader('Transfer-Encoding', 'chunked')
  } else {
    response.setHeader('Content-Length', contentLength)
  }

  const raw = createReadStream(file, { start, end })
  const throttleFileRead = new FileStreamThrottle({ bytesPerSecond: 1e7 }) // 10 MB/s
  const throttleResStream = new HttpResStreamThrottle({ bytesPerSecond: 2e6 }) // 2 MB/s

  let transform = null
  let contentEncoding = null
  switch (encoding) {
    case 'deflate':
      contentEncoding = 'deflate'
      transform = createDeflate({
        level: 4,
        finishFlush: zlib.constants.Z_SYNC_FLUSH,
      })
      break

    case 'gzip':
      contentEncoding = 'gzip'
      transform = createGzip({
        level: 4,
        finishFlush: zlib.constants.Z_SYNC_FLUSH,
      })
      break

    case 'br':
      contentEncoding = 'br'
      transform = createBrotliCompress({
        flush: zlib.constants.BROTLI_OPERATION_PROCESS,
        finishFlush: zlib.constants.BROTLI_OPERATION_FINISH,
        chunkSize: 16 * 1024,
        params: {
          [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_GENERIC,
          [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
          [zlib.constants.BROTLI_PARAM_SIZE_HINT]: size,
        },
      })
      break
  }

  try {
    if (contentEncoding) {
      response.setHeader('Content-Encoding', contentEncoding)
      await pipeline(raw, throttleFileRead, transform, throttleResStream, response)
    } else {
      await pipeline(raw, throttleFileRead, throttleResStream, response)
    }
  } catch (error) {
    console.error('An error occurred:', error)
    response.end()
  }
}
