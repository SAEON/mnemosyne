import { info, warn } from '../../logger/index.js'

export default async function configurePermissions(args) {
  const { key, login, permission } = args

  if (!key || key.toLowerCase() === 'false') {
    info('*** INFO ***')
    info('Authentication key CLI argument (--key) not provided')
    info('Uploading is disabled!')
    info()

    if (login) {
      warn('*** WARNING ***')
      warn('Permission specified (--permission) without providing an application key (--key)')
      warn()
    }
    return
  }

  if (permission) {
    info('PERMISSIONS')
    const longestLogin = permission.reduce((a, c) => {
      const user = c.split(':')[0]
      return user.length > a ? user.length : a
    }, 0)
    permission.forEach(permission => {
      const [user, path] = permission.split(':')
      info(user.padEnd(longestLogin + 1, ' '), '::', path)
    })
  } else {
    if (key && login) {
      warn('*** WARNING ***')
      warn(
        'Authentication key and logins provided, but without explicit permissions uploading / updating is disabled'
      )
    }
  }

  info()
  return (permission || []).reduce(
    (permissions, current) => {
      const [user, path] = current.split(':')

      // paths convenience mapping
      permissions.paths[path] = [...new Set([...(permissions.paths[path] || []), user])]

      // users convenience mapping
      permissions.users[user] = [...new Set([...(permissions.users[user] || []), path])]

      // Continue reduce
      return permissions
    },
    { users: {}, paths: {} },
  )
}
