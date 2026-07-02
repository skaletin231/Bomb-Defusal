import * as React from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { JOIN_GAME } from '../queries'
import { useMutation } from '@apollo/client/react'
import { useNavigate } from 'react-router-dom'

function JoinGameDialogue({ open, setOpen }) {
  const [joinGame] = useMutation(JOIN_GAME)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const formJson = Object.fromEntries(formData.entries())

    const result = await joinGame({
      variables: {
        gameID: formJson.gameID,
      },
    })

    if (result.data === null || result.data.joinGame === null) return

    navigate(`/playing/${result.data.joinGame.id}`)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Join Game</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} id='join-game-form'>
          <TextField
            autoFocus
            required
            margin='dense'
            id='name'
            name='gameID'
            label='game ID'
            fullWidth
            variant='standard'
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type='submit' form='join-game-form'>
          Join
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default JoinGameDialogue
