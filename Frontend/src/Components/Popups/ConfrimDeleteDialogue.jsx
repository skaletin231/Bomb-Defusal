import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { Typography } from '@mui/material'

function ConfirmDeleteDialogue({ open, setTracker, onConfirm }) {
  const handleClose = () => {
    setTracker(null)
  }

  const dialogueSX = {
    borderColor: '#881C1C',
    borderStyle: 'solid',
    borderWidth: '4px',
    backgroundColor: '#FFFBF3',
    width: '50vw',
    padding: '2.5rem',
    borderRadius: '20px',
  }

  const actionSX = {
    justifyContent: 'space-around',
    isolation: 'isolate',
    padding: '8px 0px 0px 0px',
  }

  const contentSX = {
    textAlign: 'center',
    padding: '0px 0px 20px 0px',
  }

  const warningSX = {
    color: '#B43131',
    fontSize: '4rem',
  }

  const headerSX = {
    color: '#3A1605',
    fontSize: '1.8rem',
    fontWeight: 'bold',
  }

  const textSX = {
    color: '#737373',
    fontStyle: 'italic',
  }

  return (
    <Dialog
      className='confirmDelete'
      open={open}
      onClose={(event, reason) => handleClose(event, reason)}
      slotProps={{
        paper: {
          sx: dialogueSX,
          className: 'dialogDisplayTest',
        },
      }}
    >
      <DialogContent sx={contentSX}>
        <WarningAmberIcon sx={warningSX} />
        <Typography sx={headerSX}>Are you sure?</Typography>
        <Typography sx={textSX}>This action cannot be undone.</Typography>
      </DialogContent>
      <DialogActions sx={actionSX}>
        <Button
          className='buttonStyle3D cancel'
          variant='contained'
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          className='buttonStyle3D warning'
          variant='contained'
          onClick={onConfirm}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDeleteDialogue
