import { info } from '../../logger/index.js'
import configureKeys from './_configure-keys.js'
import configurePermissions from './_configure-permissions.js'
import configureVolumes from './_configure-volumes.js'
import logArgs from './_log-args.js'
import yargs from './_yargs.js'

export async function initializeServer(argv) {
  info('STARTING MNEMOSYNE SERVER')

  const args = yargs(argv)
  logArgs(args)

  const crypto = await configureKeys(args)
  const PERMISSIONS = await configurePermissions(args)
  await configureVolumes(args)

  const serverSettings = {
    PORT: args.port,
    HOSTNAME: args.hostname,
    VOLUMES: args.volume.sort(),
    KEY: args.key,
    LOGINS: args.login,
    PERMISSIONS,
    DOWNLOAD_THROTTLE: args['throttle-downloads'],
    encrypt: crypto ? crypto.encrypt : undefined,
    decrypt: crypto ? crypto.decrypt : undefined,
  }

  return serverSettings
}