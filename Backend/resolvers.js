const Game = require('./models/game')
const User = require('./models/user')
const Deck = require('./models/decks')
const Message = require('./models/message')
const {
  deckNotFoundError,
  notLoggedInError,
  notAPlayerError,
  gameNotFoundError,
  gameFullError,
  notYourTurnError,
  invalidMoveError,
  wrongGamestateError,
  cantAccessDeckError,
  notLoggedInOrGuestError,
} = require('./graphQLErrors')
const { MakeBoard } = require('./utils/GameboardUtils')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const gameStates = {
  hint: 'Hint',
  win: 'Win',
  lose: 'Lose',
  playing: 'Playing',
}

const { GraphQLError } = require('graphql')
const { GraphQLDateTime } = require('graphql-scalars')

const resolvers = {
  DateTime: GraphQLDateTime,
  Query: {
    getGame: async (root, args, context) => {
      console.log('get game ran')
      checkLoggedInOrGuest(context)

      const game = await Game.findById(args.id).populate('players.officialUser')
      if (!game || !includesPlayer(game, context)) notAPlayerError()

      const returnVal = returnInfo(game, context)

      return returnVal
    },
    getUser: async (root, args) => {
      const user = await User.findOne({ auth_ID: args.auth_ID })

      if (!user) return null

      return { ...user, isGuest: false }
    },
    me: (root, args, context) => {
      if (context.user) {
        return {
          username: context.user.username,
          email: context.user.email,
          auth0_ID: context.user.auth0_ID,
          id: context.user._id,
          isGuest: false,
        }
      }

      if (context.req.signedCookies?.game_session) {
        return {
          username: 'guest',
          id: context.req.signedCookies?.game_session,
          isGuest: true,
        }
      }

      return null
    },
    getMessages: async (root, args, context) => {
      checkLoggedInOrGuest(context)

      const game = await Game.findById(args.gameID).populate(
        'players.officialUser',
      )

      if (!game || !includesPlayer(game, context)) notAPlayerError()

      const messages = await Message.find({ gameID: args.gameID }).populate(
        'user.officialUser',
      )
      return messages.map((message) => ({
        user: convertGamePlayer(message.user),
        text: message.text,
        createdAt: message.createdAt,
      }))
    },
    getHints: async (root, args, context) => {
      checkLoggedInOrGuest(context)

      const game = await Game.findById(args.gameID).populate(
        'players.officialUser',
      )

      if (!game || !includesPlayer(game, context)) notAPlayerError()

      return game.hints.map((fullHint) => ({
        player: convertGamePlayer(fullHint.player),
        hint: fullHint.hint,
        count: fullHint.count,
      }))
    },
    getMyDecks: async (root, __, context) => {
      checkIsLoggedIn(context)

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
        notes: deck.notes ?? '',
      }))
    },
    getMyDeck: async (root, args, context) => {
      checkIsLoggedIn(context)

      const myDeck = await Deck.findById(args.deckID).populate('owner')

      if (!myDeck || !myDeck.owner._id.equals(context.user._id))
        deckNotFoundError()

      return {
        id: myDeck._id,
        owner: {
          username: myDeck.owner.username,
          id: myDeck.owner._id,
        },
        name: myDeck.name,
        public: myDeck.public,
        cards: myDeck.cards,
        notes: myDeck.notes ?? '',
      }
    },
    getAllDecks: async (root, __, context) => {
      let myDecks = []
      if (context.user)
        myDecks = await Deck.find({
          owner: context.user._id,
        }).populate('owner')

      const query = {
        public: true,
      }

      if (context.user) {
        query.owner = { $ne: context.user._id }
      }

      const publicDecks = await Deck.find(query).populate('owner')

      const myDecksObject = myDecks.map((deck) => ({
        id: deck.id,
        owner: {
          username: deck.owner.username,
          id: deck.owner._id,
        },
        name: deck.name,
        public: deck.public,
        cards: deck.cards,
        notes: deck.notes ?? '',
      }))

      const publicDecksObject = publicDecks.map((deck) => ({
        id: deck.id,
        owner: {
          username: deck.owner.username,
          id: deck.owner._id,
        },
        name: deck.name,
        public: deck.public,
        cards: deck.cards,
        notes: deck.notes ?? '',
      }))

      return {
        myDecks: myDecksObject,
        publicDecks: publicDecksObject,
      }
    },
    getOneDeck: async (root, args, context) => {
      checkIsLoggedIn(context)

      const deck = await Deck.findById(args.deckID).populate('owner')

      if (!deck || !(deck.owner._id.equals(context.user._id) || deck.public))
        deckNotFoundError()

      return {
        id: deck._id,
        owner: {
          username: deck.owner.username,
          id: deck.owner._id,
        },
        name: deck.name,
        public: deck.public,
        cards: deck.cards,
        notes: deck.notes ?? '',
      }
    },
  },
  Mutation: {
    startGame: async (root, args, context) => {
      /*
        deckID: ID!
        gridsX: Int
        gridsY: Int
        turnLimit: Int
        mistakeLimit: Int
        wordsPerHint: Int
      */
      const deck = await Deck.findById(args.deckID)
      if (!deck) deckNotFoundError()

      const canUse = deck.public || deck.owner.equals(context.user?._id)

      if (!canUse) deckNotFoundError()

      const board = MakeBoard(deck.cards)

      let player = {}

      if (context.user) {
        player = {
          officialUser: context.user,
        }
      } else {
        const token = crypto.randomUUID()
        context.res.cookie('game_session', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          signed: true,
          sameSite: 'lax',
        })

        player = {
          guestUser: {
            username: 'Guest',
            id: token,
          },
        }
      }

      const game = new Game({
        players: [player],
        currentPlayer: player,
        board: {
          spots: board,
        },
        gameState: gameStates.hint,
        turnsRemaining: args.turnLimit, //if not given, these are udnefined so goes to default
        maxTurns: args.turnLimit,
        mistakeLimit: args.mistakeLimit,
      })

      await game.save()

      return game._id
    },
    joinGame: async (root, args, context) => {
      const game = await Game.findById(args.gameID).populate(
        'players.officialUser',
      )
      if (!game) gameNotFoundError()

      if (includesPlayer(game, context)) {
        return returnInfo(game, context)
      }

      if (game.players.length == 2) {
        gameFullError()
      }
      let player = {}
      let returnID = ''

      if (context.user) {
        player = {
          officialUser: context.user,
        }
        returnID = context.user._id
      } else {
        const token = crypto.randomUUID()

        context.res.cookie('game_session', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          signed: true,
          sameSite: 'lax',
        })

        player = {
          guestUser: {
            username: 'Guest',
            id: token,
          },
        }
        returnID = token
      }

      game.players = game.players.concat(player)

      await game.save()

      const gameInfo = returnInfo(game, context)

      const gameUpdate = {
        gameID: game.id,
        playerID: returnID,
        type: 'New Player',
        gameUser: gameInfo.players[1],
      }

      await pubsub.publish('NEW_PLAYER_JOINED', { newPlayerJoined: gameUpdate })

      return gameInfo
    },
    makeMove: async (root, args, context) => {
      checkLoggedInOrGuest(context)

      const game = await Game.findById(args.gameID).populate(
        'players.officialUser',
      )

      if (!game || !includesPlayer(game, context)) notAPlayerError()

      if (getIDFromContext(context) !== getIDFromPlayer(game.currentPlayer))
        notYourTurnError()

      //if (!context.user._id.equals(game.currentPlayer._id)) notYourTurnError()

      if (game.gameState !== gameStates.playing) wrongGamestateError()

      const myTypeRevealed = isPlayer1(game, context)
        ? game.board.spots[args.index].typeRevealed.player1
        : game.board.spots[args.index].typeRevealed.player2

      //initial check to make sure this move was not already made
      if (myTypeRevealed !== null) {
        invalidMoveError()
      }

      if (isPlayer1(game, context)) {
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
              isPlayer1(game, context),
            )
            await game.save()
            await pubsub.publish('GAME_UPDATE', { gameUpdate: returnVal })
            return returnInfo(game, context)
          }

          let returnVal = updateSpotWire(
            context,
            game,
            game.board.spots[args.index],
            isPlayer1(game, context),
          )
          await game.save()
          await pubsub.publish('GAME_UPDATE', { gameUpdate: returnVal })
          return returnInfo(game, context)
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
              isPlayer1(game, context),
            )
            await game.save()
            await pubsub.publish('GAME_UPDATE', { gameUpdate: returnVal })

            return returnInfo(game, context)
          }

          let returnVal = updateSpotWire(
            context,
            game,
            game.board.spots[args.index],
            isPlayer1(game, context),
          )
          await game.save()
          await pubsub.publish('GAME_UPDATE', { gameUpdate: returnVal })
          return returnInfo(game, context)
        }
      }

      let returnValDud = updateSpotDud(
        context,
        game,
        game.board.spots[args.index],
        isPlayer1(game, context),
      )

      await game.save()

      await pubsub.publish('GAME_UPDATE', { gameUpdate: returnValDud })

      return returnInfo(game, context)
    },
    endTurn: async (root, args, context) => {
      checkLoggedInOrGuest(context)

      const game = await Game.findById(args.gameID).populate(
        'players.officialUser',
      )

      if (!game || !includesPlayer(game, context)) notAPlayerError()

      if (getIDFromContext(context) !== getIDFromPlayer(game.currentPlayer))
        notYourTurnError()

      let turnChangeMade = changeTurn(game, context)

      if (game.turnsRemaining > 0) game.turnsRemaining -= 1

      await game.save()

      const gameUpdate = {
        gameID: game.id,
        playerID: getIDFromContext(context),
        type: 'Turn End',
        turnChange: turnChangeMade,
        turnsRemainingChange: game.turnsRemaining,
        gameStateChange: game.gameState,
      }

      await pubsub.publish('GAME_UPDATE', { gameUpdate })

      return returnInfo(game, context)
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

      return { ...newUser, isGuest: false }
    },
    updateUserInfo: async (root, args, context) => {
      checkIsLoggedIn(context)

      const user = context.user
      user.username = args.username

      await user.save()

      return { ...user, isGuest: false }
    },
    sendMessage: async (root, args, context) => {
      checkLoggedInOrGuest(context)

      const game = await Game.findById(args.gameID)
      if (!game || !includesPlayer(game, context)) notAPlayerError()

      const player = convertToDatabasePlayer(game, context)

      const message = new Message({
        gameID: args.gameID,
        user: player,
        text: args.text,
      })

      await message.save()

      let returnMessage = {}

      if (context.user) {
        returnMessage = {
          user: { username: context.user.username, id: context.user._id },
          text: message.text,
          createdAt: message.createdAt,
        }
      } else {
        returnMessage = {
          user: {
            username: player.guestUser.username,
            id: player.guestUser.id,
          },
          text: message.text,
          createdAt: message.createdAt,
        }
      }

      await pubsub.publish('MESSAGE_UPDATE', { messageUpdate: returnMessage })

      return returnMessage
    },
    sendHint: async (root, args, context) => {
      checkLoggedInOrGuest(context)

      const game = await Game.findById(args.gameID).populate(
        'players.officialUser',
      )
      if (!game || !includesPlayer(game, context)) notAPlayerError()

      if (getIDFromContext(context) !== getIDFromPlayer(game.currentPlayer))
        notYourTurnError()

      if (game.gameState !== gameStates.hint) wrongGamestateError()

      const player = convertToDatabasePlayer(game, context)

      const hint = {
        player: player,
        hint: args.hint,
        count: args.count,
      }

      const turnChange = changeTurn(game, context)
      game.hints = game.hints.concat(hint)

      await game.save()

      let returnHint = {}

      if (context.user) {
        returnHint = {
          player: { username: context.user.username, id: context.user._id },
          hint: hint.hint,
          count: hint.count,
        }
      } else {
        returnHint = {
          player: {
            username: player.guestUser.username,
            id: player.guestUser.id,
          },
          hint: hint.hint,
          count: hint.count,
        }
      }

      const gameUpdate = {
        gameID: game.id,
        playerID: getIDFromContext(context),
        type: gameStates.hint,
        hintChange: returnHint,
        turnChange: turnChange,
        gameStateChange: game.gameState,
      }

      await pubsub.publish('HINT_UPDATE', { hintUpdate: gameUpdate })

      return returnHint
    },
    makeDeck: async (root, args, context) => {
      checkIsLoggedIn(context)

      const newDeck = new Deck({
        owner: context.user._id,
        name: 'New Deck',
        public: false,
        cards: [],
        notes: '',
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
        notes: newDeck.notes,
      }
    },
    updateDeck: async (root, args, context) => {
      checkIsLoggedIn(context)
      console.log('in update backend')

      const deck = await Deck.findById(args.deckID)
      if (!deck || !deck.owner.equals(context.user._id)) cantAccessDeckError()

      deck.name = args.name !== undefined ? args.name : deck.name
      deck.public = args.public !== undefined ? args.public : deck.public
      deck.cards = args.cards !== undefined ? args.cards : deck.cards
      deck.notes = args.notes !== undefined ? args.notes : deck.notes

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
        notes: deck.notes,
      }
    },
    removeDeck: async (root, args, context) => {
      checkIsLoggedIn(context)

      const deck = await Deck.findById(args.deckID)
      if (!deck || !deck.owner.equals(context.user._id)) cantAccessDeckError()

      const deleted = await Deck.findByIdAndDelete(args.deckID)

      return deleted._id
    },
    copyDeck: async (root, args, context) => {
      checkIsLoggedIn(context)

      const deck = await Deck.findById(args.deckID)
      if (!deck || !deck.owner.equals(context.user._id)) cantAccessDeckError()

      const newDeck = new Deck({
        owner: context.user._id,
        name: deck.name,
        public: false,
        cards: deck.cards,
        notes: deck.notes ?? '',
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
        notes: newDeck.notes ?? '',
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

const changeToHint = (game, context) => {
  turnChangeMade = changeTurnStateHelper(game, context, 'hint')

  game.gameState = gameStates.hint

  return turnChangeMade
}

const changeToPlaying = (game, context) => {
  turnChangeMade = changeTurnStateHelper(game, context, 'playing')

  game.gameState = gameStates.playing

  return turnChangeMade
}

const changeTurnStateHelper = (game, context, newState) => {
  if (player2IsDone(game)) {
    game.currentPlayer =
      newState === 'playing' ? game.players[0] : game.players[1]
  } else if (player1IsDone(game)) {
    game.currentPlayer =
      newState === 'playing' ? game.players[1] : game.players[0]
  } else {
    if (isPlayer1(game, context)) {
      game.currentPlayer =
        newState === 'playing' ? game.players[1] : game.players[0]
    } else {
      game.currentPlayer =
        newState === 'playing' ? game.players[0] : game.players[1]
    }
  }

  turnChangeMade = {
    turnUpdate: convertGamePlayer(game.currentPlayer),
  }

  return turnChangeMade
}

const changeTurn = (game, context) => {
  if (game.turnsRemaining > 0) //may be hint or playing
  {
    if (game.gameState === gameStates.playing) {
      return changeToHint(game, context)
    } else {
      return changeToPlaying(game, context)
    }
  } else //Go to next playing turn
  {
    return changeToPlaying(game, context)
  }
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
      turnChangeMade = changeTurn(game, context)
      if (game.turnsRemaining !== 0) game.turnsRemaining -= 1
    } else if (!isPlayer1 && player2IsDone(game)) {
      turnChangeMade = changeTurn(game, context)
      if (game.turnsRemaining !== 0) game.turnsRemaining -= 1
    }
  } else {
    endGame(game, gameStates.win)
  }

  let gameUpdate = getGeneralGameUpdate(game, context, turnChangeMade)
  gameUpdate.changedSpots = [
    {
      word: spot.word,
      typeRevealed: {
        myType: 'wire',
        theirType: 'wire',
      },
    },
  ]

  return gameUpdate
}

const getGeneralGameUpdate = (game, context, turnChangeMade) => {
  const gameUpdate = {
    gameID: game.id,
    playerID: getIDFromContext(context),
    type: 'Move Made',
    turnChange: turnChangeMade,
    gameStateChange: game.gameState,
    turnsRemainingChange: game.turnsRemaining,
  }

  return gameUpdate
}

const updateSpotDud = (context, game, spot, isPlayer1) => {
  let turnChangeMade = null

  game.mistakes++

  if (
    game.turnsRemaining === 0 ||
    (game.mistakeLimit > -1 && game.mistakes > game.mistakeLimit)
  ) {
    endGame(game, gameStates.lose)
  } else {
    turnChangeMade = changeTurn(game, context)
    game.gameState = gameStates.hint
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

  let gameUpdate = getGeneralGameUpdate(game, context, turnChangeMade)
  gameUpdate.changedSpots = [
    {
      word: spot.word,
      typeRevealed: typeRevealed,
    },
  ]
  gameUpdate.mistakes = game.mistakes

  return gameUpdate
}

const updateSpotBomb = (context, game, spot, isPlayer1) => {
  endGame(game, gameStates.lose)

  let gameUpdate = getGeneralGameUpdate(game, context, turnChangeMade)
  gameUpdate.changedSpots = [
    {
      word: spot.word,
      typeRevealed: {
        myType: 'bomb',
        theirType: 'bomb',
      },
    },
  ]

  return gameUpdate
}

//#region Data Helpers

const returnInfo = (game, context) => {
  const currentPlayer =
    getIDFromPlayer(game.players[0]) === getIDFromPlayer(game.currentPlayer)
      ? convertGamePlayer(game.players[0])
      : convertGamePlayer(game.players[1])

  return {
    id: game.id,

    players: game.players.map((player) => ({
      ...convertGamePlayer(player),
    })),

    currentPlayer: currentPlayer,

    board: {
      spots: game.board.spots.map((spot) => ({
        word: spot.word,

        myType: isPlayer1(game, context) ? spot.player1Type : spot.player2Type,

        typeRevealed: isPlayer1(game, context)
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
    remainingWires: game.board.spots.filter(
      (spot) => spot.typeRevealed.player1 === 'wire',
    ).length,
    maxTurns: game.maxTurns,
    mistakes: game.mistakes,
    mistakeLimit: game.mistakeLimit,
  }
}

const includesPlayer = (game, context) => {
  const playerID = getIDFromContext(context)
  console.log(playerID)

  const isAPlayer = game.players.some(
    (player) => convertGamePlayer(player).id == playerID,
  )
  if (isAPlayer) {
    return true
  }

  return false
}

const isPlayer1 = (game, context) => {
  return getIDFromContext(context) === getIDFromPlayer(game.players[0])
}

const player1IsDone = (game) => {
  return game.playerState.player1RemainingWires === 0
}

const player2IsDone = (game) => {
  return game.playerState.player2RemainingWires === 0
}

const checkIsLoggedIn = (context) => {
  if (!context.user) notLoggedInError()
}

const checkLoggedInOrGuest = (context) => {
  if (context.user || context.req.signedCookies?.game_session) return
  notLoggedInOrGuestError()
}

//This converts from teh player that is stored in a DB to what is reutrned to the front end
//the DB item could be either a officialUser or a guestUser, where officialUser is an actual user object
//guest user is something created at the time of joining that only exists in this game and temporarily on the client side
//this should allow most of the user.code to change easily to this
const convertGamePlayer = (player) => {
  if (player.officialUser) {
    return {
      username: player.officialUser.username,
      id: String(player.officialUser._id),
    }
  } else {
    return {
      username: player.guestUser.username,
      id: player.guestUser.id,
    }
  }
}

const convertToDatabasePlayer = (game, context) => {
  if (context.user) {
    return {
      officialUser: context.user._id,
    }
  } else {
    const player = game.players.find(
      (p) => p.guestUser?.id === context.req.signedCookies?.game_session,
    )
    return player
  }
}

const getIDFromContext = (context) => {
  if (context.user) {
    return String(context.user._id)
  } else {
    return context.req.signedCookies?.game_session
  }
}

const getIDFromPlayer = (player) => {
  if (player.officialUser) {
    if (player.officialUser._id) return String(player.officialUser._id)
    return String(player.officialUser._id)
  } else {
    return player.guestUser.id
  }
}

//#endregions

module.exports = resolvers
