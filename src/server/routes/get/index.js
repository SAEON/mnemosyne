import { stat } from 'fs/promises'
import { warn } from '../../../logger/index.js'
import _404 from '../404.js'
import serveFile from './file/index.js'
import serveDir from './dir/index.js'

export default async function () {
  const {
    req,
    res,
    resource: { absolutePath },
  } = this

  /**
   * If the URI points to a file
   * serve that. Otherwise show
   * the directory listing
   */
  try {
    const resource = await stat(absolutePath)
    return resource.isFile() ? serveFile.call(this) : serveDir.call(this)
  } catch (error) {
    warn('Requested resource', absolutePath, 'does not exist')
    return _404.call(this)
  }
}
