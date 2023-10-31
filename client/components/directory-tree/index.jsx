import React from 'react'
import { useQuery, gql } from '@apollo/client'
import Div from '../div.jsx'
import Span from '../span.jsx'
import { Link } from '@mui/material'
import { File as FileIcon, Folder as FolderIcon } from '../icons.jsx'
import humanReadableBytes from './_human-readable-bytes.js'
import Backlinks from './backlinks.jsx'

export default () => {
  const { data, error, loading } = useQuery(
    gql`
      query ($path: String) {
        listings @rest(type: "Listing", path: $path) {
          parent
          path
          v
          entry
          isFile
          isDirectory
          size
        }
      }
    `,
    {
      variables: {
        path: window.location.pathname,
      },
    },
  )

  if (loading) {
    return null
  }

  if (error) {
    throw error
  }

  return (
    <Div sx={{ margin: theme => theme.spacing(2) }}>
      <Backlinks />
      <Div sx={{ marginTop: theme => theme.spacing(1) }} />
      <Div sx={{ display: 'table' }}>
        {data.listings.map(({ isFile, size, entry, path, v }, i, arr) => {
          const Icon = isFile ? FileIcon : FolderIcon
          const text = isFile ? humanReadableBytes(size) : '..'
          const fullPath = path
          return (
            <Div sx={{ display: 'table-row' }}>
              <Span sx={{ display: 'table-cell' }}>
                <Icon fontSize="small" />
              </Span>
              <Span sx={{ display: 'table-cell', paddingLeft: theme => theme.spacing(1) }}>
                {text}
              </Span>
              <Link
                sx={{
                  display: 'table-cell',
                  fontSize: '0.8em',
                  paddingLeft: theme => theme.spacing(1),
                }}
                href={`${fullPath
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;')}`}
              >
                {entry}
              </Link>
            </Div>
          )
        })}
      </Div>
    </Div>
  )
}
