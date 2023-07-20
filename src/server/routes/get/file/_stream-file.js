import Accept from '@hapi/accept'
import { createReadStream } from 'node:fs'
import zlib, { createBrotliCompress, createDeflate, createGzip } from 'node:zlib'
import { pipeline } from 'node:stream/promises'
import mime from 'mime'
import { DOWNLOAD_THROTTLE as RATE_LIMIT } from '../../../../config/index.js'
import StreamThrottle from './_stream-throttle.js'
import { error, info } from '../../../../logger/index.js'

const HIGH_WATER = 32768 // 32KB/s

export default async ({ id, size, contentLength, request, response, file, start, end }) => {
  const encoding = Accept.encoding(request.headers['accept-encoding'], ['gzip', 'deflate', 'br'])

  response.setHeader('Content-Type', mime.getType(file))
  response.setHeader('Vary', 'Accept-Encoding')

  if (encoding) {
    response.setHeader('Transfer-Encoding', 'chunked')
  } else {
    response.setHeader('Content-Length', contentLength)
  }

  const raw = createReadStream(file, { start, end })
  const throttleFileRead = new StreamThrottle({ rate: RATE_LIMIT, highWaterMark: HIGH_WATER })
  const throttleResStream = new StreamThrottle({ rate: RATE_LIMIT })

  let transform = null
  let contentEncoding = null
  let streamsToDestroy = [raw, throttleFileRead, transform, throttleResStream] // Keep track of streams to destroy

  switch (encoding) {
    case 'deflate':
      info(id, 'serving deflate')
      contentEncoding = 'deflate'
      transform = createDeflate({
        level: 4,
        finishFlush: zlib.constants.Z_SYNC_FLUSH,
      })
      break

    case 'gzip':
      info(id, 'serving gzip')
      contentEncoding = 'gzip'
      transform = createGzip({
        level: 4,
        finishFlush: zlib.constants.Z_SYNC_FLUSH,
      })
      break

    case 'br':
      info(id, 'serving br')
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
      await pipeline(raw.pipe(throttleFileRead).pipe(transform).pipe(throttleResStream), response)
    } else {
      info(id, 'No content encoding')
      await pipeline(raw.pipe(throttleFileRead).pipe(throttleResStream), response)
    }
  } catch (e) {
    error('An error occurred:', e)
    response.end()
  } finally {
    // Destroy all streams to clean up resources
    streamsToDestroy.forEach(stream => {
      stream?.destroy()
    })
  }
}
