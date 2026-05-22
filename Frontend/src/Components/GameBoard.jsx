import GameCard from './GameCard'
import { useState } from 'react'
import {
  useGameStateBoard,
  useGameStateActions,
  useGameStateTurn,
} from '../gameStateStore'
import { Button } from '@mui/material'

import { GET_GAME } from '../queries'
import { useQuery } from '@apollo/client/react'

const style = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: '12px',
}

const buttonStyle = {
  marginTop: '10px',
}

const GameBoard = () => {
  //const board = useGameStateBoard()
  const turn = useGameStateTurn()
  const { revealCard, endTurn } = useGameStateActions()
  const [selectedCard, setSelectedCard] = useState(null)

  const result = useQuery(GET_GAME, {
    variables: { id: '6a1066c6f431af3de7218448' },
  })

  if (result.loading) {
    return <div>loading...</div>
  }

  const board = result.data.getGame.board.spots

  console.log(board)

  const submitMove = () => {
    // revealCard(selectedCard)
    // setSelectedCard(null)
  }

  return (
    <div>
      <div style={style}>
        {board.map((spot) => (
          <GameCard
            key={spot.word}
            spot={spot}
            selectedCard={selectedCard}
            setSelectedCard={setSelectedCard}
          />
        ))}
      </div>
      {selectedCard && (
        <Button onClick={submitMove} sx={buttonStyle} variant='contained'>
          Submit
        </Button>
      )}
      <p>{turn.name}</p>
      <Button onClick={endTurn} variant='contained'>
        End Turn
      </Button>
    </div>
  )
}

export default GameBoard
