export default async function () {
  const { req, res } = this

  // CORS = *
  const { origin } = req.headers
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }

  // General headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Methods', 'HEAD,GET,PUT,OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, credentials, Authorization'
  )
}
