import { Transform } from 'stream'

// Default bytes per second
const MAX_BYTES_PER_SECOND = 1e9 // 1 GB/s

// Create a custom transform stream that throttles the rate of data
class ThrottleTransform extends Transform {
  constructor(options) {
    super(options)
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
    const expectedBytes = elapsedTime * (this.bytesPerSecond / 1000)
    const remainingBytes = expectedBytes - this.byteCount

    if (remainingBytes <= 0) {
      // Pause the stream until the remaining bytes have been processed
      this.pause()
      setTimeout(() => {
        this.resume()
        callback(null, chunk)
      }, Math.abs(remainingBytes / this.bytesPerSecond) * 1000)
    } else {
      callback(null, chunk)
    }
  }
}

export default ThrottleTransform
