const typeDefs = /* GraphQL */ `
  type Query {
    getGame(id: ID!): Game
    getUser(auth0_ID: String!): User
    getMessages(gameID: ID!): [ChatMessage!]
    getHints(gameID: ID!): [Hint!]
    getMyDecks: [Deck!]
    getMyDeck(deckID: ID!): Deck
    getAllDecks: AllDecks!
    me: User
  }

  type Revealed {
    myType: String
    theirType: String
  }

  type AllDecks {
    myDecks: [Deck!]
    publicDecks: [Deck!]
  }

  type Spot {
    word: String!
    myType: String!
    typeRevealed: Revealed!
  }

  type Board {
    spots: [Spot!]!
  }

  type Hint {
    player: GameUser!
    hint: String!
    count: Int!
  }

  type Game {
    id: ID!
    players: [GameUser!]!
    currentPlayer: GameUser
    board: Board!
    gameState: String!
    turnsRemaining: Int!
    maxTurns: Int!
    hints: [Hint!]!
    mistakes: Int!
    mistakeLimit: Int!
    remainingWires: Int!
  }

  scalar DateTime

  type ChatMessage {
    user: GameUser!
    text: String!
    createdAt: DateTime!
  }

  type Deck {
    id: ID
    owner: GameUser!
    name: String!
    public: Boolean!
    cards: [String!]!
  }

  type Mutation { #player should be obtainable from context now if player is me
    startGame(deckID: ID!, mistakeLimit: Int, turnLimit: Int): ID
    joinGame(gameID: ID!): Game
    makeMove(gameID: ID!, index: Int!): Game
    endTurn(gameID: ID!): Game
    addUser(username: String!, email: String!, auth0_ID: String!): User
    updateUserInfo(username: String!): User
    sendMessage(gameID: ID!, text: String!): ChatMessage
    sendHint(gameID: ID!, hint: String!, count: Int!): Hint
    makeDeck(name: String!, public: Boolean!, cards: [String!]!): Deck
    updateDeck(
      deckID: ID!
      name: String
      public: Boolean
      cards: [String!]
    ): Deck
    removeDeck(deckID: ID!): ID
    copyDeck(deckID: ID!): Deck
  }

  type User {
    username: String
    email: String
    auth0_ID: String!
    id: ID!
  }

  type GameUser {
    username: String
    id: ID!
  }

  type SpotPatch {
    word: String!
    typeRevealed: Revealed!
  }

  type GamePatch {
    turnUpdate: GameUser!
  }

  type GameUpdate {
    gameID: ID!
    playerID: ID!
    type: String!
    changedSpots: [SpotPatch!]
    turnChange: GamePatch
    gameStateChange: String
    turnsRemainingChange: Int
    mistakes: Int
    hintChange: Hint
    gameUser: GameUser
  }

  type Subscription {
    gameUpdate: GameUpdate!
    messageUpdate: ChatMessage!
    hintUpdate: GameUpdate!
    newPlayerJoined: GameUpdate!
  }
`

module.exports = typeDefs
