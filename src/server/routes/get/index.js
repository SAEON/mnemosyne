import { URL } from 'url'
import { stat } from 'fs/promises'
import { VOLUME } from '../../../config/index.js'
import { normalize, join } from 'path'
import { info, warn } from '../../../logger/index.js'
import _404 from '../404.js'
import serveFile from './file/index.js'
import serveDir from './dir/index.js'

export default async (req, res) => {
  // Incoming URL
  const root = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`
  const url = new URL(req.url, root)
  const { pathname } = url

  /**
   * Work out the absolute path
   * of the resource request (
   * without allowing relative
   * lookups beyond the VOLUME
   * root)
   */
  const p = normalize(join(VOLUME, pathname))
  info('Resource request', p)

  /**
   * If the URI points to a file
   * serve that. Otherwise show
   * the directory listing
   */
  try {
    const resource = await stat(p)
    return resource.isFile() ? serveFile(req, res, p) : serveDir(req, res, p, pathname)
  } catch (error) {
    warn('Requested resource', p, 'does not exist')
    return _404(req, res)
  }
}
