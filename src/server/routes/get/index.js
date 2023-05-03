import { stat } from 'fs/promises'
import { warn } from '../../../logger/index.js'
import _404 from '../404.js'
import serveFile from './file/index.js'
import serveDir from './dir/index.js'

export default async function () {
  const {
    resource: { absolutePaths },
  } = this

  /**
   * If the URI points to a file
   * serve that. Otherwise show
   * the directory listing
   */
  try {
    const resources = await Promise.allSettled(
      absolutePaths.map(async p => await stat(p).then(s => (s.isFile() ? p : [p])))
    )
      .then(r =>
        r
          .map(({ status, value, reason }) => {
            // This path doesn't exist on on mount
            if (reason) return null

            return value
          })
          .flat()
      )
      .then(r => r.filter(_ => _))

    return resources.length == 1 ? serveFile.call(this) : serveDir.call(this)
  } catch (error) {
    warn('Requested resource', absolutePaths, 'does not exist')
    return _404.call(this)
  }
}
