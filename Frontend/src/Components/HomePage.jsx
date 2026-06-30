import { Button, Box, Container } from '@mui/material'
import { Link } from 'react-router-dom'

const containerStyle = {
  height: '100dvh',
}

const boxStyle = {
  justifyContent: 'space-evenly',
  display: 'flex',
  alignItems: 'center',
}

const buttonStyle = {
  backgroundColor: '#0063cc',
  width: '10rem',
  height: '4rem',
  borderRadius: '20px',
  '&:hover': {
    backgroundColor: '#0063cc',
    width: '10rem',
    height: '4rem',
    borderRadius: '20px',
  },
  '&:active': {
    top: '6px',
    left: '2px',
    '&:after': {
      right: '-2px',
      bottom: '-2px',
      left: '-2px',
      top: '-2px',
    },
  },
  '&:after': {
    content: `''`,
    position: 'absolute',
    top: '4px',
    left: '0px',
    right: '-4px',
    bottom: '-8px',
    display: 'block',
    border: '.2rem solid #ce8f07',
    backgroundColor: '#3b82ce',
    borderRadius: '20px',
    zIndex: '-1',
  },
}

const backgroundStyle = {
  top: '0',
  left: '0',
  bottom: '0',
  right: '0',
  position: 'absolute',
  backgroundColor: '#27bfda',
  zIndex: '-2',
}

import bomb from '../../images/bomb.svg'

const HomePage = () => {
  return (
    <>
      <div style={backgroundStyle} className={'backgroundBottom'}></div>
      <Container sx={containerStyle}>
        <Box sx={{ justifyContent: 'center', display: 'flex' }}>
          <img style={{ width: '20rem' }} src={bomb} alt='Logo' />{' '}
        </Box>
        <Box sx={boxStyle}>
          <Button
            sx={buttonStyle}
            variant='contained'
            component={Link}
            to='/startgame'
          >
            Start Game
          </Button>
          <Button sx={buttonStyle} variant='contained'>
            Join Game
          </Button>
        </Box>
      </Container>
    </>
  )
}

export default HomePage
