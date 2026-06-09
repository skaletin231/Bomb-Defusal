import { gql } from '@apollo/client'

export const GET_GAME = gql`
  query getGame($id: ID!) {
    getGame(id: $id) {
      board {
        spots {
          word
          myType
          typeRevealed {
            myType
            theirType
          }
        }
      }
      currentPlayer {
        username
        id
      }
    }
  }
`

export const JOIN_GAME = gql`
  mutation joinGame($gameID: ID!) {
    joinGame(gameID: $gameID) {
      id
    }
  }
`

export const MAKE_MOVE = gql`
  mutation makeMove($gameID: ID!, $index: Int!) {
    makeMove(gameID: $gameID, index: $index) {
      board {
        spots {
          word
          myType
          typeRevealed {
            myType
            theirType
          }
        }
      }
      currentPlayer {
        username
        id
      }
    }
  }
`
export const END_TURN = gql`
  mutation endTurn($gameID: ID!) {
    endTurn(gameID: $gameID) {
      board {
        spots {
          word
          myType
          typeRevealed {
            myType
            theirType
          }
        }
      }
      currentPlayer {
        username
        id
      }
    }
  }
`

export const START_GAME = gql`
  mutation startGame($words: [String!]!) {
    startGame(words: $words) {
      board {
        spots {
          word
          myType
          typeRevealed {
            myType
            theirType
          }
        }
      }
      currentPlayer {
        username
        id
      }
    }
  }
`

export const ADD_USER = gql`
  mutation addUser($username: String!, $email: String!, $auth0_ID: String!) {
    addUser(username: $username, email: $email, auth0_ID: $auth0_ID) {
      username
      email
      auth0_ID
    }
  }
`
export const GET_USER = gql`
  query getUser($auth0_ID: String!) {
    getUser(auth0_ID: $auth0_ID) {
      username
      email
      auth0_ID
    }
  }
`

export const ME = gql`
  query me {
    me {
      id
      username
      email
    }
  }
`

export const UPDATE_USER_INFO = gql`
  mutation updateUserInfo($username: String!) {
    updateUserInfo(username: $username) {
      id
      username
      email
    }
  }
`
// export const ADD_BOOK = gql`
//   mutation addBook(
//     $title: String!
//     $author: String!
//     $published: Int!
//     $genres: [String!]!
//   ) {
//     addBook(
//       title: $title
//       author: $author
//       published: $published
//       genres: $genres
//     ) {
//       title
//       published
//       author {
//         name
//         born
//       }
//       id
//       genres
//     }
//   }
// `

// export const BOOK_ADDED = gql`
//   subscription {
//     bookAdded {
//       title
//       published
//       author {
//         name
//         born
//         id
//         bookCount
//       }
//       id
//       genres
//     }
//   }
// `
