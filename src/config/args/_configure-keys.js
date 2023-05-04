import encryption from '../_encryption.js'
import { info, warn } from '../../logger/index.js'

export default async function configureKeys(args) {
  const { key, login } = args

  if (!key || key.toLowerCase() === 'false') {
    warn(
      '*** WARNING ***\nAuthentication key CLI argument (--key) missing.\nUploading is disabled\n'
    )
    return
  }

  const crypto = encryption(key)
  const { encrypt } = crypto

  info('ACCESS TOKENS')
  const l = login.reduce((a, c) => (c.length > a ? c.length : a), 0)
  login.forEach(user => info(user.padEnd(l + 1, ' '), '::', encrypt(user)))
  info()

  return crypto
}
