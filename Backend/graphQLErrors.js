const { GraphQLError } = require('graphql')

const graphQLErrorCodes = {
  notFound: 'NOT_FOUND',
  unauthenticated: 'UNAUTHENTICATED',
  badInput: 'BAD_USER_INPUT',
  limitReached: 'LIMIT_MAXED',
}

//used for not finding a deck, but also for finding one you don't own
function deckNotFoundError() {
  throw new GraphQLError(
    'Either no deck was found with this id, or you do not have permission to access it.',
    {
      extensions: {
        code: graphQLErrorCodes.notFound,
      },
    },
  )
}

function notLoggedInError() {
  throw new GraphQLError('Not logged in.', {
    extensions: {
      code: graphQLErrorCodes.unauthenticated,
    },
  })
}

function notAPlayerError() {
  throw new GraphQLError('Game not found or not in the game', {
    extensions: {
      code: graphQLErrorCodes.notFound,
    },
  })
}

function gameNotFoundError() {
  throw new GraphQLError('No game with this ID found', {
    extensions: {
      code: graphQLErrorCodes.badInput,
    },
  })
}

function gameFullError() {
  throw new GraphQLError('This game is full already', {
    extensions: {
      code: graphQLErrorCodes.limitReached,
    },
  })
}

function notYourTurnError() {
  throw new GraphQLError('It is not your turn', {
    extensions: {
      code: graphQLErrorCodes.badInput,
    },
  })
}

function invalidMoveError() {
  throw new GraphQLError('invalid move', {
    extensions: {
      code: graphQLErrorCodes.badInput,
    },
  })
}

function wrongGamestateError() {
  throw new GraphQLError('Invalid Action', {
    extensions: {
      code: graphQLErrorCodes.badInput,
    },
  })
}

function cantAccessDeckError() {
  throw new GraphQLError('Deck not found or you do not own it', {
    extensions: {
      code: graphQLErrorCodes.notFound,
    },
  })
}

module.exports = {
  deckNotFoundError,
  notLoggedInError,
  notAPlayerError,
  gameNotFoundError,
  gameFullError,
  notYourTurnError,
  invalidMoveError,
  wrongGamestateError,
  cantAccessDeckError,
}
