import { Button } from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useState, useId } from 'react'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'

const divStyle = {}

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
        <MenuItem onClick={() => handleSelection('Name (z-a)')}>
          Name (z-a)
        </MenuItem>
        <MenuItem onClick={() => handleSelection('Date Added (Oldest First)')}>
          Date Added (Oldest First)
        </MenuItem>
        <MenuItem onClick={() => handleSelection('Date Added (Newest First)')}>
          Date Added (Newest First)
        </MenuItem>
      </>
    )
  }

  return (
    <div style={divStyle}>
      <Button
        sx={{ color: '#3A1605' }}
        onClick={handleClick}
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open}
      >
        Sort By: {sortBy}
        <SwapHorizIcon sx={{ width: 32, height: 32 }} />
      </Button>
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
        {menu()}
      </Menu>
    </div>
  )
}
