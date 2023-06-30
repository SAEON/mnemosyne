import { KEY } from '../../../config/index.js'
import { unlink } from 'fs/promises'
import { error } from '../../../logger/index.js'
import authenticate from '../../../lib/authenticate.js'
import { res204, res404, res401, res405, res500 } from '../../../lib/http-fns.js'
import { getValidatedPath } from '../../../lib/path-fns.js'

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
    authenticate(req)
  } catch (e) {
    error(e)
    res401(res)
    return
  }

  // Validate the path
  const path = getValidatedPath(res, _paths)
  if (!path) return

  // Attempt to delete the file
  try {
    await unlink(path)
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
