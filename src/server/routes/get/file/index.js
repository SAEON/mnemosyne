import { stat } from 'fs/promises'
import streamFile from './_stream-file.js'
import { parseRangeHeader } from '../../../../lib/http-fns.js'

export default async function serveFile({
  req,
  res,
  resource: {
    _paths: [{ path: file }],
  },
}) {
  const { size: contentLength } = await stat(file)
  const { range } = req.headers

  if (range) {
    const ranges = parseRangeHeader(range, contentLength)
    for (const { start, end } of ranges) {
      // Invalid range
      if (start === null || end === null || start >= contentLength || end >= contentLength) {
        res.writeHead(416, { 'Content-Range': `bytes */${contentLength}` })
        return res.end()
      }

      // Valid range
      res.statusCode = 206
      res.setHeader('Content-Range', `bytes ${start}-${end}/${contentLength}`)
      res.setHeader('Accept-Ranges', 'bytes')
      await streamFile({
        size: contentLength,
        contentLength: end - start + 1,
        request: req,
        response: res,
        file,
        start,
        end,
      })
    }
  } else {
    res.statusCode = 200
    streamFile({ size: contentLength, contentLength, request: req, response: res, file })
  }
}
