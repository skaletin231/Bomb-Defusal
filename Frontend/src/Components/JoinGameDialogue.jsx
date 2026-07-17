import { useMutation } from '@apollo/client/react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import { useNavigate } from 'react-router-dom'
import { JOIN_GAME } from '../queries'

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
