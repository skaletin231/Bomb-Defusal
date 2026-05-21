import { Button, Card, CardContent } from '@mui/material'

const style = {
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  p: 0,
  '&:last-child': {
    pb: 0,
  },
}

const buttonStyle = {
  color: 'black',
  width: '100%',
  height: '100%',
}

const colorPicker = {
  bomb: 'gray',
  dud: 'yellow',
  wire: 'green',
}

const GameCard = ({ spot, selectedCard, setSelectedCard }) => {
  const parentStyle = {
    aspectRatio: '1/1',
    backgroundColor:
      spot.typeRevealed === null ? 'white' : colorPicker[spot.typeRevealed],
    display: 'flex',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: selectedCard?.word === spot.word ? 'green' : 'black',
  }

  const makeMove = () => {
    if (spot.revealed) return

    if (selectedCard?.word === spot.word) {
      setSelectedCard(null)
      return
    }

    setSelectedCard(spot)
  }

  return (
    <Card sx={parentStyle} variant='outlined'>
      <Button sx={buttonStyle} onClick={() => makeMove()}>
        <CardContent sx={style}>{spot.word}</CardContent>
      </Button>
    </Card>
  )
}

export default GameCard
