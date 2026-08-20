import { useMutation } from '@apollo/client/react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { START_GAME, ME } from '../../queries'
import NumberField from '.././NumberField'

function CreateGameDialogue({ id, setID }) {
  const [mistakeLimit, setMistakeLimit] = useState(-1)
  const [turnLimit, setTurnLimit] = useState(9)

  const navigate = useNavigate()

  const [startGame] = useMutation(START_GAME, {
    refetchQueries: [ME],
  })

  const handleClose = (event, reason) => {
    if (reason === 'backdropClick') return
    setID(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const result = await startGame({
      variables: {
        deckID: id,
        mistakeLimit: mistakeLimit,
        turnLimit: turnLimit,
      },
    })

    if (result.data === null || result.data === undefined) return

    navigate(`/playing/${result.data.startGame}`)
  }

  return (
    <Dialog open={id !== null} onClose={handleClose} disableScrollLock>
      <DialogTitle>Create Game</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} id='join-game-form'>
          <div
            style={{
              padding: '10px',
              flexDirection: 'column',
              display: 'flex',
            }}
          >
            <NumberField
              label='Turn Limit'
              value={turnLimit}
              min={2}
              max={20}
              onValueChange={(val) => setTurnLimit(Math.trunc(val))}
            />
            <NumberField
              sx={{ marginTop: '20px' }}
              label='Mistakes Limit'
              value={mistakeLimit}
              min={-1}
              max={10}
              onValueChange={(val) => setMistakeLimit(Math.trunc(val))}
            />
          </div>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type='submit' form='join-game-form'>
          Create Game
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateGameDialogue
