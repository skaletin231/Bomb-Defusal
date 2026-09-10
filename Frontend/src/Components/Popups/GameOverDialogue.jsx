import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { Link, useNavigate } from 'react-router-dom'
import gameLostImage from '../../../images/Lose Screen.png'
import gameWonImage from '../../../images/Win Screen.png'
import { Box, IconButton, Typography } from '@mui/material'
import '@fontsource/luckiest-guy'
import CloseIcon from '@mui/icons-material/Close'
import { START_GAME, ME } from '../../queries'
import { useMutation } from '@apollo/client/react'

const imageStyle = {
  height: '130%',
  alignSelf: 'end',
}

const GameOverDataSX = {
  color: '#3A1605',
  fontSize: '1rem',
  textAlign: 'center',
}

const GameOverHeaderSX = {
  fontSize: '3.5rem',
  fontFamily: '"Luckiest Guy", serif',
  color: '#286B1F',
  textAlign: 'center',
  lineHeight: '1',
}

const GameOverMessageSX = {
  color: '#1E5C15',
  fontSize: '1.25rem',
  fontWeight: 'bold',
  textAlign: 'center',
}

function GameOverScreen({ open, setOpen, game }) {
  const navigate = useNavigate()

  const [startGame] = useMutation(START_GAME, {
    refetchQueries: [ME],
  })

  const handleSubmit = async (event) => {
    event.preventDefault()

    console.log('not done yet')

    const result = await startGame({
      variables: {
        deckID: game.deckID,
        mistakeLimit: game.mistakeLimit,
        turnLimit: game.roundLimit,
      },
    })

    if (result.data === null || result.data === undefined) return

    navigate(`/playing/${result.data.startGame}`)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleReturnHome = () => {
    handleClose()
    navigate('/')
  }

  const gameWin = () => {
    return (
      <>
        <Box
          className='flexRow'
          sx={{
            gap: '30px',
            height: '260px',
            width: '700px',
            flexShrink: '1',
          }}
        >
          <img src={gameWonImage} style={imageStyle} />

          <Box className='flexColumn' sx={{ justifyContent: 'space-evenly' }}>
            <Typography sx={GameOverHeaderSX}>YOU WIN!</Typography>
            <Typography sx={GameOverDataSX}>
              {game.maxTurns - game.turnsRemaining}{' '}
              {game.maxTurns - game.turnsRemaining === 1 ? 'round' : 'rounds'} •{' '}
              {game.mistakes} {game.mistakes === 1 ? 'mistake' : 'mistakes'}{' '}
              {game.mistakeLimit !== -1 && (
                <>
                  • {game.mistakes}/{game.mistakeLimit} mistakes made
                </>
              )}
            </Typography>
            <Typography sx={GameOverMessageSX}>
              Thanks to you, no one had to blow up!
            </Typography>
            <Box
              className='flexRow'
              sx={{
                gap: '10px',
                justifyContent: 'center',
                isolation: 'isolate',
              }}
            >
              <Button
                className='buttonStyle3D'
                variant='contained'
                onClick={handleSubmit}
              >
                Play Again
              </Button>
              <Button
                className='brown buttonStyle3D'
                variant='contained'
                onClick={handleReturnHome}
              >
                Exit
              </Button>
            </Box>
          </Box>
        </Box>
      </>
    )
  }

  const gameLose = () => {
    return <p>You Lose</p>
  }

  return (
    <Dialog
      className='gameOverDialogue'
      maxWidth='none'
      open={open}
      onClose={handleClose}
      disableScrollLock
      slotProps={{
        paper: {
          sx: {
            borderRadius: '40px',
            overflow: 'visible',
            backgroundColor: '#BBE890',
            border: '.15rem solid white',
          },
        },
      }}
    >
      <IconButton
        aria-label='close'
        onClick={handleClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon
          sx={{
            fontSize: '3rem',
          }}
        />
      </IconButton>
      <DialogContent className='DialogueTest' sx={{ overflow: 'visible' }}>
        {game.gameState === 'Win' && gameWin()}
        {game.gameState === 'Lose' && gameLose()}
      </DialogContent>
    </Dialog>
  )
}

export default GameOverScreen
