import { decks, users } from '../../db'
import GameBoard from './GameBoard'
import { MakeBoard } from '../../MakeBoard'
import { useGameStateActions } from '../gameStateStore'

const styleGameboardContainer = {
  width: 'auto',
  height: '100%',
}

const style = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '80vh',
}

const GameScreen = (props) => {
  const { setPlayersTurn, setPlayers } = useGameStateActions()
  setPlayersTurn(users[0])
  setPlayers([users[0], users[1]])
  //MakeBoard(decks[0].cards)

  return (
    <div style={style} className='gameScreen'>
      <div className='boardContainer' style={styleGameboardContainer}>
        <GameBoard />
      </div>
      <button onClick={() => props.setInGame(false)}>End Game</button>
    </div>
  )
}

export default GameScreen
