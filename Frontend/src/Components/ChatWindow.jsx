import {
  useApolloClient,
  useMutation,
  useQuery,
  useSubscription,
} from '@apollo/client/react'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'
import { Box, Stack, TextField, Typography } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import { useEffect, useRef, useState } from 'react'
import { GET_MESSAGES, ME, MESSAGE_UPDATE, SEND_MESSAGE } from '../queries'

const textSX = {
  width: 'auto',
  maxWidth: '50%',
  borderRadius: '5px',
  padding: '.4rem',
  overflowWrap: 'break-word',
}

const formStyle = {
  flex: 1,
}

const stackSX = {
  padding: '0 .2rem',
  height: '150px',
  overflowY: 'auto',
}

const theirMessages = {
  alignSelf: 'flex-start',
  backgroundColor: '#a3a3a3',
}

const myMessages = {
  alignSelf: 'flex-end',
  backgroundColor: '#8bff3e',
}

const ChatWindow = ({ gameID, chatView }) => {
  const client = useApolloClient()
  const [messageToSend, setMessageToSend] = useState('')
  const bottomRef = useRef(null)

  const chatResults = useQuery(GET_MESSAGES, {
    variables: { gameID: gameID },
  })

  const { data: meData } = useQuery(ME, {})
  const me = meData.me

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    update: (cache, response) => {
      cache.updateQuery(
        {
          query: GET_MESSAGES,
          variables: { gameID: gameID },
        },
        (data) => {
          if (!data) return data

          return {
            ...data,
            getMessages: [...data.getMessages, response.data.sendMessage],
          }
        },
      )
      setMessageToSend('')
    },
  })

  useSubscription(MESSAGE_UPDATE, {
    onData: ({ data }) => {
      const update = data.data.messageUpdate
      if (update.user.id === me.id) return
      client.cache.updateQuery(
        {
          query: GET_MESSAGES,
          variables: { gameID: gameID },
        },
        (cacheData) => {
          if (!cacheData) return data
          return {
            ...cacheData,
            getMessages: [...cacheData.getMessages, update],
          }
        },
      )
    },
  })

  const chatHistory = chatResults.data?.getMessages

  useEffect(() => {
    if (chatResults.loading) return
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [chatResults.loading, chatHistory, bottomRef])

  if (chatResults.loading) return

  const trySendMessage = async (event) => {
    event?.preventDefault()

    if (messageToSend === '') return

    await sendMessage({
      variables: {
        gameID: gameID,
        text: messageToSend,
      },
    })
  }

  return (
    <Box sx={chatView === 'Hint' ? { display: 'None' } : null}>
      <Stack sx={stackSX} spacing={1}>
        {chatHistory.map((message, id) => (
          <Typography
            key={id}
            sx={[
              textSX,
              message.user.id === me.id ? myMessages : theirMessages,
            ]}
          >
            {message.text}
          </Typography>
        ))}
        <Box ref={bottomRef} />
      </Stack>
      <Box
        sx={{
          display: 'flex',
        }}
      >
        <form onSubmit={trySendMessage} style={formStyle}>
          <TextField
            fullWidth
            multiline
            minRows={1}
            maxRows={2}
            sx={{
              margin: '0',
              height: '100%',
              '& .MuiInputBase-inputMultiline': {
                height: '23px !important',
                overflowY: 'auto !important',
                boxSizing: 'border-box',
              },
              '& .MuiInputLabel-root': {
                transform: 'translate(14px, 100%) scale(1)',
              },
              '& .MuiInputLabel-shrink': {
                transform: 'translate(14px, -9px) scale(0.75)',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#84582E',
                borderWidth: '3px 0 0 0',
                borderRadius: '0px',
              },
              '& .MuiOutlinedInput-notchedOutline:hover': {
                borderColor: '#84582E',
                borderWidth: '3px 0 0 0',
                borderRadius: '0px',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#84582E',
                borderWidth: '3px 0 0 0',
                borderRadius: '0px',
              },
              '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#84582E',
                borderWidth: '3px 0 0 0',
                borderRadius: '0px',
              },
              '& .MuiInputBase-input': {
                scrollbarWidth: 'none',

                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              },
            }}
            value={messageToSend}
            variant='outlined'
            label='Message'
            onChange={({ target }) => setMessageToSend(target.value)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton type='submit' sx={{ alignSelf: 'center' }}>
                      <SendOutlinedIcon sx={{ color: '#84582E' }} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                trySendMessage()
              }
            }}
          ></TextField>
        </form>
      </Box>
    </Box>
  )
}

export default ChatWindow
