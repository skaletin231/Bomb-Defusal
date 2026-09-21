import { Box, Button, Typography } from '@mui/material'
import Divider from '@mui/material/Divider'
import { DELETE_USER, ME } from '../queries'
import { useMutation, useQuery, useApolloClient } from '@apollo/client/react'
import { useAuth0 } from '@auth0/auth0-react'
import ConfirmDeleteDialogue from './Popups/ConfrimDeleteDialogue'
import { useState } from 'react'

const AccountPage = () => {
  const result = useQuery(ME, {})
  const [openDeletePrompt, setOpenDeletePrompt] = useState(null)

  const client = useApolloClient()
  const { logout } = useAuth0()

  const [deleteUser] = useMutation(DELETE_USER)

  const tryDeleteUser = async () => {
    await deleteUser()
    await client.clearStore()
    await logout()

    setOpenDeletePrompt(null)
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  const user = result.data?.me

  if (user === null || user.isGuest)
    return <Typography>Not logged in</Typography>

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    })
  }

  return (
    <Box
      className='accountPage content flexColumn'
      sx={{ gap: '40px', marginTop: '2vh' }}
    >
      <Typography className='mainHeader'>My Account</Typography>
      <Divider />
      <Box className='flexColumn' sx={{ gap: '15px' }}>
        <Box
          className='flexRow'
          sx={{ gap: '10px', height: 'fit-content', alignItems: 'center' }}
        >
          <Typography className='normalText'>
            Logged in as:{' '}
            <Typography component='span' className='bigText'>
              {user.username}
            </Typography>
          </Typography>

          <Button
            variant='contained'
            className='brown buttonStyle3D'
            sx={{ '&&': { height: '2.5rem' } }}
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </Box>

        <Typography className='normalText'>
          Email:{' '}
          <Typography component='span' className='bigText'>
            {user.email}
          </Typography>
        </Typography>
      </Box>

      <Divider />
      <Box className='flexColumn' sx={{ gap: '15px' }}>
        <Typography className='biggerText'>Delete Account</Typography>
        <Typography className='warning' sx={{ fontStyle: 'italic' }}>
          This will permanently remove all of your decks and data.
        </Typography>
        <Button
          className='buttonStyle3D warning'
          variant='contained'
          sx={{ '&&': { width: 'fit-content', height: '2.5rem' } }}
          onClick={() => setOpenDeletePrompt(true)}
        >
          Delete Account
        </Button>
      </Box>
      <ConfirmDeleteDialogue
        open={openDeletePrompt}
        onConfirm={tryDeleteUser}
        setTracker={setOpenDeletePrompt}
      />
    </Box>
  )
}

export default AccountPage
