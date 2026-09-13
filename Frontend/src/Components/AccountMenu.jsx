import { useQuery } from '@apollo/client/react'
import { useAuth0 } from '@auth0/auth0-react'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useNavigate } from 'react-router-dom'
import { ME } from '../queries'
import { useState, useId } from 'react'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import { Box } from '@mui/material'

const divStyle = {
  //position: 'fixed',
  //top: 'calc(3.5vh - 16px)',
  //right: '3rem',
}

export default function AccountMenu() {
  const result = useQuery(ME, {})
  const loggedIn = result.data?.me !== null && !result.data.me.isGuest

  const { logout } = useAuth0()
  const navigate = useNavigate()

  const id = useId()
  const buttonId = `${id}-button`
  const menuId = `${id}-menu`
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleAccountTransition = () => {
    navigate('/account')
    handleClose()
  }

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    })
    handleClose()
  }

  const loggedInMenu = () => {
    return (
      <>
        <MenuItem onClick={handleAccountTransition}>My Account</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </>
    )
  }

  return (
    <Box sx={divStyle}>
      <IconButton
        onClick={handleClick}
        size='small'
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open}
      >
        <AccountCircleOutlinedIcon
          sx={{ fontSize: '2.5rem', color: '#9F4B24' }}
        />
      </IconButton>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': buttonId,
          },
        }}
      >
        {loggedInMenu()}
      </Menu>
    </Box>
  )
}
