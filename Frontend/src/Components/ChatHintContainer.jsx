import { useState } from 'react'
import { Button, Box, Stack, Paper, Typography, TextField } from '@mui/material'
import ChatWindow from './ChatWindow'
import HintWindow from './HintWindow'

const containerSX = {
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  right: '2rem',
  bottom: '2rem',
  backgroundColor: '#e3e3e3',
  border: 'solid',
  borderWidth: '.1rem',
  width: '21rem',
}

const paperSX = {
  backgroundColor: '#d4d4d4',
  margin: '.1rem',
}

const selectedButton = {
  backgroundColor: '#f3f0f0',
}

const ChatHintContainer = ({ gameID }) => {
  const [chatView, setChatView] = useState('Chat')

  const changeView = (newView) => {
    setChatView(newView)
  }

  const chatContainer = () => {
    return <ChatWindow gameID={gameID} />
  }

  const hintContainer = () => {
    return <HintWindow gameID={gameID} />
  }

  return (
    <Box sx={containerSX} className='chatbox'>
      <Paper sx={paperSX} elevation={1}>
        <Button
          sx={chatView === 'Chat' ? selectedButton : null}
          onClick={() => changeView('Chat')}
        >
          Chat
        </Button>
        <Button
          sx={chatView === 'Hint' ? selectedButton : null}
          onClick={() => changeView('Hint')}
        >
          Hint
        </Button>
      </Paper>
      {chatView === 'Chat' && chatContainer()}
      {chatView === 'Hint' && hintContainer()}
    </Box>
  )
}

export default ChatHintContainer
