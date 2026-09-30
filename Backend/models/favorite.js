const mongoose = require('mongoose')

const favoriteSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  deckID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
  },
})

favoriteSchema.index({ userID: 1, deckID: 1 }, { unique: true })
favoriteSchema.index({ deckID: 1 })

module.exports = mongoose.model('Favorite', favoriteSchema)
