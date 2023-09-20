import React, { lazy, Suspense } from 'react'
import { CssBaseline, Toolbar, LinearProgress } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { createTheme } from '@mui/material/styles'
import lightTheme from '/client/mui-theme/light.js'
import darkTheme from '/client/mui-theme/dark.js'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import { RestLink } from 'apollo-link-rest'

// Set `RestLink` with your endpoint
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new RestLink({ uri: `${window.origin}` }),
})

const Header = lazy(() => import(`${window.origin}/client/components/header/index.jsx`))
const DirectoryTree = lazy(() =>
  import(`${window.origin}/client/components/directory-tree/index.jsx`),
)

const theme = createTheme(createTheme(lightTheme), {})

export default () => (
  <ApolloProvider client={client}>
    <CssBaseline>
      <ThemeProvider theme={theme}>
        {/* HEADER */}
        <Suspense fallback={<LinearProgress />}>
          <Header />
        </Suspense>

        {/* Push content below the header */}
        <Toolbar variant="dense" />

        {/* DIRECTORY LISTINGS */}
        <Suspense fallback={<LinearProgress />}>
          <DirectoryTree />
        </Suspense>
      </ThemeProvider>
    </CssBaseline>
  </ApolloProvider>
)
