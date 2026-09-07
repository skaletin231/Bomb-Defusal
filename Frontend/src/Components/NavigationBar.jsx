import { Box, Button, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import BasicMenu from './BasicMenu'
import bomb from '../../images/bomb.svg'
import { ME } from '../queries'
import { useQuery } from '@apollo/client/react'
import { useAuth0 } from '@auth0/auth0-react'

const navBarStyle = {
  position: 'sticky',
  top: '0px',
  width: 'calc(100vw - 7rem)',
  zIndex: '100',
  backgroundColor: '#FFF8E9',
  height: '7vh',
  alignItems: 'center',
}

const buttonSX = {
  color: '#3A1605',
  fontSize: '1.3rem',
  fontWeight: 'bold',
}

const NavigationBar = () => {
  const result = useQuery(ME, {})
  const loggedIn = result.data?.me !== null && !result.data.me.isGuest

  const { loginWithRedirect, logout } = useAuth0()

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    })
  }

  const handleLogin = () => {
    loginWithRedirect()
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
        startIcon={
          <img src={bomb} alt='Logo' style={{ width: '7vh', height: '7vh' }} />
        }
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
        <Button sx={buttonSX} component={Link} to={'/mydecks'}>
          Decks
        </Button>
        <Typography sx={{ color: '#3A1605' }}>•</Typography>
        {!loggedIn && (
          <Button sx={buttonSX} onClick={handleLogin}>
            Log In
          </Button>
        )}
        {loggedIn && (
          <Button sx={buttonSX} onClick={handleLogout}>
            Log out
          </Button>
        )}
      </Box>
      {/* <BasicMenu /> */}
    </Box>
  )
}

export default NavigationBar
