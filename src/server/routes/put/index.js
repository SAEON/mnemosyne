export default async function () {
  const { req, res } = this
  res.write('im the put route')
  res.end()
}
