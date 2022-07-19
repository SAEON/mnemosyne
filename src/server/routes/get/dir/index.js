import { readdir, stat } from 'fs/promises'
import { join, normalize } from 'path'
import he from 'he'
import serveFile from '../../get/file/index.js'

const getBackLinks = ctx => {
  const {
    resource: { protocol, host, pathname },
  } = ctx

  if (pathname === '/') {
    return ''
  }

  return pathname
    .split('/')
    .slice(0, -1)
    .map((path, i, arr) => {
      return arr.slice(0, i + 1)
    })
    .map(p => p.join('/'))
    .reduce((str, p) => {
      return `${str}${`<a href="${protocol}://${host}${p}">${p.split('/').pop() || '.'}</a>`}/`
    }, '')
}

export default async function () {
  const {
    res,
    resource: { protocol, host, pathname, absolutePath: directory },
  } = this

  const listings = (await readdir(directory)).sort((a, b) => {
    if (a.toUpperCase() > b.toUpperCase()) return 1
    if (b.toUpperCase() > a.toUpperCase()) return -1
    return 0
  })

  // Serve an index.html file if it exists
  if (listings.includes('index.html')) {
    return serveFile.call({
      ...this,
      resource: { ...this.resource, absolutePath: normalize(join(directory, 'index.html')) },
    })
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
        html, body {
          margin: 0;
          padding: 0;
          font-family: monospace;
        }

        #header {
          display: flex;
          justify-content: center;
          border-bottom: 1px solid grey;
          margin-bottom: 12px;
        }
        
        #header h1 {
          margin: 12px;
          align-items: center;
          font-size: 24px;
        }

        #listing {
          margin: 2px 8px;
        }

        #listing h2 {
          font-size: 16px;
        }

        #listing #entries a {
          display: block;
          margin: 4px 0;
        }
      </style>
    </head>
    <body>

    <!-- PAGE HEADER -->
    <div id="header">
      <h1><a href="${protocol}://${host}">Mnemosyne HTTP-range server</a></h1>
    </div>

    <!-- CONTENTS LISTINGS -->
    <div id="listing">
      <h2>${getBackLinks(this)}${he.encode(pathname.split('/').pop())}</h2>
      <div id="entries">
        ${(
          await Promise.all(
            listings.map(async l => {
              const p = normalize(join(directory, l))
              const isFile = (await stat(p)).isFile()
              return `<a href="${he.encode(normalize(join(pathname, l)))}">${
                isFile ? '🗎' : '📁'
              } ${l}</a>`
            })
          )
        ).join('\n')}
      </div>
    </div>
    </body>
  </html>
  `

  res.write(html)
  res.end()
}
