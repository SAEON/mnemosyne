import { Transform } from 'stream'

const CHUNK_SIZE = 1e7 // 10 MB

class ThrottleTransform extends Transform {
  constructor(options) {
    super({ ...options, highWaterMark: options?.chunkSize || CHUNK_SIZE })
    this.chunkSize = options?.bytesPerSecond || CHUNK_SIZE
    this.bytesRead = 0
    this.lastTime = null
    this.delay = 0
  }

  _transform(chunk, encoding, callback) {
    try {
      this.bytesRead += chunk.length
      this.push(chunk)

      const now = Date.now()
      if (this.lastTime === null) {
        this.lastTime = now
      }

      const elapsed = now - this.lastTime
      const bytesPerSecond = this.bytesRead / (elapsed / 1000)

      if (bytesPerSecond > this.chunkSize) {
        this.delay = Math.max(this.delay + elapsed, 0)
      } else {
        this.delay = Math.max(this.delay - elapsed, 0)
      }

      this.lastTime = now
      this.bytesRead = 0

      if (this.delay > 0) {
        setTimeout(() => {
          callback()
        }, this.delay)
      } else {
        callback()
      }
    } catch (err) {
      callback(err)
    }
  }
}

export default ThrottleTransform