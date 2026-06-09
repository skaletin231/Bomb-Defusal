import { users } from '../../db'
import GameBoard from './GameBoard'
import { useGameStateActions } from '../gameStateStore'
import { JOIN_GAME } from '../queries'
import { useMutation } from '@apollo/client/react'
import { useState } from 'react'
import { TextField, Button } from '@mui/material'

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

const GameScreen = ({ setInGame }) => {
  const [realGameID, setRealGameID] = useState(null)
  const [gameID, setGameID] = useState('')
  const [joinGame] = useMutation(JOIN_GAME)

  const tryJoinGame = async (event) => {
    event.preventDefault()
    //console.log('try join', gameID)
    const result = await joinGame({
      variables: {
        gameID: gameID,
      },
    })
    //console.log('joined: ', result.data)

    if (result.data !== null) setRealGameID(result.data.joinGame.id)
  }

  const inGame = () => {
    return (
      <div style={style} className='gameScreen'>
        <div className='boardContainer' style={styleGameboardContainer}>
          <GameBoard gameID={realGameID} />
        </div>
        <button onClick={() => setRealGameID(null)}>End Game</button>
      </div>
    )
  }

  const notInGame = () => {
    return (
      <>
        <form onSubmit={tryJoinGame}>
          <div className='input'>
            <label>
              <TextField
                required
                label='game id'
                value={gameID}
                onChange={({ target }) => setGameID(target.value)}
              />
            </label>
          </div>

          <Button type='submit' variant='contained' style={{ marginTop: 10 }}>
            Join Game
          </Button>
        </form>
        <Button
          onClick={() => setInGame(false)}
          variant='contained'
          style={{ marginTop: 10 }}
        >
          BAck To Home
        </Button>
      </>
    )
  }

  return (
    <div>
      {realGameID !== null && inGame()}
      {realGameID === null && notInGame()}
    </div>
  )
}

export default GameScreen
