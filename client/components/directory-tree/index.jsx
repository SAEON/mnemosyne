import React from 'react'
import { useQuery, gql } from '@apollo/client'
import Div from '../div.jsx'
import humanReadableBytes from './_human-readable-bytes.js'

export default () => {
  const { data, error, loading } = useQuery(gql`
    query {
      listings @rest(type: "Listing", path: "/") {
        parent
        path
        v
        entry
        isFile
        isDirectory
        size
      }
    }
  `)

  if (loading) {
    return null
  }

  if (error) {
    throw error
  }

  return (
    <Div sx={{ margin: theme => theme.spacing(2) }}>
      {data.listings.map(({ isFile, size, entry, path, v }, i, arr) => {
        const icon = isFile ? '🖺' : '🗀'
        const text = isFile ? humanReadableBytes(size) : '..'
        const fullPath = path
        return (
          <div>
            <span class="entry">
              <span class="cell">{icon}</span>
              <span class="cell">{text}</span>
              <a
                class="cell"
                href={`${fullPath
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;')}`}
              >
                {entry}
              </a>
            </span>
          </div>
        )
      })}
    </Div>
  )
}
