import { Box, Button, Container } from '@mui/material'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import bomb from '../../images/bomb.svg'
import JoinGameDialogue from './JoinGameDialogue'

const boxStyle = {
  justifyContent: 'space-evenly',
  display: 'flex',
  alignItems: 'center',
  marginTop: '5rem',
}

const containerSX = {
  height: '60vh',
  alignContent: 'center',
  spacing: '20px',
}

const HomePage = () => {
  const [open, setOpen] = useState(false)

  return (
    <Box sx={{ height: '93vh' }}>
      <div
        className={'background'}
        style={{ backgroundColor: '#FFF8E9' }}
      ></div>
      <Container className='homePage' sx={containerSX}>
        <Box sx={{ justifyContent: 'center', display: 'flex' }}>
          <img style={{ width: '20rem' }} src={bomb} alt='Logo' />{' '}
        </Box>
        <Box sx={boxStyle}>
          <Button
            className='StartGameButton buttonStyle3D'
            variant='contained'
            component={Link}
            to='/startgame'
          >
            Start Game
          </Button>
          <Button
            className='JoinGameButton buttonStyle3D'
            variant='contained'
            onClick={() => setOpen(true)}
          >
            Join Game
          </Button>
        </Box>
      </Container>
      <JoinGameDialogue open={open} setOpen={setOpen} />
    </Box>
  )
}

export default HomePage
