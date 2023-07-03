import { info } from '../../logger/index.js'
import configureKeys from './_configure-keys.js'
import configureVolumes from './_configure-volumes.js'
import logArgs from './_log-args.js'
import yargs from './_yargs.js'

export async function initializeServer(argv) {
  info('STARTING MNEMOSYNE SERVER')

  const args = yargs(argv)
  logArgs(args)

  const crypto = await configureKeys(args)
  await configureVolumes(args)

  const serverSettings = {
    PORT: args.port,
    HOSTNAME: args.hostname,
    VOLUMES: args.volume.sort(),
    KEY: args.key,
    USERS: args.login,
    encrypt: crypto ? crypto.encrypt : undefined,
    decrypt: crypto ? crypto.decrypt : undefined,
  }

  return serverSettings
}