const Game = require('./models/game')
const { MakeBoard } = require('./utils/GameboardUtils')

const resolvers = {
  Query: {
    getGame: async (root, args) => {
      const game = await Game.findById(args.id)
      return game
    },
  },
  Mutation: {
    startGame: async (root, args) => {
      const board = MakeBoard(args.words)

      const game = new Game({
        players: [],
        board: {
          spots: board,
        },
      })

      await game.save()

      return game
    },
    joinGame: async (root, args) => {
      const game = await Game.findById(args.gameID)

      if (game.players.includes(args.player)) {
        return game
      }

      if (game.players.length == 2) {
        return null
      }

      game.players = game.players.concat(args.player)
      console.log(game.players, args)

      await game.save()

      return game
    },
    makeMove: async (root, args) => {
      const game = await Game.findById(args.gameID)

      if (!game.players.includes(args.player))
        //not a player in this game
        return null

      if (game.board.spots[args.index].typeRevealed !== null)
        //already made this move, nothing should happen
        return game

      if (game.players[0] === args.player) //player 1 move
      {
        game.board.spots[args.index].typeRevealed =
          game.board.spots[args.index].player1Type
      } else //player 2 move
      {
        game.board.spots[args.index].typeRevealed =
          game.board.spots[args.index].player2Type
      }

      await game.save()

      return game
    },
  },
}

module.exports = resolvers
