const typeDefs = /* GraphQL */ `
  type Query {
    getGame(id: ID!): Game!
  }

  type Spot {
    word: String!
    player1Type: String!
    player2Type: String!
    typeRevealed: String
  }

  type Board {
    spots: [Spot!]!
  }

  type Game {
    id: ID!
    players: [String!]!
    board: Board!
  }

  type Mutation {
    startGame(words: [String!]!, player: String!): Game!
    joinGame(gameID: ID!, player: String!): Game
    makeMove(gameID: ID!, player: String!, index: Int): Game
  }

  # type User {
  #   username: String!
  #   id: ID!
  # }

  # type Token {
  #   value: String!
  # }

  # type Subscription {
  #
  # }
`

module.exports = typeDefs
