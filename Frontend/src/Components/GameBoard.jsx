import GameCard from './GameCard'
import { MakeBoard } from '../../MakeBoard'
import { useState } from 'react'
import {
  useGameStateBoard,
  useGameStateActions,
  useGameStateTurn,
} from '../gameStateStore'
import { Button } from '@mui/material'

const style = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: '12px',
}

const buttonStyle = {
  marginTop: '10px',
}

const GameBoard = () => {
  const board = useGameStateBoard()
  const turn = useGameStateTurn()
  const { revealCard, endTurn } = useGameStateActions()
  const [selectedCard, setSelectedCard] = useState(null)

  const submitMove = () => {
    revealCard(selectedCard)
    setSelectedCard(null)
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
