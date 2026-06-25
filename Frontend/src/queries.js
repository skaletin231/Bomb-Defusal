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
      gameState
      turnsRemaining
    }
  }
`

export const GET_MESSAGES = gql`
  query getMessages($gameID: ID!) {
    getMessages(gameID: $gameID) {
      user {
        username
        id
      }
      text
      createdAt
    }
  }
`

export const GET_HINTS = gql`
  query getHints($gameID: ID!) {
    getHints(gameID: $gameID) {
      player {
        username
        id
      }
      hint
      count
    }
  }
`

export const SEND_MESSAGE = gql`
  mutation sendMessage($gameID: ID!, $text: String!) {
    sendMessage(gameID: $gameID, text: $text) {
      user {
        username
        id
      }
      text
      createdAt
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
      gameState
      turnsRemaining
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
      gameState
      turnsRemaining
    }
  }
`

export const START_GAME = gql`
  mutation startGame($words: [String!]!) {
    startGame(words: $words) {
      id
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

export const SEND_HINT = gql`
  mutation sendHint($gameID: ID!, $hint: String!, $count: Int!) {
    sendHint(gameID: $gameID, hint: $hint, count: $count) {
      player {
        username
        id
      }
      hint
      count
    }
  }
`

export const GAME_UPDATE = gql`
  subscription {
    gameUpdate {
      gameID
      playerID
      type
      changedSpots {
        word
        typeRevealed {
          myType
          theirType
        }
      }
      turnChange {
        turnUpdate {
          username
          id
        }
      }
      gameStateChange
      turnsRemainingChange
    }
  }
`

export const MESSAGE_UPDATE = gql`
  subscription {
    messageUpdate {
      user {
        username
        id
      }
      text
      createdAt
    }
  }
`

export const HINT_UPDATE = gql`
  subscription {
    hintUpdate {
      gameID
      playerID
      type
      hintChange {
        player {
          username
          id
        }
        hint
        count
      }
    }
  }
`

//#region Deck Related Stuff

export const GET_MY_DECKS = gql`
  query {
    getMyDecks {
      id
      owner {
        username
        id
      }
      name
      public
      cards
    }
  }
`

export const GET_ALL_DECKS = gql`
  query {
    getAllDecks {
      owner {
        username
        id
      }
      name
      public
      cards
    }
  }
`

export const MAKE_DECK = gql`
  mutation makeDeck($name: String!, $public: Boolean!, $cards: [String!]!) {
    makeDeck(name: $name, public: $public, cards: $cards) {
      owner {
        username
        id
      }
      name
      public
      cards
    }
  }
`

export const UPDATE_DECK = gql`
  mutation updateDeck(
    $deckID: ID!
    $name: String!
    $public: Boolean!
    $cards: [String!]!
  ) {
    updateDeck(deckID: $deckID, name: $name, public: $public, cards: $cards) {
      owner {
        username
        id
      }
      name
      public
      cards
    }
  }
`
//#endregions
