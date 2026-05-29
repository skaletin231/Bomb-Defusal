const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      minlength: 3,
    },
    email: String,
    auth0_ID: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

//later it may be worth adding a variable for "have done initial setup"
//and defualting username to: nickname + random strings or something

userSchema.index(
  { username: 1 },
  {
    unique: true,
    partialFilterExpression: {
      username: { $exists: true, $ne: null },
    },
  },
)

module.exports = mongoose.model('User', userSchema)
