import { stat } from 'fs/promises'
import mime from 'mime'

export default async function () {
  const {
    req,
    res,
    resource: { absolutePath: file },
  } = this

  const { range } = req.headers

  let size
  let contentType
  try {
    size = (await stat(file)).size
    contentType = mime.getType(file)
  } catch (error) {
    res.statusCode = 404
    res.end()
  }

  if (range) {
    // Extract Start and End value from Range Header
    let [start, end] = range.replace(/bytes=/, '').split('-')
    start = parseInt(start, 10)
    end = end ? parseInt(end, 10) : size - 1

    // Check that range-start is a valid number
    if (isNaN(start) && !isNaN(end)) {
      start = size - end
      end = size - 1
    }

    // Check that range-end is a valid number
    if (!isNaN(start) && isNaN(end)) {
      start = start
      end = size - 1
    }

    // Handle unavailable range (416. Range not suitable)
    if (start >= size || end >= size) {
      res.writeHead(416, {
        'Content-Range': `bytes */${size}`,
      })
      return res.end()
    }

    // Otherwise serve range-accepting response
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': contentType,
    })
  } else {
    res.writeHead(200, {
      'Content-Length': size,
      'Content-Type': contentType,
    })
  }

  res.end()
}
