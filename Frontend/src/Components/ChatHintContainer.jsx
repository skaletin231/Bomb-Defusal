import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, Button, Paper } from '@mui/material'
import Collapse from '@mui/material/Collapse'
import { useState } from 'react'
import ChatWindow from './ChatWindow'
import HintWindow from './HintWindow'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'

const containerSX = {
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  right: '0px',
  bottom: '0px',
  width: '21rem',
}

const paperSX = {
  margin: '0',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  borderRadius: '15% 15% 0px 0px',
  overflow: 'hidden',
  borderStyle: 'solid',
  borderWidth: '1px',
  backgroundColor: '#84582E',
  borderColor: '#84582E',
}

const collapseContainerSX = {
  borderStyle: 'solid',
  borderWidth: '0px 3px',
  borderColor: '#84582E',
  backgroundColor: '#ececec',
}

const ChatHintContainer = ({ gameID }) => {
  const [chatView, setChatView] = useState('Chat')
  const [open, setOpen] = useState(true)

  const changeView = (event, newView) => {
    if (newView === null) return
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
          <ToggleButtonGroup value={chatView} exclusive onChange={changeView}>
            <ToggleButton
              value='Chat'
              sx={{
                color: '#adadad',
                '&.Mui-selected': {
                  color: '#ffffff',
                  backgroundColor: '#724c28',
                },
                '&.Mui-selected:hover': {
                  backgroundColor: '#724c28',
                },
              }}
            >
              Chat
            </ToggleButton>
            <ToggleButton
              value='Hint'
              sx={{
                color: '#adadad',
                '&.Mui-selected': {
                  color: '#ffffff',
                  backgroundColor: '#724c28',
                },
                '&.Mui-selected:hover': {
                  backgroundColor: '#724c28',
                },
              }}
            >
              Hint
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box sx={{ alignSelf: 'stretch' }}>
          <Button
            onClick={toggleChat}
            sx={{
              color: '#d8d8d8',
              backgroundColor: 'transparent',
              padding: '0px',
              height: '100%',

              '&:hover': {
                backgroundColor: 'transparent',
                color: '#ffffff',
              },
              '&:active': {
                backgroundColor: 'transparent',
                color: '#ffffff',
              },
            }}
          >
            <ExpandMoreIcon
              sx={{
                transform: open ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 300ms ease',
                width: '36px',
                height: '36px',
              }}
            />
          </Button>
        </Box>
      </Paper>
      <Collapse sx={collapseContainerSX} in={open} timeout={300}>
        {chatContainer()}
        {hintContainer()}
      </Collapse>
    </Box>
  )
}

export default ChatHintContainer
