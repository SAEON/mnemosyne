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

  return [{ start, end }]
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

export const res409 = (res, msg = 'Conflict. Upload path already exists') => {
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
