import { stat } from 'fs/promises'
import streamFile from './_stream-file.js'

export default async function () {
  const {
    req: request,
    res: response,
    resource: { absolutePath: file },
  } = this

  const { size: contentLength } = await stat(file)
  const { range } = request.headers

  /**
   * Support requests with range
   * or without range specification
   */
  if (range) {
    // Extract Start and End value from Range Header
    let [start, end] = range.replace(/bytes=/, '').split('-')
    start = parseInt(start, 10)
    end = end ? parseInt(end, 10) : contentLength - 1

    // Check that range-start is a valid number
    if (isNaN(start) && !isNaN(end)) {
      start = contentLength - end
      end = contentLength - 1
    }

    // Check that range-end is a valid number
    if (!isNaN(start) && isNaN(end)) {
      start = start
      end = contentLength - 1
    }

    // Handle unavailable range (416. Range not suitable)
    if (start >= contentLength || end >= contentLength) {
      response.writeHead(416, {
        'Content-Range': `bytes */${contentLength}`,
      })
      return response.end()
    }

    // Otherwise serve partial content (206)
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
  } else {
    response.statusCode = 200
    streamFile({ size: contentLength, contentLength, request, response, file })
  }
}
