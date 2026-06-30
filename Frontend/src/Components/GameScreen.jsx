import GameBoard from './GameBoard'
import { JOIN_GAME, START_GAME } from '../queries'
import { useMutation } from '@apollo/client/react'
import { useState } from 'react'
import { TextField, Button } from '@mui/material'
import DecksScreen from './DecksScreen'
import ChatWindow from './ChatWindow'
import MakeDeckScreen from './MakeDeckScreen'
import MyDecks from './MyDecks'
import { Link } from 'react-router-dom'

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

const GameScreen = () => {
  const [realGameID, setRealGameID] = useState(null)
  const [screen, setScreen] = useState(null)
  const [gameID, setGameID] = useState('')
  const [joinGame] = useMutation(JOIN_GAME)

  const tryJoinGame = async (event) => {
    event.preventDefault()
    const result = await joinGame({
      variables: {
        gameID: gameID,
      },
    })

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

  if (screen === 'Make Deck') {
    return <MyDecks setScreen={setScreen} />
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
          type='contained'
          variant='contained'
          style={{ marginTop: 10 }}
          onClick={() => setScreen('Make Deck')}
        >
          My Decks
        </Button>
        <Button
          variant='contained'
          style={{ marginTop: 10 }}
          component={Link}
          to='/'
        >
          Back To Home
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
