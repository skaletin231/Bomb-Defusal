const Game = require('./models/game')
const User = require('./models/user')
const Deck = require('./models/decks')
const Message = require('./models/message')

const { MakeBoard } = require('./utils/GameboardUtils')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const gameStates = {
  hint: 'Hint',
  win: 'Win',
  lose: 'Lose',
  playing: 'Playing',
}

const { GraphQLDateTime } = require('graphql-scalars')
const { Error } = require('mongoose')

const resolvers = {
  DateTime: GraphQLDateTime,
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
    getMessages: async (root, args, context) => {
      const game = await Game.findById(args.gameID).populate('players')

      if (!game || !context.user || !includesPlayer(game, context.user)) {
        return null
      }

      const messages = await Message.find({ gameID: args.gameID }).populate(
        'user',
      )
      return messages.map((message) => ({
        user: {
          username: message.user.username,
          id: message.user._id,
        },
        text: message.text,
        createdAt: message.createdAt,
      }))
    },
    getHints: async (root, args, context) => {
      const game = await Game.findById(args.gameID).populate('players')

      if (!game || !context.user || !includesPlayer(game, context.user)) {
        return null
      }

      const players = game.players

      return game.hints.map((fullHint) => ({
        player: {
          username: fullHint.player.equals(players[0]._id)
            ? players[0].username
            : players[1].username,
          id: fullHint.player.equals(players[0]._id)
            ? players[0]._id
            : players[1]._id,
        },
        hint: fullHint.hint,
        count: fullHint.count,
      }))
    },
    getMyDecks: async (root, __, context) => {
      if (!context.user) {
        return null
      }

      const myDecks = await Deck.find({ owner: context.user._id }).populate(
        'owner',
      )

      return myDecks.map((deck) => ({
        id: deck._id,
        owner: {
          username: deck.owner.username,
          id: deck.owner._id,
        },
        name: deck.name,
        public: deck.public,
        cards: deck.cards,
      }))
    },
    getMyDeck: async (root, args, context) => {
      if (!context.user) {
        return null
      }

      const myDeck = await Deck.findById(args.deckID).populate('owner')

      if (!myDeck || !myDeck.owner._id.equals(context.user._id))
        throw new Error(
          'Either no deck was found with this id, or you do not have permission to access it',
        )

      return {
        id: myDeck._id,
        owner: {
          username: myDeck.owner.username,
          id: myDeck.owner._id,
        },
        name: myDeck.name,
        public: myDeck.public,
        cards: myDeck.cards,
      }
    },
    getAllDecks: async (root, __, context) => {
      if (!context.user) {
        return null
      }

      const decks = await Deck.find({
        $or: [{ public: true }, { owner: context.user._id }],
      }).populate('owner')

      return decks.map((deck) => ({
        id: deck.id,
        owner: {
          username: deck.owner.username,
          id: deck.owner._id,
        },
        name: deck.name,
        public: deck.public,
        cards: deck.cards,
      }))
    },
  },
  Mutation: {
    startGame: async (root, args, context) => {
      console.log('try start game', args)
      if (!context.user) {
        return null
      }

      const deck = await Deck.findById(args.deckID)

      if (!deck) return null

      const canUse = deck.public || deck.owner.equals(context.user._id)

      if (!canUse) return null

      const board = MakeBoard(deck.cards)

      const game = new Game({
        players: [context.user],
        currentPlayer: context.user,
        board: {
          spots: board,
        },
        gameState: gameStates.hint,
      })

      await game.save()

      return game._id
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

      const returnInfo = newReturnInfo(game, context)

      const gameUpdate = {
        gameID: game.id,
        playerID: context.user.id,
        type: 'New Player',
        gameUser: returnInfo.players[1],
      }

      console.log(gameUpdate)

      pubsub.publish('NEW_PLAYER_JOINED', { newPlayerJoined: gameUpdate })

      return returnInfo
    },
    makeMove: async (root, args, context) => {
      console.log('try make move')
      if (!context.user) {
        return null
      }
      const game = await Game.findById(args.gameID).populate('players')

      if (!includesPlayer(game, context.user)) return null

      const myTypeRevealed = isPlayer1(game, context.user._id)
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

      console.log('192')

      if (isPlayer1(game, context.user._id)) {
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
              isPlayer1(game, context.user._id),
            )
            await game.save()
            console.log('about to publish make move bomb', returnVal)
            pubsub.publish('GAME_UPDATE', { gameUpdate: returnVal })
            return newReturnInfo(game, context)
          }

          let returnVal = updateSpotWire(
            context,
            game,
            game.board.spots[args.index],
            isPlayer1(game, context.user._id),
          )
          await game.save()
          console.log('about to publish make move wire', returnVal)
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
              isPlayer1(game, context.user._id),
            )
            await game.save()
            console.log('about to publish make move bomb', returnVal)
            pubsub.publish('GAME_UPDATE', { gameUpdate: returnVal })

            return newReturnInfo(game, context)
          }

          let returnVal = updateSpotWire(
            context,
            game,
            game.board.spots[args.index],
            isPlayer1(game, context.user._id),
          )
          await game.save()
          console.log('about to publish make move wire', returnVal)
          pubsub.publish('GAME_UPDATE', { gameUpdate: returnVal })
          return newReturnInfo(game, context)
        }
      }

      console.log(context.user)

      let returnValDud = updateSpotDud(
        context,
        game,
        game.board.spots[args.index],
        isPlayer1(game, context.user._id),
      )

      console.log('269')

      await game.save()
      console.log('about to publish make move dud', returnValDud)

      pubsub.publish('GAME_UPDATE', { gameUpdate: returnValDud })

      return newReturnInfo(game, context)
    },
    endTurn: async (root, args, context) => {
      const game = await Game.findById(args.gameID).populate('players')

      if (!includesPlayer(game, context.user)) return null

      if (!game.currentPlayer.equals(context.user._id))
        return newReturnInfo(game, context)

      let turnChangeMade = changeTurn(game)

      if (game.turnsRemaining > 0) game.turnsRemaining -= 1

      await game.save()

      const gameUpdate = {
        gameID: game.id,
        playerID: context.user.id,
        type: 'Turn End',
        turnChange: turnChangeMade,
        turnsRemainingChange: game.turnsRemaining,
        gameStateChange: game.gameState,
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
    sendMessage: async (root, args, context) => {
      const game = await Game.findById(args.gameID)
      if (!game) return null

      if (!context.user || !includesPlayer(game, context.user)) {
        return null
      }

      const message = new Message({
        gameID: args.gameID,
        user: context.user,
        text: args.text,
      })

      await message.save()

      const returnMessage = {
        user: { username: context.user.username, id: context.user._id },
        text: message.text,
        createdAt: message.createdAt,
      }

      pubsub.publish('MESSAGE_UPDATE', { messageUpdate: returnMessage })

      return returnMessage
    },
    sendHint: async (root, args, context) => {
      const game = await Game.findById(args.gameID).populate('players')
      if (!game) return null

      if (
        !context.user ||
        !includesPlayer(game, context.user) ||
        !context.user._id.equals(game.currentPlayer._id) ||
        game.gameState !== gameStates.hint
      ) {
        return null
      }

      const hint = {
        player: context.user._id,
        hint: args.hint,
        count: args.count,
      }

      const turnChange = changeTurn(game)
      game.hints = game.hints.concat(hint)

      await game.save()

      const returnHint = {
        player: { username: context.user.username, id: context.user._id },
        hint: hint.hint,
        count: hint.count,
      }

      const gameUpdate = {
        gameID: game.id,
        playerID: context.user.id,
        type: 'Hint',
        hintChange: returnHint,
        turnChange: turnChange,
        gameStateChange: game.gameState,
      }

      pubsub.publish('HINT_UPDATE', { hintUpdate: gameUpdate })

      return returnHint
    },
    makeDeck: async (root, args, context) => {
      if (!context.user) {
        return null
      }

      const newDeck = new Deck({
        owner: context.user._id,
        name: args.name,
        public: args.public,
        cards: args.cards,
      })

      await newDeck.save()

      return {
        id: newDeck._id,
        owner: {
          username: context.user.username,
          id: context.user._id,
        },
        name: newDeck.name,
        public: newDeck.public,
        cards: newDeck.cards,
      }
    },
    updateDeck: async (root, args, context) => {
      if (!context.user) {
        return null
      }

      const deck = await Deck.findById(args.deckID)
      if (!deck || !deck.owner.equals(context.user._id)) return null
      console.log(args)
      deck.name = args.name !== undefined ? args.name : deck.name
      deck.public = args.public !== undefined ? args.public : deck.public
      deck.cards = args.cards !== undefined ? args.cards : deck.cards

      await deck.save()

      return {
        owner: {
          username: context.user.username,
          id: context.user._id,
        },
        name: deck.name,
        public: deck.public,
        cards: deck.cards,
        id: deck.id,
      }
    },
  },
  Subscription: {
    gameUpdate: {
      subscribe: () => pubsub.asyncIterableIterator('GAME_UPDATE'),
    },
    messageUpdate: {
      subscribe: () => pubsub.asyncIterableIterator('MESSAGE_UPDATE'),
    },
    hintUpdate: {
      subscribe: () => pubsub.asyncIterableIterator('HINT_UPDATE'),
    },
    newPlayerJoined: {
      subscribe: () => pubsub.asyncIterableIterator('NEW_PLAYER_JOINED'),
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
      username: isPlayer1(game, game.currentPlayer)
        ? game.players[0].username
        : game.players[1].username,
      id: game.currentPlayer._id,
    },

    board: {
      spots: game.board.spots.map((spot) => ({
        word: spot.word,

        myType: isPlayer1(game, context.user._id)
          ? spot.player1Type
          : spot.player2Type,

        typeRevealed: isPlayer1(game, context.user._id)
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

//currently removing turn limit to get it working first
const changeToHint = (game) => {
  //when going to hint mode, the player who just moved is the hinter now
  //unless only they have wires left
  if (isPlayer1(game, game.currentPlayer._id)) {
    if (player2IsDone(game)) game.currentPlayer = game.players[1]
    else game.currentPlayer = game.players[0]
  } else {
    if (player1IsDone(game)) game.currentPlayer = game.players[0]
    else game.currentPlayer = game.players[1]
  }

  turnChangeMade = {
    turnUpdate: {
      username: game.currentPlayer.username,
      id: game.currentPlayer.id,
    },
  }

  game.gameState = gameStates.hint

  return turnChangeMade
}

const changeToPlaying = (game) => {
  console.log('try change to playing')
  if (isPlayer1(game, game.currentPlayer._id)) {
    game.currentPlayer = game.players[1]
  } else {
    game.currentPlayer = game.players[0]
  }

  turnChangeMade = {
    turnUpdate: {
      username: game.currentPlayer.username,
      id: game.currentPlayer.id,
    },
  }

  game.gameState = gameStates.playing

  return turnChangeMade
}

const changeTurn = (game) => {
  console.log('changeTurn fired')
  if (game.turnsRemaining > 0) //may be hint or playing
  {
    if (game.gameState === gameStates.playing) {
      console.log('about to try change to hint')
      return changeToHint(game)
    } else {
      console.log('about to try change to playing')
      return changeToPlaying(game)
    }
  } else //Go to next playing turn
  {
    return changeToPlaying(game)
  }
}

const isPlayer1 = (game, user) => {
  return user.equals(game.players[0].id)
}

const player1IsDone = (game) => {
  return game.playerState.player1RemainingWires === 0
}

const player2IsDone = (game) => {
  return game.playerState.player2RemainingWires === 0
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

  if (
    game.playerState.player1RemainingWires > 0 ||
    game.playerState.player2RemainingWires > 0
  ) {
    if (isPlayer1 && player1IsDone(game)) {
      turnChangeMade = changeTurn(game)
      if (game.turnsRemaining !== 0) game.turnsRemaining -= 1
    } else if (!isPlayer1 && player2IsDone(game)) {
      turnChangeMade = changeTurn(game)
      if (game.turnsRemaining !== 0) game.turnsRemaining -= 1
    }
  } else {
    endGame(game, gameStates.win)
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
    gameStateChange: game.gameState,
    turnsRemainingChange: game.turnsRemaining,
  }

  return gameUpdate
}

const updateSpotDud = (context, game, spot, isPlayer1) => {
  console.log('is dud fired')
  let turnChangeMade = null

  if (game.turnsRemaining === 0) {
    endGame(game, gameStates.lose)
  } else {
    turnChangeMade = changeTurn(game)
    game.gameState = gameStates.hint
    game.turnsRemaining -= 1
  }
  console.log('635')

  const typeRevealed = isPlayer1
    ? {
        myType: spot.typeRevealed.player1,
        theirType: spot.typeRevealed.player2,
      }
    : {
        myType: spot.typeRevealed.player2,
        theirType: spot.typeRevealed.player1,
      }
  console.log('646')

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
    gameStateChange: game.gameState,
    turnsRemainingChange: game.turnsRemaining,
  }
  console.log('662')

  return gameUpdate
}

const updateSpotBomb = (context, game, spot, isPlayer1) => {
  endGame(game, gameStates.lose)

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
    gameStateChange: gameStates.lose,
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
