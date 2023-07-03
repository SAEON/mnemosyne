import { initializeServer } from './args/index.js'
export const { PORT, HOSTNAME, VOLUMES, KEY, LOGINS, PERMISSIONS, encrypt, decrypt } =
  await initializeServer(process.argv.slice(2))
