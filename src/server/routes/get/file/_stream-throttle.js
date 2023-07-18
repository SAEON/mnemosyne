import { Transform } from 'stream'

const CHUNK_SIZE = 16777216 // 16MB/s

class ThrottleTransform extends Transform {
  constructor({ rate = CHUNK_SIZE, ...options }) {
    super({ ...options })
    this.rate = rate
    this.chunkSize = 0
    this.startTime = null
  }

  _transform(chunk, encoding, callback) {
    this.chunkSize += chunk.length

    if (!this.startTime) {
      this.startTime = process.hrtime.bigint()
    }

    const elapsed = Number(process.hrtime.bigint() - this.startTime) / 1e9 // convert nanoseconds to seconds
    const expectedTime = this.chunkSize / this.rate
    const remainingTime = expectedTime - elapsed

    if (remainingTime > 0) {
      setTimeout(() => {
        this.push(chunk)
        callback()
      }, remainingTime * 1000) // convert seconds to milliseconds
    } else {
      this.push(chunk)
      callback()
    }
  }
}

export default ThrottleTransform
