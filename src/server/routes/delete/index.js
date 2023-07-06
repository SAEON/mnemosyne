import { KEY } from '../../../config/index.js'
import { unlink } from 'fs/promises'
import { error, info } from '../../../logger/index.js'
import authorize from '../../../lib/authorize.js'
import { res204, res404, res401, res405, res500 } from '../../../lib/http-fns.js'
import { validatePath } from '../../../lib/path-fns.js'

export default async function () {
  const {
    req,
    res,
    resource: { _paths },
  } = this

  // Check if uploads are enabled on this server
  if (!KEY) {
    res405(res)
    return
  }

  // Authenticate the request
  try {
    authorize(req)
  } catch (e) {
    error(e.message)
    res401(res)
    return
  }

  // Validate the path
  const path = validatePath(_paths)
  if (!path) {
    res404(res)
    return
  }

  // Attempt to delete the file
  try {
    await unlink(path)
    info('DELETED', path)
  } catch (e) {
    if (e.code === 'ENOENT') {
      res404(res)
    } else {
      error(e)
      res500(res)
    }
    return
  }

  // Respond with No Content
  res204(res)
}
