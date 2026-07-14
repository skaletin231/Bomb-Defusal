import GameCard from './GameCard'
import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@mui/material'
import { useParams } from 'react-router-dom'
import {
  GAME_UPDATE,
  ME,
  GET_GAME,
  MAKE_MOVE,
  END_TURN,
  NEW_PLAYER_JOINED,
  SEND_HINT,
  GET_HINTS,
} from '../queries'
import {
  useApolloClient,
  useMutation,
  useQuery,
  useSubscription,
} from '@apollo/client/react'
import ChatWindow from './ChatWindow'
import ChatHintContainer from './ChatHintContainer'
import GameOverScreen from './GameOverScreen'
import '@fontsource/suwannaphum'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

const boardStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: '16px',
  aspectRatio: '2/1.4',
  marginInline: 'auto',
  maxHeight: '70vh',
  marginTop: '10px',
}

const gameBoardHeader = {
  color: '#737373',
  fontSize: '1.2rem',
}

const backgroundStyle = {
  top: '0',
  left: '0',
  bottom: '0',
  right: '0',
  position: 'absolute',
  backgroundColor: '#FFF8E9',
  zIndex: '-2',
}

const parentStyle = {
  aspectRatio: '2/1.4',
  display: 'flex',
  justifyContent: 'center',
  borderWidth: 2,
  borderRadius: '10%',
}

const hintCountButtonStyling = {
  minWidth: '0px',
  height: '2em',
  width: '2em',
}

const sendHintButtonStyle = {
  backgroundColor: '#588A29',
  border: '.15rem solid #286B1F',
  width: '100px',
  height: '44px',
  borderRadius: '10px',
  padding: '6px 10px',
  fontSize: '17px',
  '&:hover': {
    backgroundColor: '#588A29',
    borderRadius: '10px',
  },
  '&:active': {
    top: '6px',
    left: '0px',
    backgroundColor: '#1E5C15',

    '&:after': {
      right: '-2px',
      bottom: '-2px',
      left: '-2px',
      top: '-2px',
    },
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    top: '4px',
    left: '-2px',
    right: '-2px',
    bottom: '-8px',
    display: 'block',
    border: '.15rem solid #286B1F',
    backgroundColor: '#1E5C15',
    borderRadius: '10px',
    zIndex: '-1',
  },
}

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

const hintCountText = {
  textAlign: 'center',
}

const turnText = {
  color: '#3A1605',
  fontSize: '3rem',
  margin: '20px 0',
  fontFamily: '"Suwannaphum", serif',
  fontWeight: 'bold',
}

const cardStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: '8px',
}

const buttonStyle = {
  marginTop: '10px',
}

const gameStates = {
  hint: 'Hint',
  win: 'Win',
  lose: 'Lose',
  playing: 'Playing',
}

const GameBoard = () => {
  const [open, setOpen] = useState(false)
  const [hintCount, setHintCount] = useState(0)
  const [hintText, setHintText] = useState('')
  const [error, setError] = useState(false)

  const [selectedCard, setSelectedCard] = useState(null)

  const { id: gameID } = useParams()
  const client = useApolloClient()
  const { data: meData } = useQuery(ME, {})
  const me = meData.me

  const gameResult = useQuery(GET_GAME, {
    variables: { id: gameID },
  })

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

  useSubscription(GAME_UPDATE, {
    onData: ({ data }) => {
      const update = data.data.gameUpdate

      client.cache.updateQuery(
        {
          query: GET_GAME,
          variables: { id: update.gameID },
        },
        (data) => {
          if (!data) return data

          const gameStateChange =
            update.gameStateChange !== null
              ? update.gameStateChange
              : data.getGame.gameState

          const currentPlayer =
            update.turnChange !== null
              ? {
                  username: update.turnChange.turnUpdate.username,
                  id: update.turnChange.turnUpdate.id,
                }
              : data.getGame.currentPlayer

          const turnsRemaining =
            update.turnsRemainingChange !== null
              ? update.turnsRemainingChange
              : data.getGame.turnsRemaining

          const spots =
            update.changedSpots !== null
              ? data.getGame.board.spots.map((spot) =>
                  spot.word !== update.changedSpots[0].word
                    ? spot
                    : {
                        ...spot,
                        typeRevealed: {
                          myType: update.changedSpots[0].typeRevealed.theirType,
                          theirType: update.changedSpots[0].typeRevealed.myType,
                        },
                      },
                )
              : data.getGame.board.spots

          return {
            ...data,
            getGame: {
              ...data.getGame,
              gameState: gameStateChange,
              board: {
                ...data.getGame.board,
                spots: spots,
              },
              currentPlayer: currentPlayer,
              turnsRemaining: turnsRemaining,
              mistakes: update.mistakes ?? data.getGame.mistakes,
            },
          }
        },
      )

      if (update.gameState === 'Win' || update.gameState === 'Lose')
        setOpen(true)
    },
  })

  useSubscription(NEW_PLAYER_JOINED, {
    onData: ({ data }) => {
      const update = data.data.newPlayerJoined

      //TODO: Change this to make a new cache item for the new user and add that to the game as a reference instead

      client.cache.updateQuery(
        {
          query: GET_GAME,
          variables: { id: update.gameID },
        },
        (data) => {
          if (!data) return data

          console.log(data)

          return {
            ...data,
            getGame: {
              ...data.getGame,
              players: [...data.getGame.players, update.gameUser],
            },
          }
        },
      )
    },
  })

  const [makeMove] = useMutation(MAKE_MOVE, {
    update: (cache, response) => {
      cache.updateQuery(
        {
          query: GET_GAME,
          variables: { id: gameID },
        },
        () => {
          return {
            getGame: response.data.makeMove,
          }
        },
      )
      setSelectedCard(null)
    },
    onError: (error) => {
      console.log(error.message)
    },
  })

  const [endTurn] = useMutation(END_TURN, {
    update: (cache, response) => {
      cache.updateQuery(
        {
          query: GET_GAME,
          variables: { id: gameID },
        },
        () => {
          return {
            getGame: response.data.endTurn,
          }
        },
      )
      setSelectedCard(null)
    },
  })

  const trySendHint = async (event) => {
    event.preventDefault()

    if (error) return
    sendHint({
      variables: {
        gameID: gameID,
        hint: hintText,
        count: hintCount,
      },
    })
  }

  const tryEndTurn = () => {
    endTurn({
      variables: {
        gameID: gameID,
      },
    })
  }

  const game = gameResult.data?.getGame

  useEffect(() => {
    if (gameResult.loading) return

    if (game.gameState === 'Win' || game.gameState === 'Lose') setOpen(true)
  }, [gameResult.loading])

  if (gameResult.loading) {
    return <div>loading...</div>
  }

  const boardSpots = game.board.spots

  const trySetSelected = (selected) => {
    if (
      me.id === game.currentPlayer.id &&
      game.gameState === gameStates.playing
    ) {
      setSelectedCard(selected)
    }
  }

  const submitMove = () => {
    const index = boardSpots.findIndex(
      (spot) => spot.word === selectedCard.word,
    )
    makeMove({
      variables: {
        gameID: gameID,
        index: index,
      },
    })
  }

  const makeCard = () => {
    const colorPicker = {
      bomb: 'rgb(128, 128, 128)',
      dud: 'rgb(255, 255, 0)',
      wire: 'rgb(0, 128, 0)',
    }
    const child = {
      p: 0,
      '&:last-child': {
        pb: 0,
      },
    }
    return (
      <div style={cardStyle} className='MyKeyCard'>
        {boardSpots.map((spot) => (
          <Card sx={parentStyle} key={spot.word} variant='outlined'>
            <CardContent
              sx={child}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: colorPicker[spot.myType],
              }}
            ></CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const header = () => {
    if (game.currentPlayer.id === me.id) {
      return (
        <Typography variant='h2' style={turnText}>
          I'ts your turn!
        </Typography>
      )
    } else {
      return (
        <Typography variant='h2' style={turnText}>
          It is the other player's turn!
        </Typography>
      )
    }
  }

  const show =
    game.gameState === gameStates.hint && game.currentPlayer.id === me.id

  const updateHintCount = (change) => {
    setHintCount(Math.max(hintCount + change, 0))
  }

  const formatHint = (hint) => {
    setHintText(hint)
    setError(hint.includes(' '))
  }

  const hintSection = () => {
    return (
      <Box
        className='GiveHintSection'
        sx={{ display: 'flex', flexDirection: 'row', gap: '40px' }}
      >
        <Box className='HintInput'>
          <TextField
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
          <Box className='HintCountBox' sx={hintCountBox}>
            <Typography className='HintCountLabel' sx={hintCountText}>
              {hintCount}
            </Typography>
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
            className='HintSubmitButton'
            variant='contained'
            sx={sendHintButtonStyle}
            onClick={trySendHint}
          >
            Send Hint
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <div style={{ paddingBottom: '20px' }}>
      <div style={backgroundStyle} className={'backgroundBottom'}></div>

      <Typography sx={gameBoardHeader}>
        Round {game.maxTurns - game.turnsRemaining}/{game.maxTurns} •{' '}
        {game.remainingWires}/{15} guessed{' '}
        {game.mistakeLimit !== -1 && (
          <>
            • {game.mistakes}/{game.mistakeLimit} mistakes made
          </>
        )}
      </Typography>
      {header()}
      {show && hintSection()}
      <div style={boardStyle} className='MyBoard'>
        {boardSpots.map((spot) => (
          <GameCard
            key={spot.word}
            spot={spot}
            selectedCard={selectedCard}
            setSelectedCard={trySetSelected}
          />
        ))}
      </div>
      {selectedCard && (
        <Button onClick={submitMove} sx={buttonStyle} variant='contained'>
          Submit
        </Button>
      )}

      {me.id === game.currentPlayer.id &&
        game.gameState === gameStates.playing && (
          <Button onClick={tryEndTurn} variant='contained'>
            End Turn
          </Button>
        )}
      {makeCard()}
      <ChatHintContainer gameID={gameID} />
      <GameOverScreen
        open={open}
        setOpen={setOpen}
        gameState={game.gameState}
      />
    </div>
  )
}

export default GameBoard
