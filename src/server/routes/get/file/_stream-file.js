import Accept from '@hapi/accept'
import { createReadStream } from 'node:fs'
import zlib, { createBrotliCompress, createDeflate, createGzip } from 'node:zlib'
import { pipeline } from 'node:stream'
import mime from 'mime'

export default (size, contentLength, request, response, file, start, end) => {
  response.setHeader('Content-Type', mime.getType(file))
  response.setHeader('Vary', 'Accept-Encoding')

  const raw = createReadStream(file, { start, end })

  const acceptEncoding = Accept.encoding(request.headers['accept-encoding'], [
    'gzip',
    'deflate',
    'br',
  ])

  if (acceptEncoding) {
    response.setHeader('Transfer-Encoding', 'chunked')
  } else {
    response.setHeader('Content-Length', contentLength)
  }

  const onError = err => {
    if (err) {
      response.end()
      console.error('An error occurred:', err)
    }
  }

  switch (acceptEncoding) {
    case 'deflate':
      response.setHeader('Content-Encoding', 'deflate')
      pipeline(
        raw,
        createDeflate({
          level: 4,
          finishFlush: zlib.constants.Z_SYNC_FLUSH,
        }),
        response,
        onError
      )
      break

    case 'gzip':
      response.setHeader('Content-Encoding', 'gzip')
      pipeline(
        raw,
        createGzip({
          level: 4,
          finishFlush: zlib.constants.Z_SYNC_FLUSH,
        }),
        response,
        onError
      )
      break

    case 'br':
      response.setHeader('Content-Encoding', 'br')
      pipeline(
        raw,
        createBrotliCompress({
          flush: zlib.constants.BROTLI_OPERATION_PROCESS,
          finishFlush: zlib.constants.BROTLI_OPERATION_FINISH,
          chunkSize: 16 * 1024,
          params: {
            [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_GENERIC,
            [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
            [zlib.constants.BROTLI_PARAM_SIZE_HINT]: size,
          },
        }),
        response,
        onError
      )
      break

    default:
      pipeline(raw, response, onError)
      break
  }
}
