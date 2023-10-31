import { stat } from 'fs/promises'
import { createReadStream } from 'fs'
import { join, normalize } from 'path'
import { res302, res500 } from '../../../../lib/http-fns.js'
import serveFile from '../file/index.js'
import { error } from '../../../../logger/index.js'
import { basePath } from '../../../../config/index.js'

export default async function ({
  res,
  resource: {
    pathname,
    _paths,
    query: { noindex = false, json: forceJson = false },
    searchParams,
  },
  req: {
    headers: { accept = '' },
  },
}) {
  // 302 to / if necessary
  if (!pathname.match(/\/$/)) {
    const q = searchParams.toString() === '' ? '' : `?${searchParams}`
    res302(res, q, pathname)
    return
  }

  const json = forceJson || (accept.toLowerCase().includes('application/json') ? true : false)

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
            }),
          )
        } catch (error) {
          return []
        }
      }),
    )
  )
    .flat()
    .sort(({ entry: a }, { entry: b }) => {
      const nameA = a.split('.').slice(0, -1).join('.')
      const nameB = b.split('.').slice(0, -1).join('.')
      const extA = a.split('.').pop()
      const extB = b.split('.').pop()

      if (nameA.toUpperCase() > nameB.toUpperCase()) return 1
      if (nameB.toUpperCase() > nameA.toUpperCase()) return -1

      if (extA.toUpperCase() > extB.toUpperCase()) return 1
      if (extB.toUpperCase() > extA.toUpperCase()) return -1

      return 0
    })

  // Serve an index.html file if it exists
  const indexFiles = !noindex && !json && listings.filter(({ entry }) => entry === 'index.html')
  if (indexFiles?.length === 1) {
    const { directory, entry } = indexFiles[0]
    const path = normalize(join(directory, entry))
    return serveFile.call(this, {
      ...this,
      resource: {
        ...this.resource,
        _paths: [{ path }],
      },
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
            parent: `${normalize(join(pathname, '..'))}${forceJson ? '?json' : ''}`,
            path: `${path}${!unique ? `?v=${v}` : ''}${
              isDirectory ? (forceJson ? '?json' : '') : ''
            }`,
            v,
            entry,
            isFile,
            isDirectory,
            size,
          }
        }),
      ),
    )
    res.end()
  } else {
    res.setHeader('content-type', 'text/html')
    const htmlPath = normalize(join(basePath, 'client', 'index.html'))
    const readStream = createReadStream(htmlPath)

    readStream.on('error', e => {
      error('Error reading file:', e)
      res500(res)
    })

    readStream.pipe(res)
    readStream.on('close', () => {
      res.end()
    })
  }
}
