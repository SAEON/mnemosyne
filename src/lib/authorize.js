import { decrypt, LOGINS, PERMISSIONS } from '../config/index.js'

export default function (req) {
  const { authorization } = req.headers

  if (!authorization) throw new Error('Unauthorized')

  // Check for valid token
  const token = authorization.replace(/^Bearer\s+/i, '')
  const user = decrypt(token)
  if (!LOGINS.includes(user)) throw new Error('Unauthorized')

  // Check if login is allowed for this path
  return user
}
