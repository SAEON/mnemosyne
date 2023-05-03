import { URL } from 'url'
import { VOLUMES } from '../../config/index.js'
import { normalize, join } from 'path'
import { info } from '../../logger/index.js'

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

  /**
   * Work out the absolute path
   * of the resource request (
   * without allowing relative
   * lookups beyond the VOLUME
   * root)
   */
  const absolutePaths = VOLUMES.map(v => normalize(join(v, pathname)))
  info('Resource request path (OR)\n', absolutePaths.join('\n '))

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
    absolutePaths,
    query,
  }
}
