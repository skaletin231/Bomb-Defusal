import { useMutation } from '@apollo/client/react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { ME, UPDATE_USER_INFO } from '../../queries'

const SetUsernameDialogue = ({ open }) => {
  const handleClose = () => {
    //setOpen(false)
  }

  const [updateUsername] = useMutation(UPDATE_USER_INFO, {
    refetchQueries: [ME],
  })

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
    const formatedString = formJson.newUsername.trim()
    console.log(formatedString)

    try {
      const result = await updateUsername({
        variables: {
          username: formatedString,
        },
      })
      console.log('results:', result)

      if (result.data === null || result.data.updateUserInfo === null) return
    } catch (error) {
      if (error?.errors?.[0]?.extensions?.code === 'INTERNAL_SERVER_ERROR') {
        console.error(`error processing request: ${formJson.newUsername}`)
      } else {
        console.error(error)
      }
    }
  }

  return (
    <Dialog
      className='setUsername'
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: dialogueSX,
          className: 'dialogDisplayTest',
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
        New User
      </DialogTitle>
      <DialogContent sx={contentSX}>
        <form
          className='flexRow'
          onSubmit={handleSubmit}
          id='set-username-form'
          style={{ gap: '20px' }}
        >
          <TextField
            autoComplete='off'
            variant='outlined'
            autoFocus
            required
            id='newUsername'
            name='newUsername'
            placeholder='Enter Username'
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
            Accept
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default SetUsernameDialogue
