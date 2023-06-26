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
