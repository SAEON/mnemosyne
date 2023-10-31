export const parseRangeHeader = function (rangeHeader, contentLength) {
  const ranges = rangeHeader.replace(/bytes=/, '').split(',')

  return ranges.map(range => {
    const [startStr, endStr] = range.split('-')
    const start = parseInt(startStr, 10)
    const end = endStr ? parseInt(endStr, 10) : contentLength - 1

    if (isNaN(start) && isNaN(end)) {
      return { start: null, end: null }
    }

    if (isNaN(start)) {
      return { start: contentLength - end, end: contentLength - 1 }
    }

    if (isNaN(end)) {
      return { start, end: contentLength - 1 }
    }

    return { start, end }
  })
}


export const res201 = ({ res, msg, href }) => {
  res.writeHead(201, {
    'Content-Type': 'text/plain',
    'Content-Location': href,
  })
  res.write(msg)
  res.end()
}

export const res204 = res => {
  res.statusCode = 204
  res.write('No Content')
  res.end()
}

export const res302 = (res, q, pathname) => {
  res.statusCode = 302
  res.setHeader('location', `${pathname}/${q}`)
  res.end()
}

export const res400 = res => {
  res.writeHead(400, { 'Content-Type': 'text/plain' })
  res.write('Bad Request')
  res.end()
}

export const res401 = res => {
  res.statusCode = 401
  res.write('Unauthorized')
  res.end()
}

export const res404 = res => {
  res.statusCode = 404
  res.write('Not Found')
  res.end()
}

export const res405 = res => {
  res.writeHead(405, { 'Content-Type': 'text/plain' })
  res.write('Server started in read-only mode')
  res.end()
}

export const res409 = (res, msg = 'Conflict') => {
  res.writeHead(409, msg, { 'Content-Type': 'text/plain' })
  res.write(msg)
  res.end()
}

export const res500 = res => {
  res.writeHead(500, { 'Content-Type': 'text/plain' })
  res.write('Internal Server Error')
  res.end()
}

export const res501 = res => {
  res.statusCode = 501
  res.write('Not implemented yet')
  res.end()
}
