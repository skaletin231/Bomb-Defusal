import { useState } from 'react'
import GameScreen from './Components/GameScreen'
import { ME } from './queries'
import { useQuery } from '@apollo/client/react'
import AccountSetup from './Components/AccountSetup'
import HomePage from './Components/HomePage'
import BasicMenu from './Components/BasicMenu'
import { Routes, Route } from 'react-router-dom'
import GameBoard from './Components/GameBoard'
import DecksScreen from './Components/DecksScreen'
import JoinGame from './Components/JoinGameDialogue'

function App() {
  const [ingame, setIngame] = useState(false)

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

  const noPageError = () => {
    return <h1>Error 404: Page Not Found</h1>
  }

  if (ingame)
    return (
      <>
        <BasicMenu loggedIn={result.data?.me !== null} />
        <GameScreen setInGame={setIngame} />
      </>
    )
  return (
    <div>
      <BasicMenu loggedIn={result.data?.me !== null} />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/startgame' element={<DecksScreen />} />
        {/* <Route path='/joingame' element={<joingam />} /> */}
        <Route path='/playing/:id' element={<GameBoard />} />
        <Route path='*' element={noPageError()} />
      </Routes>
    </div>
  )
}

export default App
