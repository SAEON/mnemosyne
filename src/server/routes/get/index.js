import { warn } from '../../../logger/index.js'
import _404 from '../404.js'
import serveFile from './file/index.js'
import serveDir from './dir/index.js'

export default async function () {
  const {
    resource: { _paths, pathname },
  } = this

  if (_paths.length === 0) {
    warn('Requested resource does not exist', pathname)
    return _404.call(this)
  }

  const file = _paths.find(({ isFile: f }) => f)

  if (file) {
    const updatedContext = {
      ...this,
      resource: { ...this.resource, _paths: [file] },
    }
    return serveFile.call(updatedContext)
  }

  return serveDir.call(this)
}
