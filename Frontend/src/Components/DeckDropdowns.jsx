import { Box, Button } from '@mui/material'
import { useState } from 'react'

const DecksDropdown = ({ deck }) => {
  const [isDropedDown, setIsDropedDown] = useState(false)

  const changeDropdown = () => {
    setIsDropedDown(!isDropedDown)
  }

  const dropDownView = () => {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 2,
        }}
      >
        {deck.cards.map((word, i) => (
          <div key={i}>{word}</div>
        ))}
      </Box>
    )
  }

  return (
    <div>
      {deck.name}
      <br />
      {isDropedDown && dropDownView()}
      <Button variant='contained' onClick={changeDropdown}>
        {isDropedDown && '˄'}
        {!isDropedDown && '˅'}
      </Button>
    </div>
  )
}

export default DecksDropdown
