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

      if (isPlayer1) //player 1 move
      {
        game.board.spots[args.index].typeRevealed.player1 =
          game.board.spots[args.index].player2Type

        if (game.board.spots[args.index].player2Type !== 'dud') {
          //update board
          game.board.spots[args.index].typeRevealed.player2 =
            game.board.spots[args.index].player2Type

          if (game.board.spots[args.index].player2Type === 'bomb') {
            let returnVal = updateSpotBomb(
              context,
              game,
              game.board.spots[args.index],
              isPlayer1,
            )
            await game.save()
            pubsub.publish('GAME_UPDATE', { gameUpdate: returnVal })
            return newReturnInfo(game, context)
          }

          //updateSpot(game, game.board.spots[args.index], isPlayer1)
          let returnVal = updateSpotWire(
            context,
            game,
            game.board.spots[args.index],
            isPlayer1,
          )
          await game.save()
          pubsub.publish('GAME_UPDATE', { gameUpdate: returnVal })
          return newReturnInfo(game, context)
        }
      } else //player 2 move
      {
        game.board.spots[args.index].typeRevealed.player2 =
          game.board.spots[args.index].player1Type

        if (game.board.spots[args.index].player1Type !== 'dud') {
          //update board
          game.board.spots[args.index].typeRevealed.player1 =
            game.board.spots[args.index].player1Type

          if (game.board.spots[args.index].player1Type === 'bomb') {
            let returnVal = updateSpotBomb(
              context,
              game,
              game.board.spots[args.index],
              isPlayer1,
            )
            await game.save()
            pubsub.publish('GAME_UPDATE', { gameUpdate: returnVal })

            return newReturnInfo(game, context)
          }

          let returnVal = updateSpotWire(
            context,
            game,
            game.board.spots[args.index],
            isPlayer1,
          )
          await game.save()
          pubsub.publish('GAME_UPDATE', { gameUpdate: returnVal })
          return newReturnInfo(game, context)
        }
      }

      let returnValDud = updateSpotDud(
        context,
        game,
        game.board.spots[args.index],
        isPlayer1,
      )
      await game.save()
      pubsub.publish('GAME_UPDATE', { gameUpdate: returnValDud })

      return newReturnInfo(game, context)
    },
    endTurn: async (root, args, context) => {
      const game = await Game.findById(args.gameID).populate('players')

      if (!includesPlayer(game, context.user)) return null

      if (!game.currentPlayer.equals(context.user._id))
        return newReturnInfo(game, context)

      if (game.turnsRemaining > 0) game.turnsRemaining -= 1

      let turnChangeMade = changeTurnNew(game)
      if (context.user.equals(game.players[0])) {
        if (game.playerState.player2RemainingWires > 0)
          game.currentPlayer = game.players[1]
        else game.currentPlayer = game.players[0]
      } else {
        if (game.playerState.player1RemainingWires > 0)
          game.currentPlayer = game.players[0]
        else game.currentPlayer = game.players[1]
      }

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
        turnsRemainingChange: game.turnsRemaining,
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
    turnsRemaining: game.turnsRemaining,
  }
}

const includesPlayer = (game, user) => {
  const isAPlayer = game.players.some((player) => player._id.equals(user._id))
  if (isAPlayer) {
    return true
  }

  return false
}

//user == current user not new
const changeTurnNew = (game) => {
  if (game.currentPlayer.equals(game.players[0]._id)) {
    if (game.playerState.player2RemainingWires > 0)
      game.currentPlayer = game.players[1]
    else game.currentPlayer = game.players[0]
  } else {
    if (game.playerState.player1RemainingWires > 0)
      game.currentPlayer = game.players[0]
    else game.currentPlayer = game.players[1]
  }

  turnChangeMade = {
    turnUpdate: {
      username: game.currentPlayer.username,
      id: game.currentPlayer.id,
    },
  }

  return turnChangeMade
}

const endGame = (game, endState) => {
  game.gameState = endState
  //currently commenting this out to make testing easier, later i should make there be no turn player
  //game.currentPlayer = null
}

const updateSpotWire = (context, game, spot, isPlayer1) => {
  //player 1's count goes down if it is on player 2's score card
  if (spot.player1Type === 'wire') game.playerState.player2RemainingWires -= 1

  if (spot.player2Type === 'wire') game.playerState.player1RemainingWires -= 1

  let turnChangeMade = null
  let gameStateChangeMade = null

  if (
    game.playerState.player1RemainingWires > 0 ||
    game.playerState.player2RemainingWires > 0
  ) {
    if (isPlayer1 && game.playerState.player1RemainingWires === 0) {
      turnChangeMade = changeTurnNew(game)
      if (game.turnsRemaining !== 0) game.turnsRemaining -= 1
    } else if (!isPlayer1 && game.playerState.player2RemainingWires === 0) {
      turnChangeMade = changeTurnNew(game)
      if (game.turnsRemaining !== 0) game.turnsRemaining -= 1
    }
  } else {
    gameStateChangeMade = 'Win'
    endGame(game, 'Win')
  }

  const gameUpdate = {
    gameID: game.id,
    playerID: context.user.id,
    type: 'Move Made',
    changedSpots: [
      {
        word: spot.word,
        typeRevealed: {
          myType: 'wire',
          theirType: 'wire',
        },
      },
    ],
    turnChange: turnChangeMade,
    gameStateChange: gameStateChangeMade,
    turnsRemainingChange: game.turnsRemaining,
  }

  return gameUpdate
}

const updateSpotDud = (context, game, spot, isPlayer1) => {
  let turnChangeMade = null
  let gameStateChangeMade = null

  if (isPlayer1) turnChangeMade = changeTurnNew(game)
  else turnChangeMade = changeTurnNew(game)

  if (game.turnsRemaining === 0) {
    gameStateChangeMade = 'Lose'
    endGame(game, 'Lose')
  } else {
    game.turnsRemaining -= 1
  }

  const typeRevealed = isPlayer1
    ? {
        myType: spot.typeRevealed.player1,
        theirType: spot.typeRevealed.player2,
      }
    : {
        myType: spot.typeRevealed.player2,
        theirType: spot.typeRevealed.player1,
      }

  const gameUpdate = {
    gameID: game.id,
    playerID: context.user.id,
    type: 'Move Made',
    changedSpots: [
      {
        word: spot.word,
        typeRevealed: typeRevealed,
      },
    ],
    turnChange: turnChangeMade,
    gameStateChange: gameStateChangeMade,
    turnsRemainingChange: game.turnsRemaining,
  }

  return gameUpdate
}

const updateSpotBomb = (context, game, spot, isPlayer1) => {
  endGame(game, 'Lose')

  const gameUpdate = {
    gameID: game.id,
    playerID: context.user.id,
    type: 'Move Made',
    changedSpots: [
      {
        word: spot.word,
        typeRevealed: {
          myType: 'bomb',
          theirType: 'bomb',
        },
      },
    ],
    gameStateChange: 'Lose',
  }

  return gameUpdate
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
