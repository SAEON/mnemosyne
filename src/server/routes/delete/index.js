export default async function () {
  const { req, res } = this

  res.statusCode = 501
  res.write('Not implemented yet')
  res.end()
}
