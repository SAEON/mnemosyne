import { stat } from 'fs/promises'
import mime from 'mime'
import { createReadStream } from 'fs'

export default async (req, res, file) => {
  const { size } = await stat(file)
  const { range } = req.headers
  const contentType = mime.getType(file)

  /**
   * Support requests with range
   * or without range specification
   */
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

    // Otherwise serve partial content (206)
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': contentType,
    })

    const readable = createReadStream(file, { start, end })
    readable.pipe(res)
  } else {
    res.writeHead(200, {
      'Content-Length': size,
      'Content-Type': contentType,
    })

    const readable = createReadStream(file)
    readable.pipe(res)
  }
}
