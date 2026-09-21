import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import { Box, Button, Divider } from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useId, useState } from 'react'

const menuSX = {
  '& .MuiPaper-root': {
    backgroundColor: '#F4F0E8',
    boxShadow: 'none',
    left: 'auto',
    borderRadius: '0px 0px 10px 10px',
  },
}

export default function SortMenu({ sortBy, setSortBy }) {
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

  const handleSelection = (selection) => {
    setSortBy(selection)
    handleClose()
  }

  const menu = () => {
    return (
      <>
        <MenuItem onClick={() => handleSelection('Name (a-z)')}>
          Name (a-z)
        </MenuItem>
        <Divider sx={{ '&&': { margin: '0px' } }} />
        <MenuItem onClick={() => handleSelection('Name (z-a)')}>
          Name (z-a)
        </MenuItem>
        <Divider sx={{ '&&': { margin: '0px' } }} />

        <MenuItem onClick={() => handleSelection('Date Added (Oldest First)')}>
          Date Added (Oldest First)
        </MenuItem>
        <Divider sx={{ '&&': { margin: '0px' } }} />

        <MenuItem onClick={() => handleSelection('Date Added (Newest First)')}>
          Date Added (Newest First)
        </MenuItem>
      </>
    )
  }

  return (
    <Box>
      <Button
        className='normalText'
        onClick={handleClick}
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open}
      >
        Sort By: {sortBy}
        <SwapHorizIcon sx={{ width: 32, height: 32 }} />
      </Button>
      <Menu
        className='sortMenu'
        disableScrollLock
        sx={menuSX}
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
        {menu()}
      </Menu>
    </Box>
  )
}
