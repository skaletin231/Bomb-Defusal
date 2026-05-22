import { gql } from '@apollo/client'

// const GET_GAME = gql`
//   fragment BookDetails on Book {
//     title
//     published
//     author {
//       name
//       born
//     }
//     id
//     genres
//   }
// `

export const GET_GAME = gql`
  query getGame($id: ID!) {
    getGame(id: $id) {
      board {
        spots {
          word
          player1Type
          player2Type
          typeRevealed
        }
      }
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
