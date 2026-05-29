const Game = require('./models/game')
const User = require('./models/user')
const { MakeBoard } = require('./utils/GameboardUtils')

const resolvers = {
  Query: {
    getGame: async (root, args, context) => {
      const game = await Game.findById(args.id)

      if (!game.players.includes(args.player)) return null

      return returnInfo(game, args)
    },
    getUser: async (root, args) => {
      const user = await User.findOne({ auth_ID: args.auth_ID })

      if (!user) return null

      return user
    },
    me: (root, args, context) => {
      return context.user
    },
  },
  Mutation: {
    startGame: async (root, args) => {
      const board = MakeBoard(args.words)

      const game = new Game({
        players: [args.player],
        currentPlayer: args.player,
        board: {
          spots: board,
        },
      })

      await game.save()

      return returnInfo(game, args)
    },
    joinGame: async (root, args) => {
      const game = await Game.findById(args.gameID)

      if (game.players.includes(args.player)) {
        return returnInfo(game, args)
      }

      if (game.players.length == 2) {
        return null
      }

      game.players = game.players.concat(args.player)

      await game.save()

      return returnInfo(game, args)
    },
    makeMove: async (root, args) => {
      const game = await Game.findById(args.gameID)

      if (!game.players.includes(args.player))
        //not a player in this game
        return null

      const myTypeRevealed =
        game.players[0] === args.player
          ? game.board.spots[args.index].typeRevealed.player1
          : game.board.spots[args.index].typeRevealed.player2

      if (myTypeRevealed !== null || game.currentPlayer !== args.player)
        //already made this move, nothing should happen
        return returnInfo(game, args)

      if (game.players[0] === args.player) //player 1 move
      {
        if (game.board.spots[args.index].player2Type !== 'dud') {
          game.board.spots[args.index].typeRevealed.player2 =
            game.board.spots[args.index].player2Type
        } //Bombs and Wires lock both players out of that spot

        game.board.spots[args.index].typeRevealed.player1 =
          game.board.spots[args.index].player2Type
      } else //player 2 move
      {
        if (game.board.spots[args.index].player1Type !== 'dud') {
          game.board.spots[args.index].typeRevealed.player1 =
            game.board.spots[args.index].player1Type
        } //Bombs and Wires lock both players out of that spot

        game.board.spots[args.index].typeRevealed.player2 =
          game.board.spots[args.index].player1Type
      }

      await game.save()

      return returnInfo(game, args)
    },
    endTurn: async (root, args) => {
      const game = await Game.findById(args.gameID)

      if (!game.players.includes(args.player))
        //not a player in this game
        return null

      if (game.currentPlayer !== args.player) returnInfo(game, args)

      game.currentPlayer =
        args.player === game.players[0] ? game.players[1] : game.players[0]

      await game.save()

      return returnInfo(game, args)
    },
    addUser: async (root, args) => {
      const user = await User.findOne({ auth_ID: args.auth_ID })

      if (user) return null

      const newUser = new User({
        username: args.username,
        email: args.email,
        auth0_ID: args.auth0_ID,
      })

      await newUser.save()

      return newUser
    },
    updateUserInfo: async (root, args, context) => {
      const user = context.user

      if (!user) return null

      user.username = args.username

      await user.save()

      return user
    },
  },
}

const returnInfo = (game, args) => {
  return {
    id: game.id,

    players: game.players,

    currentPlayer: game.currentPlayer,

    board: {
      spots: game.board.spots.map((spot) => ({
        word: spot.word,

        myType:
          args.player === game.players[0] ? spot.player1Type : spot.player2Type,

        typeRevealed:
          args.player === game.players[0]
            ? {
                myType: spot.typeRevealed.player1,
                theirType: spot.typeRevealed.player2,
              }
            : {
                myType: spot.typeRevealed.player2,
                theirType: spot.typeRevealed.player1,
              },
      })),
    },
  }
}

module.exports = resolvers
