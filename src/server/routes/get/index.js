import { warn } from '../../../logger/index.js'
import serveFile from './file/index.js'
import serveDir from './dir/index.js'
import { res404 } from '../../../lib/http-fns.js'

export default async function () {
  const {
    res,
    resource: { _paths, pathname },
  } = this

  if (_paths.length === 0) {
    warn('Requested resource does not exist', pathname)
    res404(res)
    return
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
