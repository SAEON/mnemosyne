import crypto from 'crypto'

const IV_LENGTH = 16

/**
 * Generates a 256-bit (32-byte) cryptographic key for use with the AES-256-CBC encryption algorithm.
 *
 * @returns {string} The cryptographic key, represented as a 64-character hexadecimal string.
 *                   Each pair of hexadecimal characters represents one byte, so the 64-character string
 *                   represents a 32-byte (256-bit) key. The string can be converted back to a 32-byte
 *                   buffer using `Buffer.from(key, 'hex')`.
 */
export const generateKey = () => crypto.randomBytes(32).toString('hex')

export default KEY => {
  return {
    encrypt(text) {
      let iv = crypto.randomBytes(IV_LENGTH)
      let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(KEY, 'hex'), iv)
      let encrypted = cipher.update(text)
      encrypted = Buffer.concat([encrypted, cipher.final()])
      return iv.toString('hex') + ':' + encrypted.toString('hex')
    },
    decrypt(text) {
      let textParts = text.split(':')
      let iv = Buffer.from(textParts.shift(), 'hex')
      let encryptedText = Buffer.from(textParts.join(':'), 'hex')
      let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(KEY, 'hex'), iv)
      let decrypted = decipher.update(encryptedText)
      decrypted = Buffer.concat([decrypted, decipher.final()])
      return decrypted.toString()
    },
  }
}
