import { useState } from 'react'
import { Button, Box, Stack, Paper, Typography, TextField } from '@mui/material'
import Collapse from '@mui/material/Collapse'
import ChatWindow from './ChatWindow'
import HintWindow from './HintWindow'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const containerSX = {
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  right: '0px',
  bottom: '0px',
  backgroundColor: '#e3e3e3d5',
  border: 'solid',
  borderWidth: '.1rem',
  width: '21rem',
}

const paperSX = {
  backgroundColor: '#d4d4d4d5',
  margin: '.1rem',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
}

const selectedButton = {
  backgroundColor: '#f3f0f0d5',
}

const ChatHintContainer = ({ gameID }) => {
  const [chatView, setChatView] = useState('Chat')
  const [open, setOpen] = useState(true)

  const changeView = (newView) => {
    setChatView(newView)
  }

  const chatContainer = () => {
    return <ChatWindow gameID={gameID} chatView={chatView} />
  }

  const hintContainer = () => {
    return <HintWindow gameID={gameID} chatView={chatView} />
  }
  const toggleChat = () => {
    setOpen(!open)
  }

  return (
    <Box sx={containerSX} className='chatbox'>
      <Paper sx={paperSX} elevation={1}>
        <Box>
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
        </Box>
        <Box>
          <Button onClick={toggleChat}>
            <ExpandMoreIcon
              sx={{
                transform: open ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 300ms ease',
              }}
            />
          </Button>
        </Box>
      </Paper>
      <Collapse in={open} timeout={300}>
        {chatContainer()}
        {hintContainer()}
      </Collapse>
    </Box>
  )
}

export default ChatHintContainer
