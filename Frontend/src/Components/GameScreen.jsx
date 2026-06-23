import GameBoard from './GameBoard'
import { JOIN_GAME, START_GAME } from '../queries'
import { useMutation } from '@apollo/client/react'
import { useState } from 'react'
import { TextField, Button } from '@mui/material'
import DecksScreen from './DecksScreen'
import ChatWindow from './ChatWindow'
import MakeDeckScreen from './MakeDeckScreen'

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
  const [screen, setScreen] = useState(null)
  const [gameID, setGameID] = useState('')
  const [joinGame] = useMutation(JOIN_GAME)

  const [startGame] = useMutation(START_GAME)

  const tryJoinGame = async (event) => {
    event.preventDefault()
    const result = await joinGame({
      variables: {
        gameID: gameID,
      },
    })

    if (result.data !== null) setRealGameID(result.data.joinGame.id)
  }

  const tryCreateGame = async (deck) => {
    event.preventDefault()

    const result = await startGame({
      variables: {
        words: deck.cards,
      },
    })

    if (result.data === null) return

    setScreen(null)

    setRealGameID(result.data.startGame.id)
  }

  const openNewGameScreen = () => {
    setScreen('Make Game')
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

  if (screen === 'Make Game') {
    return <DecksScreen tryCreateGame={tryCreateGame} setScreen={setScreen} />
  }

  if (screen === 'Make Deck') {
    return <MakeDeckScreen setScreen={setScreen} />
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
          onClick={openNewGameScreen}
        >
          Make New Game
        </Button>
        <Button
          type='contained'
          variant='contained'
          style={{ marginTop: 10 }}
          onClick={() => setScreen('Make Deck')}
        >
          Make New Deck
        </Button>
        <Button
          onClick={() => setInGame(false)}
          variant='contained'
          style={{ marginTop: 10 }}
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
