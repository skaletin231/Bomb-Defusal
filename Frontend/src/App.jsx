import { ME } from './queries'
import { useQuery } from '@apollo/client/react'
import AccountSetup from './Components/AccountSetup'
import HomePage from './Components/HomePage'
import { Routes, Route } from 'react-router-dom'
import GameBoard from './Components/GameBoard'
import DecksScreen from './Components/DecksScreen'
import MyDecks from './Components/MyDecks'
import MakeDeckScreen from './Components/MakeDeckScreen'
import { Box } from '@mui/material'
import NavigationBar from './Components/NavigationBar'
import DeckView from './Components/DeckView'

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
    <Box className='EntirePage'>
      <NavigationBar />
      <div className='background'></div>
      <Box className='mainContainer'>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/startgame' element={<DecksScreen />} />
          <Route path='/playing/:id' element={<GameBoard />} />
          <Route path='/mydecks' element={<MyDecks />} />
          <Route path='/mydecks/new' element={<MakeDeckScreen />} />
          <Route path='/mydecks/:id' element={<MakeDeckScreen />} />
          <Route path='/decks/:id' element={<DeckView />} />
          <Route path='*' element={noPageError()} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App
