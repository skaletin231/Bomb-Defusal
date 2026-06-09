const Game = require('./models/game')
const User = require('./models/user')
const { MakeBoard } = require('./utils/GameboardUtils')

const resolvers = {
  Query: {
    getGame: async (root, args, context) => {
      if (!context.user) {
        return null
      }

      const game = await Game.findById(args.id).populate('players')

      //console.log(game, context.user)
      const isAPlayer = game.players.some((player) =>
        player._id.equals(context.user._id),
      )
      if (!isAPlayer) return null

      return newReturnInfo(game, context)
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
    startGame: async (root, args, context) => {
      //console.log(context)
      if (!context.user) {
        return null
      }

      const board = MakeBoard(args.words)

      const game = new Game({
        players: [context.user],
        currentPlayer: context.user,
        board: {
          spots: board,
        },
      })

      await game.save()

      return newReturnInfo(game, context)
    },
    joinGame: async (root, args, context) => {
      if (!context.user) {
        return null
      }
      const game = await Game.findById(args.gameID).populate('players')
      if (!game) return null

      //console.log(game)

      if (includesPlayer(game, context.user)) {
        return newReturnInfo(game, context)
      }

      if (game.players.length == 2) {
        return null
      }

      game.players = game.players.concat(context.user)

      await game.save()

      return newReturnInfo(game, context)
    },
    makeMove: async (root, args, context) => {
      if (!context.user) {
        return null
      }
      const game = await Game.findById(args.gameID).populate('players')

      if (!includesPlayer(game, context.user)) return null

      const isPlayer1 = context.user.equals(game.players[0])

      const myTypeRevealed = isPlayer1
        ? game.board.spots[args.index].typeRevealed.player1
        : game.board.spots[args.index].typeRevealed.player2

      if (
        myTypeRevealed !== null ||
        !game.currentPlayer.equals(context.user._id)
      ) //already made this move or can't make a move
      {
        console.log('cant make move')
        return newReturnInfo(game, context)
      }

      if (isPlayer1) //player 1 move
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

      return newReturnInfo(game, context)
    },
    endTurn: async (root, args, context) => {
      const game = await Game.findById(args.gameID).populate('players')

      if (!includesPlayer(game, context.user)) return null

      if (!game.currentPlayer.equals(context.user._id))
        return newReturnInfo(game, context)

      game.currentPlayer = context.user.equals(game.players[0])
        ? game.players[1]
        : game.players[0]

      await game.save()

      return newReturnInfo(game, context)
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

const newReturnInfo = (game, context) => {
  return {
    id: game.id,

    players: game.players.map((player) => ({
      username: player.username,
      id: player._id,
    })),

    currentPlayer: {
      username: game.currentPlayer.equals(game.players[0]._id)
        ? game.players[0].username
        : game.players[1].username,
      id: game.currentPlayer._id,
    },

    board: {
      spots: game.board.spots.map((spot) => ({
        word: spot.word,

        myType: context.user.equals(game.players[0])
          ? spot.player1Type
          : spot.player2Type,

        typeRevealed: context.user.equals(game.players[0])
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

const includesPlayer = (game, user) => {
  const isAPlayer = game.players.some((player) => player._id.equals(user._id))
  if (isAPlayer) {
    return true
  }

  return false
}

module.exports = resolvers
