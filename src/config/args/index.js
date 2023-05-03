import { info } from '../../logger/index.js'
import configureKeys from './_configure-keys.js'
import configureVolumes from './_configure-volumes.js'
import logArgs from './_log-args.js'
import yargs from './_yargs.js'

info('STARTING MNEMOSYNE SERVER')

const args = yargs(process.argv.slice(2))
logArgs(args)

await configureKeys(args)
await configureVolumes(args)

export const PORT = args.port
export const HOSTNAME = args.hostname
export const VOLUMES = args.volume
export const KEY = args.key
export const USERS = args.users
export const encrypt = crypto ? crypto.encrypt : undefined
export const decrypt = crypto ? crypto.decrypt : undefined
