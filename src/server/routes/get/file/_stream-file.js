import { createReadStream } from 'fs'

export default (res, file, start, end) => {
  const stream = createReadStream(file, { start, end })

  stream.on('error', error => {
    console.error(error)
    res.statusCode = 500
    res.end()
  })

  stream.pipe(res)
}
