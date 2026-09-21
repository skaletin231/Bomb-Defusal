import { useMutation, useQuery } from '@apollo/client/react'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { Box, Button, TextField } from '@mui/material'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { GET_GAME, GET_HINTS, ME, SEND_HINT } from '../queries'

const hintTextBox = {
  '& .MuiOutlinedInput-root': {
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      transform: 'translateY(6px)',
      backgroundColor: '#E1E1E1',
      border: '.15rem solid #84582E',
      borderRadius: '10px',
      zIndex: -1,
    },
    '& fieldset': {
      border: '.15rem solid #84582E',
      background: 'white',
      borderRadius: '10px',
      zIndex: '-1',
    },
    '&:hover fieldset': {
      border: '.15rem solid #84582E',
      borderRadius: '10px',
    },
    '&.Mui-focused fieldset': {
      border: '.15rem solid #84582E',
      borderRadius: '10px',
    },
  },
}

const hintCountButtonStyling = {
  minWidth: '0px',
  height: '2em',
  width: '2em',
}

const hintCountBox = {
  position: 'relative',
  width: '50px',
  height: '40px',
  background: 'white',
  border: '.15rem solid #84582E',
  borderRadius: '10px',
  alignContent: 'center',
  '&:after': {
    content: '""',
    position: 'absolute',
    top: '4px',
    left: '-2px',
    right: '-2px',
    bottom: '-8px',
    display: 'block',
    border: '.15rem solid #84582E',
    backgroundColor: '#E1E1E1',
    borderRadius: '10px',
    zIndex: '-1',
  },
}

const GameBoardHintHeader = () => {
  const [hintText, setHintText] = useState('')
  const [error, setError] = useState(false)
  const [hintCount, setHintCount] = useState(0)
  const { id: gameID } = useParams()
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

      setHintCount(0)
      setHintText('')
    },
    onError: (error) => {
      console.log('error:', error)
    },
  })

  const formatHint = (hint) => {
    setHintText(hint)
    setError(hint.includes(' '))
  }

  const updateHintCount = (change) => {
    setHintCount(Math.max(Number(hintCount) + change, 0))
  }

  const trySendHint = async (event) => {
    event.preventDefault()

    if (error) return
    sendHint({
      variables: {
        gameID: gameID,
        hint: hintText,
        count: Number(hintCount),
      },
    })
  }

  const handleChange = (event) => {
    const rawValue = event.target.value
    const cleanValue = rawValue.replace(/[^0-9]/g, '')
    setHintCount(cleanValue)
  }

  return (
    <Box
      className='GiveHintSection'
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: '40px',
        marginBlock: '10px',
      }}
    >
      <Box className='HintInput'>
        <TextField
          autoComplete='off'
          label='Hint'
          sx={hintTextBox}
          error={error}
          slotProps={{ htmlInput: { style: { borderRadius: '20%' } } }}
          size='small'
          onChange={({ target }) => formatHint(target.value)}
        ></TextField>
      </Box>
      <Box
        className='HintCount'
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        <Button
          sx={hintCountButtonStyling}
          className='DownButton'
          onClick={() => updateHintCount(-1)}
        >
          <RemoveIcon sx={{ color: '#84582E' }} />
        </Button>
        <Box className='hintCountBox' sx={hintCountBox}>
          <TextField
            value={hintCount}
            onChange={handleChange}
            sx={{
              height: '100%',
              width: '100%',
              '& .MuiOutlinedInput-root': {
                height: '100%',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
                {
                  border: 'none',
                },
            }}
          />
        </Box>

        <Button
          sx={hintCountButtonStyling}
          className='UpButton'
          onClick={() => updateHintCount(1)}
        >
          <AddIcon sx={{ color: '#84582E' }} />
        </Button>
      </Box>
      <Box className='HintSubmit'>
        <Button
          variant='contained'
          className='HintSubmitButton buttonStyle3D'
          onClick={trySendHint}
        >
          Send Hint
        </Button>
      </Box>
    </Box>
  )
}

export default GameBoardHintHeader
