import { warn } from '../../../logger/index.js'
import _404 from '../404.js'
import serveFile from './file/index.js'
import serveDir from './dir/index.js'

export default async function () {
  const {
    resource: { _paths, query },
  } = this

  try {
    // Test if there is a file to serve
    const files = _paths.filter(({ isFile: f }) => f)
    if (files.length) {
      const file =
        files.length === 1 ? files[0] : files.find(({ v }) => v === parseInt(query.v || '0', 10))
      return serveFile.call({
        ...this,
        resource: { ...this.resource, _paths: [file] },
      })
    }

    // Otherwise serve the directory
    return serveDir.call(this)
  } catch (error) {
    warn('Requested resource', _paths, 'does not exist')
    return _404.call(this)
  }
}
