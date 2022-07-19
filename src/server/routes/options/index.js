export default async function () {
  const { req, res } = this
  res.write('im the options route')
  res.end()
}
