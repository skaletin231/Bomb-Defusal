require('dotenv').config()

const startServer = require('./server')
const connectToDatabase = require('./db')

const MONGODB_URI = process.env.MONGODB_URI

const PORT = process.env.PORT || 4000

const main = async () => {
  await connectToDatabase(MONGODB_URI)
  startServer(PORT)
}

main()
