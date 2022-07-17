import { readdir, stat } from 'fs/promises'
import { join, normalize } from 'path'
import he from 'he'
import serveFile from '../../get/file/index.js'

export default async (req, res, directory, pathname) => {
  const listings = (await readdir(directory)).sort((a, b) => {
    if (a.toUpperCase() > b.toUpperCase()) return 1
    if (b.toUpperCase() > a.toUpperCase()) return -1
    return 0
  })

  // Serve an index.html file if it exists
  if (listings.includes('index.html')) {
    return serveFile(req, res, normalize(join(directory, 'index.html')))
  }

  // Set headers
  res.setHeader('content-type', 'text/html')

  // Create directory listing HTML
  const html = `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width">
      <title>${he.encode(pathname)}</title>

      <style>
        h1 {
          margin: 8px;
          font-size: 24px;
        }

        a {
          display: block;
          margin: 2px 8px;
        }
      </style>
    </head>
    <body>
    <h1>${he.encode(pathname)}</h1>
    ${(
      await Promise.all(
        listings.map(async l => {
          const p = normalize(join(directory, l))
          const isFile = (await stat(p)).isFile()
          return `<a href="${normalize(join(pathname, l))}">${isFile ? '🗎' : '📁'} ${l}</a>`
        })
      )
    ).join('\n')}
    </body>
  </html>
  `

  res.write(html)
  res.end()
}
