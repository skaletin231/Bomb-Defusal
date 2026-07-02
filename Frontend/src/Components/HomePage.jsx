import { Button, Box, Container } from '@mui/material'
import { Link } from 'react-router-dom'
import JoinGameDialogue from './JoinGameDialogue'
import bomb from '../../images/bomb.svg'
import { useState } from 'react'

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
    content: '""',
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

const HomePage = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div style={backgroundStyle} className={'backgroundBottom'}></div>
      <Container sx={containerStyle}>
        <Box sx={{ justifyContent: 'center', display: 'flex' }}>
          <img style={{ width: '20rem' }} src={bomb} alt='Logo' />{' '}
        </Box>
        <Box sx={boxStyle}>
          <Button
            className='StartGameButton'
            sx={buttonStyle}
            variant='contained'
            component={Link}
            to='/startgame'
          >
            Start Game
          </Button>
          <Button
            className='JoinGameButton'
            sx={buttonStyle}
            variant='contained'
            onClick={() => setOpen(true)}
          >
            Join Game
          </Button>
        </Box>
      </Container>
      <JoinGameDialogue open={open} setOpen={setOpen} />
    </>
  )
}

export default HomePage
