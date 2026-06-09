import { useState } from 'react'
import GameScreen from './Components/GameScreen'
import LoginPage from './Components/LoginPage'
import { ME } from './queries'
import { useQuery } from '@apollo/client/react'
import AccountSetup from './Components/AccountSetup'
import { useAuth0 } from '@auth0/auth0-react'

function App() {
  //const [screen, setScreen] = useState('Main')
  const [ingame, setIngame] = useState(false)
  const { loginWithRedirect } = useAuth0()

  const result = useQuery(ME, {})

  if (!result.loading) {
    //data is null in an error, may need to check for that
    if (
      result.data?.me !== null &&
      result.data?.me.username === null
    ) //found a person
    {
      console.log('need initial setup')
      return <AccountSetup />
    } else {
      //console.log(result)
    }
  }

  const startGame = () => {
    setIngame(true)
  }

  if (screen === 'Login') {
    return <LoginPage />
  }

  if (ingame) return <GameScreen setInGame={setIngame} />

  return (
    <div>
      {!result.data?.me && (
        <button onClick={() => loginWithRedirect()}>Login</button>
      )}
      {result.data?.me && (
        <button onClick={() => startGame()}>Look For Game</button>
      )}
      {/* <button onClick={() => startGame(1)}>Start Game player 2</button> */}
    </div>
  )
}

export default App
