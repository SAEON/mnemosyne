import { stat } from 'fs/promises'
import mime from 'mime'
import { parseRangeHeader } from '../../../lib/http-fns.js'
import { validatePath } from '../../../lib/path-fns.js'
import { res409 } from '../../../lib/http-fns.js'

export default async function ({ req, res, resource: { _paths } }) {
  const path = validatePath(_paths)
  if (!path) {
    res409(res)
    return
  }

  const { range } = req.headers

  let contentLength
  let contentType
  try {
    contentLength = (await stat(path)).size
    contentType = mime.getType(path)
  } catch (error) {
    res.statusCode = 404
    res.end()
    return
  }

  if (range) {
    const ranges = parseRangeHeader(range, contentLength)
    for (const { start, end } of ranges) {
      // Invalid range
      if (start === null || end === null || start >= contentLength || end >= contentLength) {
        res.writeHead(416, { 'Content-Range': `bytes */${contentLength}` })
        return res.end()
      }

      // Valid range
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${contentLength}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': contentType,
      })
    }
  } else {
    res.writeHead(200, {
      'Content-Length': contentLength,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
    })
  }

  res.end()
}
