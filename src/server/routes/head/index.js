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
    if (!range.toLowerCase().trim().startsWith(`bytes=`)) {
      res.status(416).send('Range Not Satisfiable')
      return
    }

    const ranges = parseRangeHeader(range, contentLength)
    console.log(ranges)

    // Assume that the first valid range should be used for HEAD response.
    const firstValidRange = ranges.find(
      ({ start, end }) =>
        start !== null && end !== null && start < contentLength && end < contentLength,
    )

    if (firstValidRange) {
      // Valid range
      res.writeHead(206, {
        'Content-Range': `bytes ${firstValidRange.start}-${firstValidRange.end}/${contentLength}`,
        'Content-Length': firstValidRange.end - firstValidRange.start + 1,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      })
    } else {
      // Invalid range
      res.writeHead(416, { 'Content-Range': `bytes */${contentLength}` })
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
