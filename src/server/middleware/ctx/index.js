import { nanoid } from 'nanoid'

export default function (req, res, server) {
  return {
    id: nanoid(8), // Give each request an ID for logging purposes (https://github.com/ai/nanoid#readme)
    req,
    res,
    auth: {},
    server,
  }
}
