import { TextField, Button } from '@mui/material'
import { useState } from 'react'
import { UPDATE_USER_INFO } from '../queries'
import { useMutation } from '@apollo/client/react'

const AccountSetup = () => {
  const [username, setUsername] = useState('')

  const [updateUserInfo] = useMutation(UPDATE_USER_INFO, {
    update: (cache, response) => {
      console.log('need to update user info', response)
    },
  })

  const updateAccount = (event) => {
    event.preventDefault()
    updateUserInfo({
      variables: {
        username: username,
      },
    })
  }

  return (
    <div>
      <form onSubmit={updateAccount}>
        <div>
          <label>
            <TextField
              label='username'
              required
              slotProps={{
                htmlInput: {
                  minLength: 3,
                },
              }}
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
          </label>
        </div>

        <Button type='submit' variant='contained'>
          Submit
        </Button>
      </form>
    </div>
  )
}

export default AccountSetup
