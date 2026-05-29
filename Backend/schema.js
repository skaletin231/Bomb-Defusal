const typeDefs = /* GraphQL */ `
  type Query {
    getGame(id: ID!, player: String!): Game
    getUser(auth0_ID: String!): User
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
    players: [String!]!
    currentPlayer: String
    board: Board!
  }

  type Mutation {
    startGame(words: [String!]!, player: String!): Game
    joinGame(gameID: ID!, player: String!): Game
    makeMove(gameID: ID!, player: String!, index: Int!): Game
    endTurn(gameID: ID!, player: String!): Game
    addUser(username: String!, email: String!, auth0_ID: String!): User
    updateUserInfo(username: String!): User
  }

  type User {
    username: String
    email: String
    auth0_ID: String!
    id: ID!
  }

  # type Token {
  #   value: String!
  # }

  # type Subscription {
  #
  # }
`

module.exports = typeDefs
