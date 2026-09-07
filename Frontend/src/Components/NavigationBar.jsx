import { Box, Button } from '@mui/material'
import { Link } from 'react-router-dom'
import BasicMenu from './BasicMenu'
import bomb from '../../images/bomb.svg'

const navBarStyle = {
  position: 'sticky',
  top: '0px',
  width: 'calc(100vw - 7rem)',
  zIndex: '100',
  backgroundColor: '#FFF8E9',
  height: '7vh',
}

const NavigationBar = () => {
  return (
    <Box sx={navBarStyle} className='navigationBar'>
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
      <BasicMenu />
    </Box>
  )
}

export default NavigationBar
