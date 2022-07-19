import { URL } from 'url'
import { VOLUME } from '../../config/index.js'
import { normalize, join } from 'path'
import { info } from '../../logger/index.js'

export default async function () {
  const { req } = this

  // Incoming URL
  const protocol = req.headers['x-forwarded-proto'] || 'http'
  const host = req.headers.host
  const root = `${protocol}://${host}`
  const url = new URL(req.url, root)
  const { pathname, search } = url

  // Parse the query string
  const query = search
    .slice(1)
    .split('&')
    .reduce((params, c) => {
      const [key, value = true] = c.split('=')
      return { ...params, [key]: value }
    }, {})

  /**
   * Work out the absolute path
   * of the resource request (
   * without allowing relative
   * lookups beyond the VOLUME
   * root)
   */
  const absolutePath = normalize(join(VOLUME, pathname))
  info('Resource request path', absolutePath)

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
    absolutePath,
    query,
  }
}
