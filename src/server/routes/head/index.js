import { stat } from 'fs/promises'
import mime from 'mime'
import { parseRangeHeader } from '../get/file/index.js'

export default async function () {
  const {
    req: request,
    res: response,
    resource: { _paths },
  } = this

  if (_paths.length > 1) {
    const msg =
      "Conflict. An ambiguous resource path was provided. Please include the 'v' (volume) and 'e' (entry) URL parameters to specify the desired resource unambiguously."
    response.writeHead(409, msg, { 'Content-Type': 'text/plain' })
    response.write(msg)
    response.end()
    return
  }

  const { path } = _paths[0]

  const { range } = request.headers

  let contentLength
  let contentType
  try {
    contentLength = (await stat(path)).size
    contentType = mime.getType(path)
  } catch (error) {
    response.statusCode = 404
    response.end()
    return
  }

  if (range) {
    const { start, end } = parseRangeHeader(range, contentLength)

    if (start === null || end === null || start >= contentLength || end >= contentLength) {
      response.writeHead(416, { 'Content-Range': `bytes */${contentLength}` })
      return response.end()
    }

    // Otherwise serve range-accepting response
    response.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${contentLength}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': contentType,
    })
  } else {
    response.writeHead(200, {
      'Content-Length': contentLength,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
    })
  }

  response.end()
}
