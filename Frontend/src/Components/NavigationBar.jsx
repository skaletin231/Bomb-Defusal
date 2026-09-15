import { Box, Button, Typography } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'
import BasicMenu from './AccountMenu'
import bomb from '../../images/Bomb No Text.png'
import { DELETE_USER, ME } from '../queries'
import { useMutation, useQuery, useApolloClient } from '@apollo/client/react'
import { useAuth0 } from '@auth0/auth0-react'
import AccountMenu from './AccountMenu'

const buttonSX = {
  color: '#3A1605',
  fontSize: '1.3rem',
  fontWeight: 'bold',
}

const NavigationBar = () => {
  const { pathname } = useLocation()
  const result = useQuery(ME, {})
  const loggedIn = result.data?.me !== null && !result.data.me.isGuest

  const navBarStyle = {
    position: 'sticky',
    top: '0px',
    // width: 'calc(100vw - 7rem)',
    zIndex: '100',
    backgroundColor: pathname === '/' ? '#7FBF51' : '#F4F0E8',
    height: '7vh',
    alignItems: 'center',
  }

  const { loginWithRedirect } = useAuth0()

  const handleLogin = () => {
    loginWithRedirect()
  }

  const loggedInUI = () => {
    return (
      <>
        <Button sx={buttonSX} component={Link} to={'/mydecks'}>
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
          fontWeight: 'bold',
        }}
        component={Link}
        to='/'
        startIcon={<img src={bomb} alt='Logo' style={{ height: '6.5vh' }} />}
      >
        Defuser
      </Button>

      <Box
        className='flexRow'
        sx={{ gap: '10px', marginLeft: 'auto', alignItems: 'center' }}
      >
        <Button sx={buttonSX} component={Link} to={'/'}>
          Home
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
