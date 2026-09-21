import { useAuth0 } from '@auth0/auth0-react'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useNavigate } from 'react-router-dom'
import { useState, useId } from 'react'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import { Box, Divider } from '@mui/material'
import { useLocation } from 'react-router-dom'

const menuSX = {
  '& .MuiPaper-root': {
    backgroundColor: '#F4F0E8',
    boxShadow: 'none',
    left: 'auto',
    borderRadius: '0px 0px 10px 10px',
  },
}

export default function AccountMenu() {
  const { pathname } = useLocation()

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
        <Divider sx={{ '&&': { margin: '0px' } }} />
        <MenuItem sx={{ color: '#B43131' }} onClick={handleLogout}>
          Logout
        </MenuItem>
      </>
    )
  }

  return (
    <Box>
      <IconButton
        onClick={handleClick}
        size='small'
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open}
      >
        <AccountCircleOutlinedIcon
          sx={{
            fontSize: '2.5rem',
            color: pathname.includes('account') ? '#9F4B24' : '#3A1605',
          }}
        />
      </IconButton>
      <Menu
        className='accountMenu'
        disableScrollLock
        sx={menuSX}
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
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
