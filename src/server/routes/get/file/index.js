import { stat } from 'fs/promises'
import streamFile from './_stream-file.js'
import { parseRangeHeader } from '../../../../lib/http-fns.js'

export default async function serveFile({
  id,
  req,
  res,
  resource: {
    _paths: [{ path: file }],
    Transform,
  },
}) {
  const { size: contentLength } = await stat(file)
  const { range } = req.headers

  if (range) {
    if (!range.toLowerCase().trim().startsWith(`bytes=`)) {
      res.status(416).send('Range Not Satisfiable')
      return
    }

    const ranges = parseRangeHeader(range, contentLength)
    // If multiple ranges are specified, only use the first valid one
    const validRanges = ranges.filter(
      ({ start, end }) =>
        start !== null && end !== null && start < contentLength && end < contentLength,
    )
    if (validRanges.length === 0) {
      res.writeHead(416, { 'Content-Range': `bytes */${contentLength}` })
      return res.end()
    }
    const { start, end } = validRanges[0]
    res.statusCode = 206
    res.setHeader('Content-Range', `bytes ${start}-${end}/${contentLength}`)
    res.setHeader('Accept-Ranges', 'bytes')
    await streamFile.call(this, {
      id,
      size: contentLength,
      contentLength: end - start + 1,
      request: req,
      response: res,
      file,
      Transform,
      start,
      end,
    })
  } else {
    res.statusCode = 200
    streamFile.call(this, {
      id,
      size: contentLength,
      contentLength,
      request: req,
      response: res,
      file,
      Transform,
    })
  }
}
