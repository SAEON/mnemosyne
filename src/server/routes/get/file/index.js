import { stat } from 'fs/promises'
import streamFile from './_stream-file.js'
import { parseRangeHeader } from '../../../../lib/http-fns.js'

export default async function serveFile() {
  const {
    req: request,
    res: response,
    resource: {
      _paths: [{ path: file }],
    },
  } = this

  const { size: contentLength } = await stat(file)
  const { range } = request.headers

  if (range) {
    const ranges = parseRangeHeader(range, contentLength)
    for (const { start, end } of ranges) {
      // Invalid range
      if (start === null || end === null || start >= contentLength || end >= contentLength) {
        response.writeHead(416, { 'Content-Range': `bytes */${contentLength}` })
        return response.end()
      }

      // Valid range
      response.statusCode = 206
      response.setHeader('Content-Range', `bytes ${start}-${end}/${contentLength}`)
      response.setHeader('Accept-Ranges', 'bytes')
      await streamFile({
        size: contentLength,
        contentLength: end - start + 1,
        request,
        response,
        file,
        start,
        end,
      })
    }
  } else {
    response.statusCode = 200
    streamFile({ size: contentLength, contentLength, request, response, file })
  }
}
