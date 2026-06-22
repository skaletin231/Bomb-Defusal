const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    gameID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
)

messageSchema.index({ gameID: 1, createdAt: 1 })

module.exports = mongoose.model('Message', messageSchema)
