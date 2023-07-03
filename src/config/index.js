import { initializeServer } from './args/index.js'
export const { PORT, HOSTNAME, VOLUMES, KEY, USERS, encrypt, decrypt } = await initializeServer(
  process.argv.slice(2)
)
