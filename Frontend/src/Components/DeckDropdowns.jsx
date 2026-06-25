import { useState } from 'react'
import { Button, Card, CardContent, Box } from '@mui/material'

const DecksDropdown = ({ deck, tryCreateGame }) => {
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

  const createGame = () => {
    tryCreateGame(deck)
  }

  return (
    <div>
      {/* <Card>
        <CardContent> */}
      {deck.name}
      {/* <Button
            style={{ marginLeft: '20px' }}
            variant='contained'
            onClick={createGame}
          >
            Use Deck
          </Button> */}
      <br />
      {isDropedDown && dropDownView()}
      <Button variant='contained' onClick={changeDropdown}>
        {isDropedDown && '˄'}
        {!isDropedDown && '˅'}
      </Button>
      {/* </CardContent>
      </Card> */}
    </div>
  )
}

export default DecksDropdown
