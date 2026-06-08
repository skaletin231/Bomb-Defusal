const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const express = require('express')
const cors = require('cors')
const resolvers = require('./resolvers')
const typeDefs = require('./schema')
const { expressMiddleware } = require('@as-integrations/express5')
const http = require('http')
const { makeExecutableSchema } = require('@graphql-tools/schema')

const { auth } = require('express-oauth2-jwt-bearer')

const User = require('./models/user')

const checkJwtOptional = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    req.user = null
    return next()
  }

  return checkJwt(req, res, (err) => {
    if (err) {
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

const schema = makeExecutableSchema({ typeDefs, resolvers })

const startServer = async (port) => {
  const app = express()
  const httpServer = http.createServer(app)

  const server = new ApolloServer({
    schema,
  })

  await server.start()

  app.use(
    '/',
    cors(),
    express.json(),
    checkJwtOptional,
    expressMiddleware(server, {
      context: async ({ req }) => {
        //console.log('starting context middleware')
        if (!req.auth) {
          //console.log('not logged in')
          return {
            auth: null,
            user: null,
          }
        }
        const auth = req.auth.payload
        const id = auth?.sub
        //console.log(auth, id)

        if (!id) {
          //console.log('no id')
          return {
            auth: null,
            user: null,
          }
        }

        //console.log('finding user')

        const user = await User.findOne({ auth0_ID: id })

        if (!user) {
          //console.log('no user found')

          const token = req.auth.token
          if (!token) return null

          const url = `${process.env.ISSUER_BASE_URL}/userinfo`
          const profile = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then((r) => r.json())

          //console.log(profile)

          const newUser = new User({
            username: null,
            email: profile.email,
            auth0_ID: id,
          })

          await newUser.save()

          return newUser
        }

        console.log('user found')

        return { auth, user }
      },
    }),
  )

  httpServer.listen(port, () =>
    console.log(`Server is now running on http://localhost:${port}`),
  )
}

module.exports = startServer
