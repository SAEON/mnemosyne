function createBacklinks() {
  const { protocol, host, pathname } = window.location
  const el = document.getElementById('backlinks')
  let html

  if (pathname === '/') {
    html = `<a href="${protocol}//${host}">.</a>/`
  } else {
    html = pathname
      .split('/')
      .slice(0, -1)
      .map((path, i, arr) => arr.slice(0, i + 1))
      .map(p => p.join('/'))
      .reduce(
        (str, p) =>
          `${str}${`<a href="${protocol}//${host}${p}">${p.split('/').pop() || '.'}</a>`}/`,
        '',
      )
  }

  el.innerHTML = html
}

async function fetchListings() {
  const res = await fetch(window.location.href, {
    method: 'GET',
    headers: {
      Accept: 'Application/json',
    },
  })

  return await res.json()
}

const humanReadableBytes = (bytes, si = false, dp = 1) => {
  const thresh = si ? 1000 : 1024

  if (Math.abs(bytes) < thresh) {
    return bytes + 'B'
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  let u = -1
  const r = 10 ** dp

  do {
    bytes /= thresh
    ++u
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)

  return bytes.toFixed(dp) + units[u]
}

function createTree(listings) {
  const el = document.getElementById('entries')

  el.innerHTML = listings
    .map(({ isFile, size, entry, path, v }, i, arr) => {
      const icon = isFile ? '🖺' : '🗀'
      const text = isFile ? humanReadableBytes(size) : '..'
      const fullPath = path
      return `
        <span class="entry">
          <span class="cell">${icon}</span>
          <span class="cell">${text}</span>
          <a class="cell" href="${fullPath
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')}">
            ${entry}
          </a> 
        </span>`
    })
    .join('\n')
}

function footer() {
  const el = document.getElementById('footer-p')
  el.innerHTML = `© NRF-SAEON 2022 - ${new Date().getFullYear()}`
}

/**
 * Entrypoint
 */
document.addEventListener('DOMContentLoaded', async () => {
  footer()
  createBacklinks()
  createTree(await fetchListings())
})
