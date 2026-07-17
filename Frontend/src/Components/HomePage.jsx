import { Button, Box, Container } from '@mui/material'
import { Link } from 'react-router-dom'
import JoinGameDialogue from './JoinGameDialogue'
import bomb from '../../images/bomb.svg'
import { useState } from 'react'

const boxStyle = {
  justifyContent: 'space-evenly',
  display: 'flex',
  alignItems: 'center',
}

const HomePage = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className={'background'}
        style={{ backgroundColor: '#27bfda' }}
      ></div>
      <Container className='homePage'>
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
    </>
  )
}

export default HomePage
