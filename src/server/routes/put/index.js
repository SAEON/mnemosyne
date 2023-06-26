import { createResource } from '../post/index.js'

export default async function () {
  return createResource.call(this)
}
