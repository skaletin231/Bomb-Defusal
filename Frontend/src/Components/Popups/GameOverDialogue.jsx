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

const GameOverDataSX = {
  color: '#3A1605',
  fontSize: '1rem',
  textAlign: 'center',
  lineHeight: '1',
}

const gameStates = {
  hint: 'Hint',
  win: 'Win',
  lose: 'Lose',
  playing: 'Playing',
  waiting: 'waiting',
}

function GameOverScreen({ open, setOpen, game }) {
  const navigate = useNavigate()
  const gameWon = game.gameState === gameStates.win

  const imageStyle = {
    height: '130%',
    alignSelf: 'end',
    padding: gameWon ? '20px 0px' : '0px',
  }

  const GameOverHeaderSX = {
    fontSize: '3.5rem',
    fontFamily: '"Luckiest Guy", serif',
    color: gameWon ? '#286B1F' : '#B43131',
    textAlign: 'center',
    lineHeight: '1',
  }

  const GameOverMessageSX = {
    color: gameWon ? '#1E5C15' : '#B43131',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: '1',
  }

  const [startGame] = useMutation(START_GAME, {
    refetchQueries: [ME],
  })

  const handleSubmit = async (event) => {
    event.preventDefault()

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

  const gameWinText = () => {
    return (
      <>
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
      </>
    )
  }

  const gameLossText = () => {
    return (
      <>
        <Typography sx={GameOverHeaderSX}>GAME OVER...</Typography>
        <Typography sx={GameOverMessageSX}>{getGameLossText()}</Typography>
      </>
    )
  }

  const getGameLossText = () => {
    if (game.mistakeLimit >= 0 && game.mistakes > game.mistakeLimit)
      return 'You made too many mistakes!'
    if (game.board.spots.some((spot) => spot.typeRevealed.myType === 'bomb'))
      return 'You activated a bomb!'

    return 'you ran out of time!'
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
            backgroundColor: gameWon ? '#BBE890' : '#FFB7B7',
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
      <DialogContent
        className='DialogueTest'
        sx={{ overflow: 'visible', padding: '0px 24px' }}
      >
        <Box
          className='flexRow'
          sx={{
            gap: '30px',
            height: '300px',
            width: '720px',
            flexShrink: '1',
          }}
        >
          {gameWon ? (
            <img src={gameWonImage} style={imageStyle} />
          ) : (
            <img src={gameLostImage} style={imageStyle} />
          )}
          <Box
            className='flexColumn'
            sx={{ justifyContent: 'space-evenly', padding: '30px 0px' }}
          >
            {gameWon ? <>{gameWinText()}</> : <>{gameLossText()}</>}
            <Box
              className='flexRow'
              sx={{
                gap: '10px',
                justifyContent: 'center',
                isolation: 'isolate',
                marginTop: '10px',
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
      </DialogContent>
    </Dialog>
  )
}

export default GameOverScreen
