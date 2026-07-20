import { Box, Button } from '@mui/material'
import { Link } from 'react-router-dom'
import BasicMenu from './BasicMenu'

const navBarStyle = {
  position: 'sticky',
  top: '0px',
  width: '100vw',
  zIndex: '100',
  backgroundColor: '#FFF8E9',
  height: '5vh',
}

const NavigationBar = () => {
  return (
    <Box sx={navBarStyle}>
      <Button
        sx={{ color: 'black' }}
        component={Link}
        to='/'
        startIcon={
          <img
            src='../../images/bomb.svg'
            alt='Logo'
            style={{ width: 60, height: 60 }}
          />
        }
      >
        Defuser
      </Button>
      <BasicMenu />
    </Box>
  )
}

export default NavigationBar
