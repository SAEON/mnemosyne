import { stat } from 'fs/promises'
import streamFile from './_stream-file.js'

export default async function () {
  const {
    req,
    res,
    resource: { absolutePath: file },
  } = this

  const { size } = await stat(file)
  const { range } = req.headers

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
    res.statusCode = 206
    res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`)
    res.setHeader('Accept-Ranges', 'bytes')
    streamFile(size, end - start + 1, req, res, file, start, end)
  } else {
    res.statusCode = 200
    streamFile(size, size, req, res, file)
  }
}
