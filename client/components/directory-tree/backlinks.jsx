import React from 'react'
import { Link, Typography } from '@mui/material'

export default () => {
  const { protocol, host, pathname } = window.location

  if (pathname === '/') {
    return <Link href={`${protocol}//${host}`}>.</Link>
  }

  const links = pathname
    .split('/')
    .slice(0, -1)
    .map((path, i, arr) => arr.slice(0, i + 1))
    .map(p => p.join('/'))
    .map((p, i) => ({
      href: `${protocol}//${host}${p}`,
      label: p.split('/').pop() || '.',
    }))

  return (
    <>
      {links.map((link, i) => (
        <React.Fragment key={i}>
          <Link href={link.href}>{link.label}</Link>
          {i !== links.length - 1 && (
            <Typography
              component={'span'}
              sx={{
                marginLeft: theme => theme.spacing(0.5),
                marginRight: theme => theme.spacing(0.5),
              }}
            >
              /
            </Typography>
          )}
        </React.Fragment>
      ))}
    </>
  )
}
