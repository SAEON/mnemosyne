import crypto from 'crypto'

const IV_LENGTH = 16

/**
 * KEY must be 256 bits
 * https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
 */
export default KEY => {
  return {
    encrypt(text) {
      let iv = crypto.randomBytes(IV_LENGTH)
      let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(KEY), iv)
      let encrypted = cipher.update(text)
      encrypted = Buffer.concat([encrypted, cipher.final()])
      return iv.toString('hex') + ':' + encrypted.toString('hex')
    },
    decrypt(text) {
      let textParts = text.split(':')
      let iv = Buffer.from(textParts.shift(), 'hex')
      let encryptedText = Buffer.from(textParts.join(':'), 'hex')
      let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(KEY), iv)
      let decrypted = decipher.update(encryptedText)
      decrypted = Buffer.concat([decrypted, decipher.final()])
      return decrypted.toString()
    },
  }
}
