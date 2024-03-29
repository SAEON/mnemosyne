import { URL } from 'url'
import { VOLUMES } from '../../../config/index.js'
import { info } from '../../../logger/index.js'
import { getAbsolutePaths } from '../../../lib/path-fns.js'

export default async function () {
  const { id, req } = this

  // Incoming URL
  const protocol = req.headers['x-forwarded-proto'] || 'http'
  const host = req.headers.host
  const root = `${protocol}://${host}`
  const url = new URL(req.url, root)
  const { searchParams, pathname: pathnameRaw } = url
  const pathname = decodeURIComponent(pathnameRaw)

  // Parse the query string
  const query = [...searchParams.keys()].reduce(
    (params, key) => ({ ...params, [key]: searchParams.get(key) || true }),
    {},
  )

  // Work out the possible absolute paths available for entry
  const _paths = await getAbsolutePaths(VOLUMES, pathname, req.method.toUpperCase()).then(
    __paths => {
      return __paths.filter(_path => !query.v || _path.v == query.v)
    },
  )

  info(`[REQ ${id}]`, 'Resource request path (OR)\n', _paths.map(({ path }) => path).join('\n '))

  /**
   * Append the 'resource'
   * key to the request
   * context
   */
  this.resource = {
    protocol,
    host,
    root,
    url,
    pathname,
    _paths,
    query,
    searchParams,
  }
}
