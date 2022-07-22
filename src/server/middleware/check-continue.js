/**
 * Always say 'yes'
 */
export default function (req, res) {
  const server = this
  res.writeContinue()
  server.emit('request', req, res)
}
