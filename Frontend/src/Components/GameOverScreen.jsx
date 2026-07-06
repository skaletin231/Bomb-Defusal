import * as React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { useNavigate } from 'react-router-dom'

function GameOverScreen({ open, setOpen, gameState }) {
  const navigate = useNavigate()

  const handleClose = () => {
    setOpen(false)
  }

  const handleReturnHome = () => {
    handleClose()
    navigate('/')
  }

  const gameWin = () => {
    return <p>You Win</p>
  }

  const gameLose = () => {
    return <p>You Lose</p>
  }

  return (
    <Dialog open={open} onClose={handleClose} disableScrollLock>
      <DialogTitle>Game Over</DialogTitle>
      <DialogContent>
        {gameState === 'Win' && gameWin()}
        {gameState === 'Lose' && gameLose()}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReturnHome}>Return To Home</Button>
        <Button onClick={handleClose}>View Board</Button>
      </DialogActions>
    </Dialog>
  )
}

export default GameOverScreen
