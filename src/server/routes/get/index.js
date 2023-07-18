import { warn } from '../../../logger/index.js'
import serveFile from './file/index.js'
import serveDir from './dir/index.js'
import { res404 } from '../../../lib/http-fns.js'

export default async function ({ id, res, resource: { _paths, pathname } }) {
  if (_paths.length === 0) {
    warn(id, 'Requested resource does not exist', pathname)
    res404(res)
    return
  }

  const file = _paths.find(({ isFile: f }) => f)

  if (file) {
    const updatedContext = {
      ...this,
      resource: { ...this.resource, _paths: [file] },
    }
    return serveFile.call(updatedContext, updatedContext)
  }

  return serveDir.call(this, this)
}
