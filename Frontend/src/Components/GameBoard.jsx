import GameCard from './GameCard'
import { useState, useEffect } from 'react'
import { Button, Card, CardContent, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import {
  GAME_UPDATE,
  ME,
  GET_GAME,
  MAKE_MOVE,
  END_TURN,
  NEW_PLAYER_JOINED,
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

const style = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: '12px',
  maxHeight: '80vh',
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
  const [selectedCard, setSelectedCard] = useState(null)

  const { id: gameID } = useParams()
  const client = useApolloClient()
  const { data: meData } = useQuery(ME, {})
  const me = meData.me

  const gameResult = useQuery(GET_GAME, {
    variables: { id: gameID },
  })

  useSubscription(GAME_UPDATE, {
    onData: ({ data }) => {
      console.log('update loop', data)
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
      console.log('new player joined loop')
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

  const parentStyle = {
    aspectRatio: '2/1.4',
    display: 'flex',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: '40px',
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
          It is the other player's
        </Typography>
      )
    }
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
      <div style={style} className='MyBoard'>
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
      <ChatHintContainer
        gameID={gameID}
        show={
          game.gameState === gameStates.hint && game.currentPlayer.id === me.id
        }
      />
      <GameOverScreen
        open={open}
        setOpen={setOpen}
        gameState={game.gameState}
      />
    </div>
  )
}

export default GameBoard
