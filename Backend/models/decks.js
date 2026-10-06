const mongoose = require('mongoose')

const deckSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: String,
    public: {
      type: Boolean,
      default: false,
    },
    cards: [String],
    notes: String,
  },
  {
    timestamps: true,
  },
)

deckSchema.index({ public: 1, createdAt: -1 })

module.exports = mongoose.model('Deck', deckSchema)
