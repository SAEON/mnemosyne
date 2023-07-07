import { stat } from 'fs/promises'
import { join, normalize } from 'path'
import he from 'he'
import serveFile from '../../get/file/index.js'
import humanReadableBytes from '../../../../lib/human-readable-bytes.js'

const getBackLinks = ctx => {
  const {
    resource: { protocol, host, pathname },
  } = ctx

  if (pathname === '/') {
    return `<a href="${protocol}://${host}">.</a>/`
  }

  return pathname
    .split('/')
    .slice(0, -1)
    .map((path, i, arr) => arr.slice(0, i + 1))
    .map(p => p.join('/'))
    .reduce(
      (str, p) =>
        `${str}${`<a href="${protocol}://${host}${p}">${p.split('/').pop() || '.'}</a>`}/`,
      ''
    )
}

export default async function () {
  const {
    res,
    resource: {
      protocol,
      host,
      pathname,
      _paths,
      query: { noindex = false },
    },
    req: {
      headers: { accept = '' },
    },
  } = this

  const json = accept.toLowerCase().includes('application/json') ? true : false

  const listings = (
    await Promise.all(
      _paths.map(async _path => {
        const { path, v } = _path
        try {
          return await Promise.all(
            _path.entries?.map(async entry => {
              const stats = await stat(normalize(join(path, entry)))
              return {
                v,
                directory: path,
                entry,
                isFile: stats.isFile(),
                isDirectory: stats.isDirectory(),
                size: stats.size,
                pathname,
              }
            })
          )
        } catch (error) {
          return []
        }
      })
    )
  )
    .flat()
    .sort(({ entry: a }, { entry: b }) => {
      if (a.toUpperCase() > b.toUpperCase()) return 1
      if (b.toUpperCase() > a.toUpperCase()) return -1
      return 0
    })

  // Serve an index.html file if it exists
  const indexFiles = !noindex && !json && listings.filter(({ entry }) => entry === 'index.html')
  if (indexFiles?.length === 1) {
    const { directory, entry } = indexFiles[0]
    return serveFile.call({
      ...this,
      resource: { ...this.resource, _paths: [{ path: normalize(join(directory, entry)) }] },
    })
  }

  if (json) {
    // Set headers
    res.setHeader('content-type', 'application/json')
    res.write(
      JSON.stringify(
        listings.map(({ isFile, isDirectory, size, entry, v }, i, arr) => {
          const path = normalize(join(pathname, entry))
          const unique =
            arr.filter(({ pathname, entry }) => normalize(join(pathname, entry)) === path)
              .length === 1

          return {
            parent: `${normalize(join(pathname, '..'))}`,
            path: `${path}${!unique ? `?v=${v}` : ''}`,
            v,
            entry,
            isFile,
            isDirectory,
            size,
          }
        })
      )
    )
    res.end()
  } else {
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
            
            #header > h1 {
              margin: 12px;
              align-items: center;
              font-size: 24px;
            }

            #listing {
              margin: 2px 8px;
            }

            #listing > h2 {
              font-size: 16px;
            }

            #listing > #entries {
              display: table;
            }

            #listing > #entries > .entry {
              display: table-row;
              margin: 4px 0;
            }

            #listing > #entries > .entry > .cell {
              display: table-cell;
            }

            #listing > #entries > .entry > .cell:not(:first-child) {
              padding-left: 12px;
            }

            #footer {
              position: fixed;
              bottom: 0;
              right: 0;
            }

            #footer > p {
              margin: 6px 8px;
              font-style: italic;
            }
          </style>
        </head>
        <body>

        <!-- PAGE HEADER -->
        <div id="header">
          <h1><a href="${protocol}://${host}">Mnemosyne file server</a></h1>
        </div>

        <!-- CONTENTS LISTINGS -->
        <div id="listing">
          <h2>${getBackLinks(this)}${he.encode(pathname.split('/').pop())}</h2>
          <div id="entries">
            ${listings
              .map(({ isFile, size, entry, pathname, v }, i, arr) => {
                const icon = isFile ? '🖺' : '🗀'
                const text = isFile ? humanReadableBytes(size) : '..'
                const path = normalize(join(pathname, entry))
                const unique =
                  arr.filter(({ pathname, entry }) => normalize(join(pathname, entry)) === path)
                    .length === 1
                return `
                  <span class="entry">
                    <span class="cell">
                      ${icon}
                    </span>
                    <span class="cell">
                      ${text}
                    </span>
                    <a class="cell" href="${he.encode(
                      `${path}${!unique ? `?v=${v}` : ''}`
                    )}">${entry}</a> 
                  </span>`
              })
              .join('\n')}
          </div>
        </div>

        <!-- FOOTER -->
        <div id="footer">
          <p>Node.js ${process.version}</p>
        </div>
        </body>
      </html>`

    res.write(html)
    res.end()
  }
}
