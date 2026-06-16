import GameCard from './GameCard'
import { useState } from 'react'
import { Button, Card, CardContent } from '@mui/material'

import { GAME_UPDATE, ME, GET_GAME, MAKE_MOVE, END_TURN } from '../queries'
import {
  useApolloClient,
  useMutation,
  useQuery,
  useSubscription,
} from '@apollo/client/react'

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

const GameBoard = ({ gameID }) => {
  const client = useApolloClient()

  const { data: meData } = useQuery(ME, {})
  const me = meData.me
  const [selectedCard, setSelectedCard] = useState(null)

  const gameResult = useQuery(GET_GAME, {
    variables: { id: gameID },
  })

  //console.log(gameResult)

  useSubscription(GAME_UPDATE, {
    onData: ({ data }) => {
      console.log('update loop')
      const update = data.data.gameUpdate

      if (update.gameStateChange !== null) {
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
                gameState: update.gameStateChange,
              },
            }
          },
        )
      }
      if (update.turnChange !== null) {
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
                currentPlayer: {
                  username: update.turnChange.turnUpdate.username,
                  id: update.turnChange.turnUpdate.id,
                },
                turnsRemaining: update.turnsRemainingChange,
              },
            }
          },
        )
      }

      if (update.changedSpots !== null) {
        client.cache.updateQuery(
          {
            query: GET_GAME,
            variables: { id: update.gameID },
          },
          (data) => {
            if (!data) return data

            const newTypeRevealed = {
              myType: update.changedSpots[0].typeRevealed.theirType,
              theirType: update.changedSpots[0].typeRevealed.myType,
            }

            return {
              ...data,
              getGame: {
                ...data.getGame,
                board: {
                  ...data.getGame.board,
                  spots: data.getGame.board.spots.map((spot) =>
                    spot.word !== update.changedSpots[0].word
                      ? spot
                      : { ...spot, typeRevealed: newTypeRevealed },
                  ),
                },
              },
            }
          },
        )
      }
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

  if (gameResult.loading) {
    return <div>loading...</div>
  }

  const game = gameResult.data.getGame
  const boardSpots = game.board.spots

  const trySetSelected = (selected) => {
    if (me.id === game.currentPlayer.id && game.gameState === 'Playing') {
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
      <p>current player: {game.currentPlayer.username}</p>
      <p>you: {me.username}</p>
      {me.id === game.currentPlayer.id && game.gameState === 'Playing' && (
        <Button onClick={tryEndTurn} variant='contained'>
          End Turn
        </Button>
      )}
      {makeCard()}
      <p>Turns Reamining: {game.turnsRemaining}</p>
    </div>
  )
}

export default GameBoard
