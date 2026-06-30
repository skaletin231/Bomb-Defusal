import * as React from 'react'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useAuth0 } from '@auth0/auth0-react'
import IconButton from '@mui/material/IconButton'
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline'

const divStyle = {
  position: 'absolute',
  top: '5px',
  right: '5px',
}

export default function BasicMenu({ loggedIn }) {
  const { loginWithRedirect, logout } = useAuth0()

  const id = React.useId()
  const buttonId = `${id}-button`
  const menuId = `${id}-menu`
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleProfileTransition = () => {
    console.log('not implamented yet')
    handleClose()
  }

  const handleAccountTransition = () => {
    console.log('not implamented yet')
    handleClose()
  }

  const handleLogout = () => {
    logout()
    handleClose()
  }

  const handleLogin = () => {
    handleClose()
    loginWithRedirect()
  }

  const loggedOutMenu = () => {
    return <MenuItem onClick={handleLogin}>Login</MenuItem>
  }

  const loggedInMenu = () => {
    return (
      <>
        <MenuItem onClick={handleProfileTransition}>Profile</MenuItem>
        <MenuItem onClick={handleAccountTransition}>My account</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </>
    )
  }

  return (
    <div style={divStyle}>
      <IconButton
        onClick={handleClick}
        size='small'
        sx={{ ml: 2 }}
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open}
      >
        <ViewHeadlineIcon sx={{ width: 32, height: 32 }} />
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
        {loggedIn && loggedInMenu()}
        {!loggedIn && loggedOutMenu()}
      </Menu>
    </div>
  )
}
