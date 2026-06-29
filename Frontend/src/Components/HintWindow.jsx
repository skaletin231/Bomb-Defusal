import {
  Button,
  Box,
  Stack,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import NumberField from './NumberField'

import { GET_HINTS, ME, SEND_HINT, HINT_UPDATE, GET_GAME } from '../queries'
import {
  useApolloClient,
  useMutation,
  useQuery,
  useSubscription,
} from '@apollo/client/react'
import { useState, useEffect, useRef } from 'react'

const textSX = {
  width: 'auto',
  maxWidth: '50%',
  borderRadius: '5px',
  padding: '.4rem',
}

const formStyle = {
  justifyContent: 'flex-start',
  flexDirection: 'row',
  display: 'flex',
}

const stackSX = {
  padding: '0 .2rem',
  height: '150px',
  overflowY: 'auto',
}

const theirHints = {
  alignSelf: 'flex-start',
  backgroundColor: '#a3a3a3',
}

const myHints = {
  alignSelf: 'flex-end',
  backgroundColor: '#8bff3e',
}

const HintWindow = ({ gameID, show }) => {
  const client = useApolloClient()
  const [hintToSend, setHintToSend] = useState('')
  const [error, setError] = useState(false)
  const [countToSend, setCountToSend] = useState(0)

  const bottomRef = useRef(null)

  const hintResults = useQuery(GET_HINTS, {
    variables: { gameID: gameID },
  })

  const { data: meData } = useQuery(ME, {})
  const me = meData.me

  const [sendHint] = useMutation(SEND_HINT, {
    update: (cache, response) => {
      cache.updateQuery(
        {
          query: GET_HINTS,
          variables: { gameID: gameID },
        },
        (data) => {
          if (!data || !response.data?.sendHint) return data

          return {
            ...data,
            getHints: [...data.getHints, response.data.sendHint],
          }
        },
      )

      cache.updateQuery(
        {
          query: GET_GAME,
          variables: { id: gameID },
        },
        (cacheData) => {
          if (!cacheData) return cacheData
          const newPlayer =
            me.id === cacheData.getGame.players[0].id
              ? cacheData.getGame.players[1]
              : cacheData.getGame.players[0]
          return {
            ...cacheData,
            getGame: {
              ...cacheData.getGame,
              currentPlayer: newPlayer,
              gameState: 'Playing',
            },
          }
        },
      )

      setHintToSend('')
      setCountToSend(0)
    },
  })

  useSubscription(HINT_UPDATE, {
    onData: ({ data }) => {
      console.log('hint subscription fired', data)

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

      console.log('about to update getgame')

      client.cache.updateQuery(
        {
          query: GET_GAME,
          variables: { id: gameID },
        },
        (cacheData) => {
          console.log('at cache')
          if (!cacheData) return cacheData
          console.log('there was cache: ', cacheData)
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

  const trySendHint = async (event) => {
    event.preventDefault()
    if (error) return
    sendHint({
      variables: {
        gameID: gameID,
        hint: hintToSend,
        count: countToSend,
      },
    })
  }

  const formatHint = (hint) => {
    setHintToSend(hint)
    setError(hint.includes(' '))
  }

  return (
    <>
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
      {show && (
        <Box
          sx={{ display: 'flex', border: 'solid', borderWidth: '.1rem 0 0 0' }}
        >
          <form onSubmit={trySendHint} style={formStyle}>
            <div
              style={{ display: 'flex', width: '70%', alignItems: 'center' }}
            >
              <TextField
                error={error}
                sx={{ width: '70%', margin: '.4rem .1rem' }}
                variant='outlined'
                label='Hint'
                onChange={({ target }) => formatHint(target.value)}
              ></TextField>
              <NumberField
                style={{ width: '30%', margin: '.4rem .1rem' }}
                label='Count'
                value={countToSend}
                min={0}
                max={10}
                onValueChange={(val) => setCountToSend(Math.trunc(val))}
              />
            </div>

            <Button
              type='submit'
              sx={{ marginLeft: 'auto', margin: '.4rem' }}
              variant='contained'
            >
              Send
            </Button>
          </form>
        </Box>
      )}
    </>
  )
}

export default HintWindow
