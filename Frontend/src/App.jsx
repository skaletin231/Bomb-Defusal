import { useState } from 'react'
import GameScreen from './Components/GameScreen'
import LoginPage from './Components/LoginPage'
import { ME } from './queries'
import { useQuery } from '@apollo/client/react'
import AccountSetup from './Components/AccountSetup'

function App() {
  const [screen, setScreen] = useState('Main')
  const [game, setGame] = useState({ player: -1, inGame: false })

  const result = useQuery(ME, {})

  if (!result.loading) {
    //data is null in an error, may need to check for that
    if (
      result.data.me !== null &&
      result.data.me.username === null
    ) //found a person
    {
      console.log('need initial setup')
      return <AccountSetup />
    }
  }

  const startGame = (thisPlayer) => {
    setGame({ player: thisPlayer, inGame: true })
  }

  if (screen === 'Login') {
    return <LoginPage />
  }

  if (game.inGame) return <GameScreen game={game} setInGame={setGame} />

  return (
    <div>
      <button onClick={() => setScreen('Login')}>Login</button>
      <button onClick={() => startGame(0)}>Start Game player 1</button>
      <button onClick={() => startGame(1)}>Start Game player 2</button>
    </div>
  )
}

export default App
