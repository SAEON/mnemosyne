import encryption from '../../lib/encryption.js'
import { info, warn } from '../../logger/index.js'

export default async function configureKeys(args) {
  const { key, login } = args

  if (!key || key.toLowerCase() === 'false') {
    info('*** INFO ***')
    info('Authentication key CLI argument (--key) not provided')
    info('Uploading is disabled!')
    info()

    if (login) {
      warn('*** WARNING ***')
      warn('Login specified (--login) without providing an application key (--key)')
      warn()
    }
    return
  }

  const crypto = encryption(key)
  const { encrypt } = crypto

  if (login) {
    info('ACCESS TOKENS')
    const longestLogin = login.reduce((a, c) => (c.length > a ? c.length : a), 0)
    login.forEach(user => info(user.padEnd(longestLogin + 1, ' '), '::', encrypt(user)))
  } else {
    if (key) {
      warn('*** WARNING ***')
      warn('Authentication key provided, but no logins specified')
    }
  }

  info()

  return crypto
}
