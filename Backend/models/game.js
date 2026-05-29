const mongoose = require('mongoose')

const spotSchema = new mongoose.Schema({
  word: String,
  player1Type: String,
  player2Type: String,
  typeRevealed: {
    player1: {
      type: String,
      default: null,
    },
    player2: {
      type: String,
      default: null,
    },
  },
})

const boardSchema = new mongoose.Schema({
  spots: [spotSchema],
})

const gameSchema = new mongoose.Schema({
  players: [String],
  currentPlayer: String,
  board: boardSchema,
})

module.exports = mongoose.model('Game', gameSchema)
