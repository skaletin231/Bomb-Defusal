import * as React from 'react'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { Alert } from '@mui/material'

export default function NotificationPopup({ message, color, open, setOpen }) {
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  const action = (
    <React.Fragment>
      <Button color='secondary' size='small' onClick={handleClose}>
        UNDO
      </Button>
      <IconButton
        size='small'
        aria-label='close'
        color='inherit'
        onClick={handleClose}
      >
        <CloseIcon fontSize='small' />
      </IconButton>
    </React.Fragment>
  )

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      action={action}
    >
      <Alert onClose={handleClose} severity={color}>
        {message}
      </Alert>
    </Snackbar>
  )
}
