import { useQuery } from '@apollo/client/react'
import { useAuth0 } from '@auth0/auth0-react'
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { ME } from '../queries'

const divStyle = {
  position: 'fixed',
  top: 'calc(3.5vh - 16px)',
  right: '3rem',
}

export default function BasicMenu() {
  const result = useQuery(ME, {})
  const loggedIn = result.data?.me !== null

  const { loginWithRedirect, logout } = useAuth0()
  const navigate = useNavigate()

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

  // const handleProfileTransition = () => {
  //   console.log('not implamented yet')
  //   handleClose()
  // }

  const handleLogout = () => {
    logout()
    handleClose()
  }

  const handleLogin = () => {
    handleClose()
    loginWithRedirect()
  }

  const handleMyDeckTransition = () => {
    handleClose()
    navigate('/mydecks')
  }

  const handleBackToHome = () => {
    handleClose()
    navigate('/')
  }

  const loggedOutMenu = () => {
    return <MenuItem onClick={handleLogin}>Login</MenuItem>
  }

  const loggedInMenu = () => {
    return (
      <>
        {/* <MenuItem onClick={handleProfileTransition}>Profile</MenuItem> */}
        <MenuItem onClick={handleBackToHome}>Home</MenuItem>
        <MenuItem onClick={handleMyDeckTransition}>My deck</MenuItem>
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
