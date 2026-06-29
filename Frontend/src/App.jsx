import { useState } from 'react'
import GameScreen from './Components/GameScreen'
import { ME } from './queries'
import { useQuery } from '@apollo/client/react'
import AccountSetup from './Components/AccountSetup'
import { useAuth0 } from '@auth0/auth0-react'
import HomePage from './Components/HomePage'

function App() {
  const [ingame, setIngame] = useState(false)
  const { loginWithRedirect, logout } = useAuth0()

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
    }
  }

  const startGame = () => {
    setIngame(true)
  }

  // return <HomePage />

  if (ingame) return <GameScreen setInGame={setIngame} />

  return (
    <div>
      {!result.data?.me && (
        <button onClick={() => loginWithRedirect()}>Login</button>
      )}
      {result.data?.me && (
        <HomePage startGame={startGame} logout={logout} />
        // <>
        //   <button onClick={() => startGame()}>Look For Game</button>
        //   <button onClick={() => logout()}>Logout</button>
        // </>
      )}
      {/* <button onClick={() => startGame(1)}>Start Game player 2</button> */}
    </div>
  )
}

export default App
