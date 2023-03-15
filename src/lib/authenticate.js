import { decrypt, USERS } from '../config/index.js'

export default req => {
  const { authorization } = req.headers
  if (!authorization) throw new Error('Unauthorized')
  const token = authorization.replace(/^Bearer\s+/i, '')
  const user = decrypt(token)
  if (!USERS.includes(user)) throw new Error('Unauthorized')
  return user
}
