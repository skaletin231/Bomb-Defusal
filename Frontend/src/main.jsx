import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './style.css'
import { Auth0Provider } from '@auth0/auth0-react'
import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import '@fontsource/reddit-sans'
import ApolloProviderWithAuth from './Components/ApolloProviderWithAuth.jsx'
import React from 'react'

const theme = createTheme({
  typography: {
    fontFamily: '"Reddit Sans", sans-serif',
  },
  card: {
    fontFamily: '"Reddit Sans", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: {
            borderStyle: 'none',
          },
        },
      },
    },
  },
  palette: {
    primary: {
      main: '#84582e',
    },
  },
})

class ErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <h1>An error occurred</h1>
    }

    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUDIENCE,
      }}
    >
      <ApolloProviderWithAuth>
        <Router>
          <ThemeProvider theme={theme}>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </ThemeProvider>
        </Router>
      </ApolloProviderWithAuth>
    </Auth0Provider>
  </StrictMode>,
)
