import { Box, Stack, Typography } from '@mui/material'

import {
  useApolloClient,
  useQuery,
  useSubscription,
} from '@apollo/client/react'
import { useEffect, useRef } from 'react'
import { GET_GAME, GET_HINTS, HINT_UPDATE, ME } from '../queries'

const textSX = {
  width: 'auto',
  maxWidth: '50%',
  borderRadius: '5px',
  padding: '.4rem',
}

const stackSX = {
  padding: '0 .2rem',
  height: '211px',
  overflowY: 'auto',
}

const theirHints = {
  alignSelf: 'flex-start',
  backgroundColor: '#FFFFFF',
}

const myHints = {
  alignSelf: 'flex-end',
  color: '#FFFFFF',
  backgroundColor: '#588A29',
}

const HintWindow = ({ gameID, chatView }) => {
  const client = useApolloClient()

  const bottomRef = useRef(null)

  const hintResults = useQuery(GET_HINTS, {
    variables: { gameID: gameID },
  })

  const { data: meData } = useQuery(ME, {})
  const me = meData.me

  useSubscription(HINT_UPDATE, {
    onData: ({ data }) => {
      const update = data.data.hintUpdate
      if (update.playerID === me.id) return
      client.cache.updateQuery(
        {
          query: GET_HINTS,
          variables: { gameID: gameID },
        },
        (cacheData) => {
          if (!cacheData) return cacheData
          return {
            ...cacheData,
            getHints: [...cacheData.getHints, update.hintChange],
          }
        },
      )

      client.cache.updateQuery(
        {
          query: GET_GAME,
          variables: { id: gameID },
        },
        (cacheData) => {
          if (!cacheData) return cacheData
          return {
            ...cacheData,
            getGame: {
              ...cacheData.getGame,
              currentPlayer: {
                username: update.turnChange.turnUpdate.username,
                id: update.turnChange.turnUpdate.id,
              },
              gameState: update.gameStateChange,
            },
          }
        },
      )
    },
  })

  const hintHistory = hintResults.data?.getHints

  useEffect(() => {
    if (hintResults.loading) return
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [hintResults.loading, hintHistory, bottomRef])

  if (hintResults.loading) return

  return (
    <Box sx={chatView === 'Chat' ? { display: 'None' } : null}>
      <Stack sx={stackSX} spacing={1}>
        {hintHistory.map((hint, id) => (
          <Typography
            key={id}
            sx={[textSX, hint.player.id === me.id ? myHints : theirHints]}
          >
            {hint.hint} : {hint.count}
          </Typography>
        ))}
        <div ref={bottomRef} />
      </Stack>
    </Box>
  )
}

export default HintWindow
