import { Transform } from 'stream'

const CHUNK_SIZE = 1024 // 1 KB

class ThrottleTransform extends Transform {
  constructor(options) {
    super({ ...options, highWaterMark: options?.chunkSize || CHUNK_SIZE })
    this.chunkSize = options?.chunkSize || CHUNK_SIZE
    this.bytesRead = 0
  }

  _transform(chunk, encoding, callback) {
    try {
      this.bytesRead += chunk.length
      this.push(chunk)

      if (this.bytesRead > this.chunkSize) {
        const delay = this.bytesRead / this.chunkSize
        setTimeout(() => {
          this.bytesRead = 0
          callback()
        }, delay)
      } else {
        callback()
      }
    } catch (err) {
      callback(err)
    }
  }
}

export default ThrottleTransform
