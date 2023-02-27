import { Transform } from 'stream'

const CHUNK_SIZE = 1e7 // 10 MB

class ThrottleTransform extends Transform {
  constructor(options) {
    super(options)
    this.chunkSize = options?.bytesPerSecond || CHUNK_SIZE
    this.interval = 1000 // 1 second
    this.bytesRead = 0
  }

  _transform(chunk, encoding, callback) {
    this.bytesRead += chunk.length
    this.push(chunk)

    if (this.bytesRead > this.chunkSize) {
      setTimeout(() => {
        this.bytesRead = 0
        callback()
      }, this.interval)
    } else {
      callback()
    }
  }
}

export default ThrottleTransform
