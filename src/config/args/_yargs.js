import yargs from 'yargs'

export default args =>
  yargs(args)
    .option('port', {
      alias: 'p',
      default: 3000,
      type: 'number',
    })
    .option('hostname', {
      alias: 'h',
      default: '0.0.0.0',
      type: 'string',
    })
    .option('throttle-downloads', {
      alias: 't',
      default: 16777216, // 16MB/s
      type: 'number',
    })
    .option('key', {
      alias: 'k',
      type: 'string',
    })
    .option('volume', {
      alias: 'v',
      type: 'array',
    })
    .option('login', {
      alias: 'l',
      type: 'array',
    })
    .option('permission', {
      alias: 'x',
      type: 'array',
    }).argv
