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

const hintSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  hint: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
})

const boardSchema = new mongoose.Schema({
  spots: [spotSchema],
})

const gameSchema = new mongoose.Schema({
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  currentPlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  board: boardSchema,
  gameState: {
    type: String,
    enum: ['Win', 'Lose', 'Playing', 'Hint'],
  },
  playerState: {
    //this may be best tracked as green count remaining
    player1RemainingWires: {
      type: Number,
      default: 9,
    },
    player2RemainingWires: {
      type: Number,
      default: 9,
    },
  },
  turnsRemaining: {
    type: Number,
    default: 9,
  },
  hints: [hintSchema],
  mistakes: {
    type: Number,
    default: 0,
  },
  mistakeLimit: {
    type: Number,
    default: -1,
  },
})

module.exports = mongoose.model('Game', gameSchema)
