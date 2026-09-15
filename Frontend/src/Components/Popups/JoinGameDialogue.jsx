import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import { IconButton, Typography } from '@mui/material'
import { useMutation } from '@apollo/client/react'
import { JOIN_GAME, ME } from '../../queries'
import { useNavigate } from 'react-router-dom'
import CloseIcon from '@mui/icons-material/Close'

function JoinGameDialogue({ open, setOpen }) {
  const handleClose = () => {
    setOpen(false)
  }

  const [joinGame] = useMutation(JOIN_GAME, {
    refetchQueries: [ME],
  })
  const navigate = useNavigate()

  const dialogueSX = {
    borderColor: '#834724',
    borderStyle: 'solid',
    borderWidth: '4px',
    backgroundColor: '#FFFBF3',
    width: '50vw',
    padding: '6rem',
    borderRadius: '20px',
  }

  const contentSX = {
    isolation: 'isolate',
  }

  const joinButtonSX = {
    '&&': {
      alignSelf: 'center',
      height: '50px',
      flexShrink: '0',
    },
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const formJson = Object.fromEntries(formData.entries())
    const formatedString = formJson.gameID.trim()
    try {
      const result = await joinGame({
        variables: {
          gameID: formatedString,
        },
      })

      if (result.data === null || result.data.joinGame === null) return

      navigate(`/playing/${result.data.joinGame.id}`)
    } catch (error) {
      if (error?.errors?.[0]?.extensions?.code === 'INTERNAL_SERVER_ERROR') {
        console.error(`Invalid ID recieved: ${formJson.gameID}`)
      } else {
        console.error(error)
      }
    }
  }

  return (
    <Dialog
      className='confirmJoin'
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: dialogueSX,
          className: 'dialogDisplay',
        },
      }}
    >
      <DialogTitle
        className='normalText'
        sx={{
          '&&': { fontSize: '3rem' },
          textAlign: 'center',
          padding: '0 0 3.5rem 0',
        }}
      >
        Join Game
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
      </DialogTitle>
      <DialogContent sx={contentSX}>
        <form
          className='flexRow'
          onSubmit={handleSubmit}
          id='join-game-form'
          style={{ gap: '20px' }}
        >
          <TextField
            autoComplete='off'
            variant='outlined'
            autoFocus
            required
            id='gameID'
            name='gameID'
            placeholder='Enter Invite Code'
            className='textFieldStyle3D'
            sx={{
              '& input::placeholder': {
                fontStyle: 'italic',
              },
            }}
          />

          <Button
            sx={joinButtonSX}
            className='buttonStyle3D'
            variant='contained'
            type='submit'
          >
            Join
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default JoinGameDialogue
