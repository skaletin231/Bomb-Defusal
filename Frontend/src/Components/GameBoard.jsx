import {
  useApolloClient,
  useMutation,
  useQuery,
  useSubscription,
} from '@apollo/client/react'
import '@fontsource/suwannaphum'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import { Box, Button, Card, CardContent, Typography } from '@mui/material'
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
import GameOverScreen from './GameOverScreen'

const boardStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: '16px',
  marginInline: 'auto',
  marginTop: '10px',
  position: 'relative',
  aspectRatio: '2/1.4',
}

const gameBoardHeader = {
  color: '#737373',
  fontSize: '1.2rem',
}

const changeBoardStyle = {
  position: 'absolute',
  right: 0,
  bottom: '100%',
  marginBottom: '10px',
  color: '#3A1605',
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
  const [yourBoard, setYourBord] = useState(true)
  const [open, setOpen] = useState(false)

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

    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    const isPlaying = game.gameState === gameStates.playing
    if (game.currentPlayer.id === me.id) {
      return (
        <>
          <Typography variant='h2' style={turnText}>
            It's your turn!
          </Typography>

          {isPlaying && (
            <>
              {hintResults.data && (
                <Typography className='hintText'>
                  Hint: {hintResults.data?.getHints.at(-1).hint}{' '}
                  {hintResults.data?.getHints.at(-1).count}
                </Typography>
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
          <Typography variant='h2' style={turnText}>
            It is the other player's turn!
          </Typography>
        )
      } else {
        return (
          <>
            <Typography variant='h2' style={turnText}>
              It is the other player's turn!
            </Typography>

            <Typography className='hintText waitingForHint'>
              Waiting for hint...
            </Typography>
          </>
        )
      }
    }
  }

  const show =
    game.gameState === gameStates.hint && game.currentPlayer.id === me.id

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

  //TODO: this entire thing should maybe be it's own jsx
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
        </Box>

        <div style={boardStyle} className='MyBoard'>
          <Button sx={changeBoardStyle} onClick={() => setYourBord(!yourBoard)}>
            <SwapHorizIcon />
          </Button>
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

  //TODO: this can be moved to it's own jsx
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
            Key Card
          </Typography>
        </Box>

        <div style={boardStyle} className='MyKeyCard'>
          <Button sx={changeBoardStyle} onClick={() => setYourBord(!yourBoard)}>
            <SwapHorizIcon />
          </Button>
          {boardSpots.map((spot) => (
            <Card
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

  return (
    <div className='gameBoard'>
      <div className='background'></div>
      <Box className='headerContainer'>
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
        {show && <GameBoardHintHeader />}
      </Box>

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
