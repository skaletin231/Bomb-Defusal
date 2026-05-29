import { users } from '../../db'
import GameBoard from './GameBoard'
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
  const { setPlayersTurn, setPlayers, setPlayer } = useGameStateActions()
  setPlayersTurn(users[0])
  setPlayers([users[0], users[1]])
  setPlayer(props.game.player)

  return (
    <div style={style} className='gameScreen'>
      <div className='boardContainer' style={styleGameboardContainer}>
        <GameBoard />
      </div>
      <button onClick={() => props.setInGame({ player: -1, inGame: false })}>
        End Game
      </button>
    </div>
  )
}

export default GameScreen
