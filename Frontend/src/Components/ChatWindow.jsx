import { Button, Box, Stack, Paper, Typography, TextField } from '@mui/material'
import { GET_MESSAGES, ME, SEND_MESSAGE, MESSAGE_UPDATE } from '../queries'
import {
  useApolloClient,
  useMutation,
  useQuery,
  useSubscription,
} from '@apollo/client/react'
import { useState, useEffect, useRef } from 'react'

// const containerSX = {
//   display: 'flex',
//   flexDirection: 'column',
//   position: 'absolute',
//   right: '2rem',
//   bottom: '2rem',
//   backgroundColor: '#e3e3e3',
//   border: 'solid',
//   borderWidth: '.1rem',
// }

// const paperSX = {
//   backgroundColor: '#d4d4d4',
//   margin: '.1rem',
// }

const textSX = {
  width: 'auto',
  maxWidth: '50%',
  borderRadius: '5px',
  padding: '.4rem',
}

const formStyle = {
  justifyContent: 'flex-start',
  flexDirection: 'row',
  display: 'flex',
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

const ChatWindow = ({ gameID }) => {
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
    event.preventDefault()

    sendMessage({
      variables: {
        gameID: gameID,
        text: messageToSend,
      },
    })
  }

  return (
    // <Box sx={containerSX} className='chatbox'>
    //   <Paper sx={paperSX} elevation={1}>
    //     Chat
    //   </Paper>
    //   <Stack sx={stackSX} spacing={1}>
    //     {chatHistory.map((message, id) => (
    //       <Typography
    //         key={id}
    //         sx={[
    //           textSX,
    //           message.user.id === me.id ? myMessages : theirMessages,
    //         ]}
    //       >
    //         {message.text}
    //       </Typography>
    //     ))}
    //     <div ref={bottomRef} />
    //   </Stack>
    //   <Box
    //     sx={{ display: 'flex', border: 'solid', borderWidth: '.1rem 0 0 0' }}
    //   >
    //     <form onSubmit={trySendMessage}>
    //       <TextField
    //         sx={{ margin: '.4rem .1rem' }}
    //         variant='outlined'
    //         label='Message'
    //         onChange={({ target }) => setMessageToSend(target.value)}
    //       ></TextField>
    //       <Button type='submit' sx={{ margin: '.4rem' }} variant='contained'>
    //         Send
    //       </Button>
    //     </form>
    //   </Box>
    // </Box>
    <>
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
        <div ref={bottomRef} />
      </Stack>
      <Box
        sx={{ display: 'flex', border: 'solid', borderWidth: '.1rem 0 0 0' }}
      >
        <form onSubmit={trySendMessage} style={formStyle}>
          <div style={{ width: '70%' }}>
            <TextField
              sx={{ margin: '.4rem .1rem' }}
              variant='outlined'
              label='Message'
              onChange={({ target }) => setMessageToSend(target.value)}
            ></TextField>
          </div>

          <Button
            type='submit'
            sx={{ marginLeft: 'auto', margin: '.4rem' }}
            variant='contained'
          >
            Send
          </Button>
        </form>
      </Box>
    </>
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
