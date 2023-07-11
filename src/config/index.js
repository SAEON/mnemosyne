import { initializeServer } from './args/index.js'
import { fileURLToPath } from 'url'
import path from 'path'
import { info } from '../logger/index.js'

// Get the current file path
const currentFilePath = fileURLToPath(import.meta.url)

// Get the root of the repo
export const basePath = path.resolve(currentFilePath, '../../../')

export const { PORT, HOSTNAME, VOLUMES, KEY, LOGINS, PERMISSIONS, encrypt, decrypt } =
  await initializeServer(process.argv.slice(2))

info('Directory root', basePath)