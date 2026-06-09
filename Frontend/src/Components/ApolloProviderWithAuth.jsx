import { useAuth0 } from '@auth0/auth0-react'

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import { setContext, SetContextLink } from '@apollo/client/link/context'

import { useMemo } from 'react'

function ApolloProviderWithAuth({ children }) {
  const { getAccessTokenSilently } = useAuth0()
  const client = useMemo(() => {
    const httpLink = new HttpLink({ uri: 'http://localhost:4000' })

    const authLink = setContext(async (_, { headers }) => {
      let token = ''

      try {
        token = await getAccessTokenSilently()
      } catch (error) {
        console.log('no token available yet', error)
      }

      console.log(token)

      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : 'test',
        },
      }
    })

    return new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
    })
  }, [getAccessTokenSilently])

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

export default ApolloProviderWithAuth
