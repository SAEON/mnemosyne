import { Transform } from 'stream'

// Default bytes per second
const MAX_BYTES_PER_SECOND = 1e9 // 1 GB/s

// Create a custom transform stream that throttles the rate of data
class ThrottleTransform extends Transform {
  constructor(options) {
    super({ ...options, highWaterMark: options?.bytesPerSecond || MAX_BYTES_PER_SECOND })
    this.bytesPerSecond = options?.bytesPerSecond || MAX_BYTES_PER_SECOND
    this.byteCount = 0
    this.startTime = null
  }

  _transform(chunk, encoding, callback) {
    if (!this.startTime) {
      this.startTime = Date.now()
    }

    this.byteCount += chunk.length

    const elapsedTime = Date.now() - this.startTime
    const expectedBytes = Math.floor(elapsedTime * (this.bytesPerSecond / 1000))
    const remainingBytes = expectedBytes - this.byteCount

    if (remainingBytes <= 0) {
      this.pause()
      const delay = (remainingBytes / this.bytesPerSecond) * 1000
      setTimeout(() => {
        this.resume()
        callback(null, chunk)
      }, delay)
    } else {
      callback(null, chunk)
    }
  }
}

export default ThrottleTransform
