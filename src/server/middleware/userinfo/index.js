import { decrypt, LOGINS, PERMISSIONS } from '../../../config/index.js'
import { error } from '../../../logger/index.js'

export default async function () {
  const {
    auth,
    req: {
      headers: { authorization },
    },
  } = this

  if (authorization) {
    const token = authorization.replace(/^Bearer\s+/i, '')
    try {
      const user = decrypt(token)
      if (LOGINS.includes(user)) {
        auth.user = { username: user, permissions: PERMISSIONS.users[user] || [] }
      }
    } catch (err) {
      error('Invalid user', err.message)
      auth.user = null
    }
  }
}
