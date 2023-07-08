export default function (user, path) {
  if (!path) return false

  const allowedPaths =
    user?.permissions?.map(p => {
      let path = p.replace(/^\.\//, '')
      if (!path.endsWith('/')) {
        path += '/'
      }
      return path
    }) || []

  const authorized =
    allowedPaths.reduce((isAllowed, p) => {
      if (path.startsWith(p)) {
        isAllowed = true
      }
      return isAllowed
    }, false) || false
  return authorized
}
