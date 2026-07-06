import { ME } from './queries'
import { useQuery } from '@apollo/client/react'
import AccountSetup from './Components/AccountSetup'
import HomePage from './Components/HomePage'
import BasicMenu from './Components/BasicMenu'
import { Routes, Route } from 'react-router-dom'
import GameBoard from './Components/GameBoard'
import DecksScreen from './Components/DecksScreen'
import JoinGame from './Components/JoinGameDialogue'
import MyDecks from './Components/MyDecks'
import MakeDeckScreen from './Components/MakeDeckScreen'
import { Box } from '@mui/material'

const boxStyle = {
  padding: '3rem',
}

function App() {
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

  if (result.loading) {
    return <p>loading...</p>
  }

  return (
    <Box sx={boxStyle}>
      <BasicMenu loggedIn={result.data?.me !== null} />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/startgame' element={<DecksScreen />} />
        <Route path='/playing/:id' element={<GameBoard />} />
        <Route path='/mydecks' element={<MyDecks />} />
        <Route path='/mydecks/new' element={<MakeDeckScreen />} />
        <Route path='/mydecks/:id' element={<MakeDeckScreen />} />
        <Route path='*' element={noPageError()} />
      </Routes>
    </Box>
  )
}

export default App
