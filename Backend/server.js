const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const express = require('express')
const cors = require('cors')
const resolvers = require('./resolvers')
const typeDefs = require('./schema')
const { expressMiddleware } = require('@as-integrations/express5')
const http = require('http')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const {
  ApolloServerPluginDrainHttpServer,
} = require('@apollo/server/plugin/drainHttpServer')

const { auth } = require('express-oauth2-jwt-bearer')

const User = require('./models/user')

const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/use/ws')
const cookieParser = require('cookie-parser')

const checkJwtOptional = (req, res, next) => {
  //console.log('token', req.headers.authorization)
  //console.log('token', req.headers.authorization?.split(' '))
  const token = req.headers.authorization?.split(' ')[1]
  //console.log('token', token)

  if (!token) {
    //console.log('null')
    req.user = null
    return next()
  }

  return checkJwt(req, res, (err) => {
    //console.log(err)
    if (err) {
      //console.log('null 2')
      req.user = null
      return next()
    }
    next()
  })
}

const checkJwt = auth({
  audience: process.env.AUDIENCE,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256',
})

const startServer = async (port) => {
  const app = express()
  const httpServer = http.createServer(app)

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  })

  const schema = makeExecutableSchema({ typeDefs, resolvers })

  const serverCleanup = useServer(
    {
      schema,
      context: () => {
        //not sure what context is needed, if any, yet
        return {}
      },
    },
    wsServer,
  )

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
  })

  await server.start()

  app.use(express.static('dist'))

  app.use(
    '/graphql',
    cors(),
    express.json(),
    cookieParser(process.env.COOKIE_SECRET),
    checkJwtOptional,
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        if (!req.auth) {
          console.log('people without any authentication, so guests i guess')
          return {
            auth: null,
            user: null,
            res,
            req,
          }
        }
        const auth = req.auth.payload
        const id = auth?.sub

        if (!id) {
          //this would be a valid request by a guest i think?
          console.log('random authentication')
          return {
            auth: null,
            user: null,
            res,
            req,
          }
        }

        let user = await User.findOne({ auth0_ID: id })

        if (!user) {
          const token = req.auth.token
          if (!token) return null

          const url = `${process.env.ISSUER_BASE_URL}/userinfo`
          const profile = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then((r) => r.json())

          const newUser = new User({
            username: null,
            email: profile.email,
            auth0_ID: id,
          })

          user = await newUser.save()

          //return newUser
        }

        return { auth, user, res, req }
      },
    }),
  )

  httpServer.listen(port, () => console.log(`Server is now running on ${port}`))
}

module.exports = startServer
