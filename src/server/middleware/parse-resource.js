import { URL } from 'url'
import { VOLUMES } from '../../config/index.js'
import { info } from '../../logger/index.js'
import { getAbsolutePaths } from '../../lib/path-helpers.js'

export default async function () {
  const { req } = this

  // Incoming URL
  const protocol = req.headers['x-forwarded-proto'] || 'http'
  const host = req.headers.host
  const root = `${protocol}://${host}`
  const url = new URL(req.url, root)
  const { pathname, searchParams } = url

  // Parse the query string
  const query = [...searchParams.keys()].reduce(
    (params, key) => ({ ...params, [key]: searchParams.get(key) || true }),
    {}
  )

  // Work out the possible absolute paths available for entry
  const _paths = await getAbsolutePaths(VOLUMES, pathname, req.method.toUpperCase())
  info('Resource request path (OR)\n', _paths.map(({ path }) => path).join('\n '))

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
  }
}
