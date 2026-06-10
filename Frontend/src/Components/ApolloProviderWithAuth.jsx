import { useAuth0 } from '@auth0/auth0-react'

import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import { setContext, SetContextLink } from '@apollo/client/link/context'

import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'

import { useMemo } from 'react'

function ApolloProviderWithAuth({ children }) {
  const { getAccessTokenSilently } = useAuth0()
  const client = useMemo(() => {
    const authLink = setContext(async (_, { headers }) => {
      let token = ''

      try {
        token = await getAccessTokenSilently()
      } catch (error) {
        console.log('no token available yet', error)
      }

      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : 'test',
        },
      }
    })

    const httpLink = new HttpLink({ uri: 'http://localhost:4000' })

    const wsLink = new GraphQLWsLink(
      createClient({
        url: 'ws://localhost:4000',
      }),
    )

    const splitLink = ApolloLink.split(
      ({ query }) => {
        const definition = getMainDefinition(query)
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        )
      },
      wsLink,
      authLink.concat(httpLink),
    )

    return new ApolloClient({
      link: splitLink,
      // link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
    })
  }, [getAccessTokenSilently])

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

export default ApolloProviderWithAuth
