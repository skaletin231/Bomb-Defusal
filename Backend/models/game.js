const mongoose = require('mongoose')

const spotSchema = new mongoose.Schema({
  word: String,
  player1Type: String,
  player2Type: String,
  typeRevealed: {
    type: String,
    default: null,
  },
})

const boardSchema = new mongoose.Schema({
  spots: [spotSchema],
})

const gameSchema = new mongoose.Schema({
  players: [String],
  board: boardSchema,
})

module.exports = mongoose.model('Game', gameSchema)
