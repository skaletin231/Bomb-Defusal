const mongoose = require('mongoose')

const connectToDatabase = async (uri) => {
  try {
    await mongoose.connect(uri)
    console.log('connected to MongoDB')
  } catch (error) {
    console.log('failed to connect to MongoDB', error)
    process.exit(1)
  }
}

module.exports = connectToDatabase
