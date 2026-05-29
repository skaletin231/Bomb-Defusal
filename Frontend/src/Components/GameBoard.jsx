import GameCard from './GameCard'
import { useState } from 'react'
import { useGameStateCurrentPlayer } from '../gameStateStore'
import { Button, Card, CardContent } from '@mui/material'

import { GET_GAME, MAKE_MOVE, END_TURN } from '../queries'
import { useMutation, useQuery } from '@apollo/client/react'

const style = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: '12px',
}

const cardStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: '8px',
}

const buttonStyle = {
  marginTop: '10px',
}

const GameBoard = () => {
  const me = useGameStateCurrentPlayer()
  const [selectedCard, setSelectedCard] = useState(null)

  const result = useQuery(GET_GAME, {
    variables: { id: '6a170c97fd7f273aec8da7b9', player: me.name },
  })

  const [makeMove] = useMutation(MAKE_MOVE, {
    update: (cache, response) => {
      cache.updateQuery(
        {
          query: GET_GAME,
          variables: { id: '6a170c97fd7f273aec8da7b9', player: me.name },
        },
        () => {
          return {
            getGame: response.data.makeMove,
          }
        },
      )
      setSelectedCard(null)
    },
  })

  const [endTurn] = useMutation(END_TURN, {
    update: (cache, response) => {
      cache.updateQuery(
        {
          query: GET_GAME,
          variables: { id: '6a170c97fd7f273aec8da7b9', player: me.name },
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
        gameID: '6a170c97fd7f273aec8da7b9',
        player: me.name,
      },
    })
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  const game = result.data.getGame
  const boardSpots = game.board.spots

  const trySetSelected = (selected) => {
    if (me.name === game.currentPlayer) {
      setSelectedCard(selected)
    }
  }

  const submitMove = () => {
    const index = boardSpots.findIndex(
      (spot) => spot.word === selectedCard.word,
    )
    makeMove({
      variables: {
        gameID: '6a170c97fd7f273aec8da7b9',
        player: me.name,
        index: index,
      },
    })
  }

  const parentStyle = {
    aspectRatio: '1/1',
    display: 'flex',
    justifyContent: 'center',
    borderWidth: 2,
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
      <div style={cardStyle}>
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

  return (
    <div>
      <div style={style}>
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
      <p>current player: {game.currentPlayer}</p>
      <p>you: {me.name}</p>
      {me.name === game.currentPlayer && (
        <Button onClick={tryEndTurn} variant='contained'>
          End Turn
        </Button>
      )}
      {makeCard()}
    </div>
  )
}

export default GameBoard
