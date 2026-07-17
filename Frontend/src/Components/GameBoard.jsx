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
import ChatHintContainer from './ChatHintContainer'
import GameOverScreen from './GameOverScreen'
import '@fontsource/suwannaphum'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'

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

const changeBoardStyle = {
  position: 'absolute',
  right: 0,
  top: 0,
  color: '#3A1605',
}

const hintCountButtonStyling = {
  minWidth: '0px',
  height: '2em',
  width: '2em',
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

const gameStates = {
  hint: 'Hint',
  win: 'Win',
  lose: 'Lose',
  playing: 'Playing',
}

const GameBoard = () => {
  const [yourBoard, setYourBord] = useState(false)
  const [open, setOpen] = useState(false)
  const [hintCount, setHintCount] = useState(0)
  const [hintText, setHintText] = useState('')
  const [error, setError] = useState(false)

  const [selectedCard, setSelectedCard] = useState(null)

  const { id: gameID } = useParams()
  const client = useApolloClient()
  const { data: meData } = useQuery(ME, {})
  const me = meData.me

  const hintResults = useQuery(GET_HINTS, {
    variables: { gameID: gameID },
  })

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

  const header = () => {
    if (game.currentPlayer.id === me.id) {
      return (
        <>
          <Typography variant='h2' style={turnText}>
            I'ts your turn!
          </Typography>
          {hintResults.data && (
            <Typography>
              Hint: {hintResults.data?.getHints.at(-1).hint}{' '}
              {hintResults.data?.getHints.at(-1).count}
            </Typography>
          )}

          <Button
            onClick={submitMove}
            disabled={selectedCard === null}
            className='buttonStyle3D'
            variant='contained'
          >
            Submit
          </Button>
          {me.id === game.currentPlayer.id &&
            game.gameState === gameStates.playing && (
              <Button
                onClick={tryEndTurn}
                className='buttonStyle3D'
                variant='contained'
              >
                End Turn
              </Button>
            )}
        </>
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
            className='buttonStyle3D'
            onClick={trySendHint}
          >
            Send Hint
          </Button>
        </Box>
      </Box>
    )
  }

  const classesForColors = {
    wire: 'wireColor',
    bomb: 'bombColor',
    dud: 'dudColor',
  }
  const classesForReveals = {
    wire: 'wireRevealedColor',
    bomb: 'bombRevealedColor',
    dud: 'dudRevealedColor',
  }

  const playBoard = () => {
    return (
      <>
        <Box sx={{ position: 'relative' }}>
          <Typography
            variant='h4'
            sx={{ textAlign: 'center', fontWeight: 'bold', color: '#3A1605' }}
          >
            Their Board
          </Typography>
          <Button sx={changeBoardStyle} onClick={() => setYourBord(!yourBoard)}>
            <SwapHorizIcon />
          </Button>
        </Box>

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
      </>
    )
  }

  const hintBoard = () => {
    const theirCardStyle = {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 0,
      '&:last-child': {
        pb: 0,
      },
    }
    return (
      <>
        <Box sx={{ position: 'relative' }}>
          <Typography
            variant='h4'
            sx={{ textAlign: 'center', fontWeight: 'bold', color: '#3A1605' }}
          >
            Your Board
          </Typography>
          <Button sx={changeBoardStyle} onClick={() => setYourBord(!yourBoard)}>
            <SwapHorizIcon />
          </Button>
        </Box>

        <div style={boardStyle} className='MyKeyCard'>
          {boardSpots.map((spot) => (
            <Card
              className={`parentStyle ${classesForColors[spot.myType]} ${classesForReveals[spot.typeRevealed.theirType]}`}
              key={spot.word}
              variant='outlined'
            >
              <CardContent sx={theirCardStyle}>
                <Typography>{spot.word}</Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    )
  }

  return (
    <div style={{ paddingBottom: '20px' }}>
      <div className={'background'}></div>

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
      {yourBoard && playBoard()}
      {!yourBoard && hintBoard()}

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
