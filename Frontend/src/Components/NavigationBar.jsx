import { Box, Button, Typography } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'
import bomb from '../../images/Bomb No Text.png'
import { ME } from '../queries'
import { useQuery } from '@apollo/client/react'
import { useAuth0 } from '@auth0/auth0-react'
import AccountMenu from './AccountMenu'
import '@fontsource/madimi-one'

const buttonSX = {
  color: '#3A1605',
  fontSize: '1.3rem',
  fontWeight: 'bold',
  textUnderlineOffset: '7px',
}

const NavigationBar = () => {
  const { pathname } = useLocation()
  const result = useQuery(ME, {})
  const loggedIn = result.data?.me !== null && !result.data.me.isGuest

  const isActive = (path = 'home') => {
    if (path === 'home') return pathname === '/'
    return pathname.includes(path)
  }

  const navBarStyle = {
    position: 'sticky',
    top: '0px',
    zIndex: '100',
    backgroundColor: isActive() ? '#7FBF51' : '#F4F0E8',
    height: '7vh',
    alignItems: 'center',
    boxSizing: 'border-box',
  }

  const { loginWithRedirect } = useAuth0()

  const handleLogin = () => {
    loginWithRedirect()
  }

  const loggedInUI = () => {
    return (
      <>
        <Button
          className={isActive('deck') ? 'active' : ''}
          sx={buttonSX}
          component={Link}
          to={'/mydecks'}
        >
          Decks
        </Button>
        <Typography sx={{ color: '#3A1605' }}>•</Typography>
        <AccountMenu />
      </>
    )
  }

  return (
    <Box sx={navBarStyle} className='navigationBar flexRow'>
      <Button
        sx={{
          color: 'black',
          padding: '5px 0px',
          fontSize: '1.5rem',
          fontFamily: '"madimi one", serif',
        }}
        component={Link}
        to='/'
        startIcon={<img src={bomb} alt='Logo' style={{ height: '5vh' }} />}
      >
        defuser
      </Button>

      <Box
        className='flexRow'
        sx={{ gap: '10px', marginLeft: 'auto', alignItems: 'center' }}
      >
        <Button
          className={isActive('startgame') ? 'active' : ''}
          sx={buttonSX}
          component={Link}
          to={'/startgame'}
        >
          Play
        </Button>
        <Typography sx={{ color: '#3A1605' }}>•</Typography>

        {!loggedIn && (
          <Button sx={buttonSX} onClick={handleLogin}>
            Log In
          </Button>
        )}
        {loggedIn && loggedInUI()}
      </Box>
    </Box>
  )
}

export default NavigationBar
