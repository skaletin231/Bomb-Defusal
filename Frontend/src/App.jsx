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
import AccountPage from './Components/AccountPage'
import FooterBar from './Components/FooterBar'
import TermsOfService from './Components/TermsOfService'
import PrivacyPolicy from './Components/PrivacyPolicy'
import SetUsernameDialogue from './Components/Popups/SetUsernameDialogue'
import ScrollToTop from './Components/ScrollToTop'

function App() {
  const result = useQuery(ME, {})

  const noPageError = () => {
    return <h1>Error 404: Page Not Found</h1>
  }

  if (result.loading) {
    return <p>loading...</p>
  }

  const needToSetUsername =
    result.data?.me !== null && result.data?.me.username === null

  return (
    <Box className='EntirePage flexColumn' sx={{ minHeight: '100vh' }}>
      <NavigationBar />
      <div className='background'></div>
      <Box className='mainContainer'>
        <ScrollToTop />
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/startgame' element={<DecksScreen />} />
          <Route path='/playing/:id' element={<GameBoard />} />
          <Route path='/mydecks' element={<MyDecks />} />
          <Route path='/mydecks/new' element={<MakeDeckScreen />} />
          <Route path='/mydecks/:id' element={<MakeDeckScreen />} />
          <Route path='/decks/:id' element={<DeckView />} />
          <Route path='/account' element={<AccountPage />} />
          <Route path='/terms-of-service' element={<TermsOfService />} />
          <Route path='/privacy-policy' element={<PrivacyPolicy />} />
          <Route path='*' element={noPageError()} />
        </Routes>
      </Box>
      <Box sx={{ flexGrow: '1', alignContent: 'end', marginTop: '20px' }}>
        <FooterBar />
      </Box>
      <SetUsernameDialogue open={needToSetUsername} />
    </Box>
  )
}

export default App
