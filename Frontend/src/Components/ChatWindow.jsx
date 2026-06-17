import { Button, Box, Stack, Paper, Typography, TextField } from '@mui/material'

const containerSX = {
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  right: '2rem',
  bottom: '2rem',
  backgroundColor: '#e3e3e3',
  border: 'solid',
  borderWidth: '.1rem',
}

const paperSX = {
  backgroundColor: '#d4d4d4',
  margin: '.1rem',
}

const textSX = {
  width: 'auto',
  maxWidth: '50%',
  borderRadius: '5px',
  padding: '.4rem',
}

const stackSX = {
  padding: '0 .2rem',
  height: '150px',
  overflowY: 'auto',
}

const message1 = {
  alignSelf: 'flex-start',
  backgroundColor: '#a3a3a3',
}

const message2 = {
  alignSelf: 'flex-end',
  backgroundColor: '#8bff3e',
}

const ChatWindow = () => {
  return (
    <Box sx={containerSX}>
      <Paper sx={paperSX} elevation={1}>
        Chat
      </Paper>
      <Stack sx={stackSX} spacing={1}>
        {dataTest.map((message, id) => (
          <Typography
            key={id}
            sx={[textSX, message.player === 0 ? message1 : message2]}
          >
            {message.message}
          </Typography>
        ))}
      </Stack>
      <Box
        sx={{ display: 'flex', border: 'solid', borderWidth: '.1rem 0 0 0' }}
      >
        <TextField
          sx={{ margin: '.4rem .1rem' }}
          variant='outlined'
          label='Message'
        ></TextField>
        <Button sx={{ margin: '.4rem' }} variant='contained'>
          Send
        </Button>
      </Box>
    </Box>
  )
}

export default ChatWindow

/*
  Layout:

  Outside Box
      Header Bar of some kind
      Stack
          Messages
      Input area
          Inpout Field
          Button

*/

const dataTest = [
  {
    player: 1,
    message: 'This is a test',
  },
  {
    player: 0,
    message: 'You sure?',
  },
  {
    player: 0,
    message: 'I mean REALLY sure?',
  },
  {
    player: 1,
    message: 'Yes',
  },
  {
    player: 1,
    message: 'This should work',
  },
  {
    player: 1,
    message: 'But it is hard coded a bit for now',
  },
  {
    player: 0,
    message: 'hmmm',
  },
  {
    player: 1,
    message: '?',
  },
]
