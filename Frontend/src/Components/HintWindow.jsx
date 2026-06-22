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
import { GET_HINTS, ME, SEND_HINT, HINT_UPDATE } from '../queries'
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

const HintWindow = ({ gameID }) => {
  const client = useApolloClient()
  const [hintToSend, setHintToSend] = useState('')
  const [countToSend, setCountToSend] = useState(0)

  const bottomRef = useRef(null)

  const hintResults = useQuery(GET_HINTS, {
    variables: { gameID: gameID },
  })

  const { data: meData } = useQuery(ME, {})
  const me = meData.me

  const [sendMessage] = useMutation(SEND_HINT, {
    update: (cache, response) => {
      cache.updateQuery(
        {
          query: GET_HINTS,
          variables: { gameID: gameID },
        },
        (data) => {
          if (!data) return data

          return {
            ...data,
            getHints: [...data.getHints, response.data.sendHint],
          }
        },
      )
      setHintToSend('')
      setCountToSend(0)
    },
  })

  useSubscription(HINT_UPDATE, {
    onData: ({ data }) => {
      const update = data.data.hintUpdate
      console.log('try to update')
      if (update.playerID === me.id) return
      client.cache.updateQuery(
        {
          query: GET_HINTS,
          variables: { gameID: gameID },
        },
        (cacheData) => {
          if (!cacheData) return data
          return {
            ...cacheData,
            getHints: [...cacheData.getHints, update],
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

    sendMessage({
      variables: {
        gameID: gameID,
        hint: hintToSend,
        count: countToSend,
      },
    })
  }

  console.log(hintHistory, me)

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
      <Box
        sx={{ display: 'flex', border: 'solid', borderWidth: '.1rem 0 0 0' }}
      >
        <form onSubmit={trySendHint} style={formStyle}>
          <div style={{ display: 'flex', width: '70%' }}>
            <TextField
              sx={{ width: '70%', margin: '.4rem .1rem' }}
              variant='outlined'
              label='Hint'
              onChange={({ target }) => setHintToSend(target.value)}
            ></TextField>
            {/* <TextField
              sx={{ width: '30%', margin: '.4rem .1rem' }}
              variant='outlined'
              label='Count'
              onChange={({ target }) => setCountToSend(target.value)}
            ></TextField> */}
            <FormControl sx={{ width: '30%', margin: '.4rem .1rem' }}>
              <InputLabel>Count</InputLabel>
              <Select
                value={countToSend}
                label='Count'
                onChange={(e) => setCountToSend(e.target.value)}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
    </>
  )
}

export default HintWindow
