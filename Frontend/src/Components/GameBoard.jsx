import {
  useApolloClient,
  useMutation,
  useQuery,
  useSubscription,
} from '@apollo/client/react'
import '@fontsource/suwannaphum'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  END_TURN,
  GAME_UPDATE,
  GET_GAME,
  GET_HINTS,
  MAKE_MOVE,
  ME,
  NEW_PLAYER_JOINED,
} from '../queries'
import ChatHintContainer from './ChatHintContainer'
import GameBoardHintHeader from './GameBoardHintHeader'
import GameCard from './GameCard'
import GameOverScreen from './Popups/GameOverDialogue'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import CheckIcon from '@mui/icons-material/Check'

const boardStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: '16px',
  marginInline: 'auto',
  position: 'relative',
  aspectRatio: '2/1.48',
  // width: 'auto',
  // height: '66vh',
}

const gameBoardHeader = {
  color: '#737373',
  fontSize: '1.2rem',
}

const changeBoardStyle = {
  position: 'absolute',
  left: '100%',
  top: 0,
  bottom: 0,
  color: '#3A1605',
}

const gameStates = {
  hint: 'Hint',
  win: 'Win',
  lose: 'Lose',
  playing: 'Playing',
  waiting: 'waiting',
}

const GameBoard = () => {
  const [isGameBoard, setGameBoard] = useState(true)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

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

      if (update.gameStateChange === 'Win' || update.gameStateChange === 'Lose')
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

          return {
            ...data,
            getGame: {
              ...data.getGame,
              players: [...data.getGame.players, update.gameUser],
              gameState: update.gameStateChange,
              currentPlayer: update.turnChange.turnUpdate,
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

  const tryEndTurn = () => {
    endTurn({
      variables: {
        gameID: gameID,
      },
    })
  }

  const game = gameResult.data?.getGame

  useEffect(() => {
    if (gameResult.loading || !game) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (game.gameState === 'Win' || game.gameState === 'Lose') setOpen(true)
  }, [gameResult.loading])

  if (gameResult.loading) {
    return <div>loading...</div>
  }

  if (!game) {
    return <div>Access Denied</div>
  }

  const boardSpots = game.board.spots

  const trySetSelected = (selected) => {
    if (
      me.id === game.currentPlayer?.id &&
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
    const isPlaying = game.gameState === gameStates.playing
    if (game.currentPlayer.id === me.id) {
      return (
        <>
          <Typography className='secondaryHeader'>It's your turn!</Typography>

          {isPlaying && (
            <>
              {hintResults.data && (
                <Box
                  sx={{ display: 'flex', gap: '20px', alignItems: 'baseline' }}
                >
                  <Typography className='hintTitle'>Hint:</Typography>
                  <Typography className='hintContent'>
                    {hintResults.data?.getHints.at(-1).hint}{' '}
                    {hintResults.data?.getHints.at(-1).count}
                  </Typography>
                </Box>
              )}
              <Box
                sx={{
                  flexDirection: 'row',
                  display: 'flex',
                  gap: '20px',
                  margin: '10px 0px',
                }}
              >
                <Button
                  onClick={submitMove}
                  disabled={selectedCard === null}
                  className='buttonStyle3D'
                  variant='contained'
                >
                  Submit
                </Button>
                <Button
                  onClick={tryEndTurn}
                  className='buttonStyle3D'
                  variant='contained'
                >
                  End Turn
                </Button>
              </Box>
            </>
          )}
        </>
      )
    } else {
      if (isPlaying) {
        return (
          <Typography className='secondaryHeader'>
            It's {game.currentPlayer.username}'s turn!
          </Typography>
        )
      } else {
        return (
          <>
            <Typography className='secondaryHeader'>
              It's {game.currentPlayer.username}'s turn!
            </Typography>

            <Typography className='hintText waitingForHint bigText'>
              Waiting for hint...
            </Typography>
          </>
        )
      }
    }
  }

  console.log(game)

  const showHintHeader =
    game.gameState === gameStates.hint && game.currentPlayer?.id === me.id

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

  const testSX = {
    '&&': {
      padding: '5px',
    },
  }

  //TODO: this entire thing should maybe be it's own jsx
  const playBoard = () => {
    return (
      <>
        <Box sx={{ position: 'relative', alignSelf: 'center' }}>
          <Typography
            className='biggerText'
            sx={{ textAlign: 'center', width: 'fit-content' }}
          >
            Game Board
          </Typography>
          <Button
            sx={changeBoardStyle}
            onClick={() => setGameBoard(!isGameBoard)}
          >
            <SwapHorizIcon />
          </Button>
        </Box>

        <div style={boardStyle} className='GameBoard'>
          {boardSpots.map((spot) => (
            <GameCard
              sx={testSX}
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

  //TODO: this can be moved to it's own jsx
  const hintBoard = () => {
    const theirCardStyle = {
      height: '100%',
      width: '100%',
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
        <Box sx={{ position: 'relative', alignSelf: 'center' }}>
          <Typography
            className='biggerText'
            sx={{ textAlign: 'center', width: 'fit-content' }}
          >
            Key Card
          </Typography>
          <Button
            sx={changeBoardStyle}
            onClick={() => setGameBoard(!isGameBoard)}
          >
            <SwapHorizIcon />
          </Button>
        </Box>

        <div style={boardStyle} className='MyKeyCard'>
          {boardSpots.map((spot) => (
            <Card
              sx={testSX}
              className={`parentStyle ${classesForColors[spot.myType]} ${classesForReveals[spot.typeRevealed.theirType]}`}
              key={spot.word}
              variant='outlined'
            >
              <CardContent sx={theirCardStyle}>
                <Typography className='cardText'>{spot.word}</Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    )
  }

  const gameInfo = () => {
    return (
      <Typography sx={gameBoardHeader}>
        Round {game.maxTurns - game.turnsRemaining}/{game.maxTurns} •{' '}
        {game.remainingWires}/{15} guessed{' '}
        {game.mistakeLimit !== -1 && (
          <>
            • {game.mistakes}/{game.mistakeLimit} mistakes made
          </>
        )}
      </Typography>
    )
  }

  const handleCopy = async (value) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  //TODO: seperate this out into it's own component as well to reduce this file's size
  if (game.gameState === gameStates.waiting) {
    return (
      <Box className='gameBoard flexColumn content' sx={{ gap: '30px' }}>
        <Typography className='secondaryHeader'>
          Waiting for player to join...
        </Typography>
        <Box className='flexColumn' sx={{ gap: '10px' }}>
          <Typography className='normalText'>Your invite code:</Typography>
          <Box className='flexRow' sx={{ gap: '40px' }}>
            <TextField
              className='textFieldStyle3D'
              sx={{ '&&': { flexGrow: '0' }, width: '35rem' }}
              value={game.id}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />
            <Button
              className='buttonStyle3D'
              variant='contained'
              sx={{
                '&&': {
                  display: 'flex',
                  width: 'fit-content',
                  height: '50px',
                  flexShrink: '0',
                  gap: '10px',
                },
              }}
              onClick={() => handleCopy(game.id)}
            >
              {!copied && (
                <>
                  <ContentCopyRoundedIcon /> Copy Code
                </>
              )}
              {copied && (
                <>
                  <CheckIcon /> Copied!
                </>
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      className='gameBoard flexColumn content'
      sx={{ marginTop: '2vh', gap: '15px' }}
    >
      <Box className='headerContainer'>
        {gameInfo()}
        {header()}
        {showHintHeader && <GameBoardHintHeader />}
      </Box>

      {isGameBoard && playBoard()}
      {!isGameBoard && hintBoard()}

      <ChatHintContainer gameID={gameID} />
      <GameOverScreen open={open} setOpen={setOpen} game={game} />
    </Box>
  )
}

export default GameBoard
