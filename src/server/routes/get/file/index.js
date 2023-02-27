import { stat } from 'fs/promises'
import streamFile from './_stream-file.js'

export const parseRangeHeader = function (rangeHeader, contentLength) {
  const range = rangeHeader.replace(/bytes=/, '').split('-')
  const start = parseInt(range[0], 10)
  const end = range[1] ? parseInt(range[1], 10) : contentLength - 1

  if (isNaN(start) && isNaN(end)) {
    return { start: null, end: null }
  }

  if (isNaN(start)) {
    return { start: contentLength - end, end }
  }

  if (isNaN(end)) {
    return { start, end: contentLength - 1 }
  }

  return { start, end }
}

export default async function serveFile() {
  const {
    req: request,
    res: response,
    resource: { absolutePath: file },
  } = this

  const { size: contentLength } = await stat(file)
  const { range } = request.headers

  if (range) {
    const { start, end } = parseRangeHeader(range, contentLength)

    if (start === null || end === null || start >= contentLength || end >= contentLength) {
      response.writeHead(416, { 'Content-Range': `bytes */${contentLength}` })
      return response.end()
    }

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
