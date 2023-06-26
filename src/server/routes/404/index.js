export default async function () {
  const { res } = this
  res.statusCode = 404
  res.end()
}
