const Game = require('./models/game')
const User = require('./models/user')
const { MakeBoard } = require('./utils/GameboardUtils')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const gameStates = { win: 'Win', lose: 'Lose', playing: 'Playing' }

const resolvers = {
  Query: {
    getGame: async (root, args, context) => {
      if (!context.user) {
        return null
      }

      const game = await Game.findById(args.id).populate('players')

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
        gameState: gameStates.playing,
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

      let turnChangeMade = null
      if (isPlayer1) //player 1 move
      {
        game.board.spots[args.index].typeRevealed.player1 =
          game.board.spots[args.index].player2Type

        if (game.board.spots[args.index].player2Type !== 'dud') {
          //update board
          game.board.spots[args.index].typeRevealed.player2 =
            game.board.spots[args.index].player2Type

          const greenCount = game.board.spots.filter(
            //this filter checks for spots that are player 2's revealed green
            (thisSpot) =>
              thisSpot.typeRevealed.player1 === 'wire' &&
              thisSpot.player2Type === 'wire',
          ).length

          if (greenCount === 9) //this player can't take any more actions
          {
            turnChangeMade = changeTurn(game, game.players[1])
          }
        } else {
          turnChangeMade = changeTurn(game, game.players[1])
        }
      } else //player 2 move
      {
        game.board.spots[args.index].typeRevealed.player2 =
          game.board.spots[args.index].player1Type

        if (game.board.spots[args.index].player1Type !== 'dud') {
          //update board
          game.board.spots[args.index].typeRevealed.player1 =
            game.board.spots[args.index].player1Type

          const greenCount = game.board.spots.filter(
            //this filter checks for spots that are player 2's revealed green
            (thisSpot) =>
              thisSpot.typeRevealed.player2 === 'wire' &&
              thisSpot.player1Type === 'wire',
          ).length

          if (greenCount === 9) //this player can't take any more actions
          {
            turnChangeMade = changeTurn(game, game.players[0])
          }
        } else {
          turnChangeMade = changeTurn(game, game.players[0])
        }
      }

      await game.save()

      const newSpot = {
        word: game.board.spots[args.index].word,

        myType: context.user.equals(game.players[0])
          ? game.board.spots[args.index].player1Type
          : game.board.spots[args.index].player2Type,

        typeRevealed: context.user.equals(game.players[0])
          ? {
              myType: game.board.spots[args.index].typeRevealed.player1,
              theirType: game.board.spots[args.index].typeRevealed.player2,
            }
          : {
              myType: game.board.spots[args.index].typeRevealed.player2,
              theirType: game.board.spots[args.index].typeRevealed.player1,
            },
      }

      const gameUpdate = {
        gameID: game.id,
        playerID: context.user.id,
        type: 'Move Made',
        changedSpots: [
          {
            word: newSpot.word,
            typeRevealed: newSpot.typeRevealed,
          },
        ],
        turnChange: turnChangeMade,
      }

      pubsub.publish('GAME_UPDATE', { gameUpdate: gameUpdate })

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

      const gameUpdate = {
        gameID: game.id,
        playerID: context.user.id,
        type: 'Turn End',
        turnChange: {
          turnUpdate: {
            username: game.currentPlayer.username,
            id: game.currentPlayer.id,
          },
        },
      }

      pubsub.publish('GAME_UPDATE', { gameUpdate })

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
  Subscription: {
    gameUpdate: {
      subscribe: () => pubsub.asyncIterableIterator('GAME_UPDATE'),
    },
  },
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
    gameState: game.gameState,
  }
}

const includesPlayer = (game, user) => {
  const isAPlayer = game.players.some((player) => player._id.equals(user._id))
  if (isAPlayer) {
    return true
  }

  return false
}

const checkIfGameEnd = (game) => {}

const changeTurn = (game, user) => {
  game.currentPlayer = user
  turnChangeMade = {
    turnUpdate: {
      username: user.username,
      id: user.id,
    },
  }

  return turnChangeMade
}

module.exports = resolvers

/*
    ok when a player makes a move i need to check: 
      1. are they out of moves
          - end their turn
      2. are both players out of moves
          - end game in a win
      3. was it a bomb
          - end game in a loss
      4. was it a dud
          - end their turn
*/
