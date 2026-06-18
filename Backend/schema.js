const typeDefs = /* GraphQL */ `
  type Query {
    getGame(id: ID!): Game
    getUser(auth0_ID: String!): User
    getMessages(gameID: ID!): [ChatMessage!]
    me: User
  }

  type Revealed {
    myType: String
    theirType: String
  }

  type Spot {
    word: String!
    myType: String!
    typeRevealed: Revealed!
  }

  type Board {
    spots: [Spot!]!
  }

  type Game {
    id: ID!
    players: [GameUser!]!
    currentPlayer: GameUser
    board: Board!
    gameState: String!
    turnsRemaining: Int!
  }

  scalar DateTime

  type ChatMessage {
    user: GameUser!
    text: String!
    createdAt: DateTime!
  }

  type Mutation { #player should be obtainable from context now if player is me
    startGame(words: [String!]!): Game
    joinGame(gameID: ID!): Game
    makeMove(gameID: ID!, index: Int!): Game
    endTurn(gameID: ID!): Game
    addUser(username: String!, email: String!, auth0_ID: String!): User
    updateUserInfo(username: String!): User
    sendMessage(gameID: ID!, text: String!): ChatMessage
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
  }

  type Subscription {
    gameUpdate: GameUpdate!
    messageUpdate: ChatMessage!
  }

  # type Token {
  #   value: String!
  # }

  # type Subscription {
  #
  # }
`

module.exports = typeDefs
