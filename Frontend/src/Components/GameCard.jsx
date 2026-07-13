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

const colorPicker = {
  bomb: 'gray',
  dud: 'yellow',
  wire: 'green',
}

const colorPickerPicked = {
  bomb: 'rgb(180, 180, 180)',
  dud: 'rgb(255,210,0)',
  wire: 'rgb(0, 190, 0)',
}

const GameCard = ({ spot, selectedCard, setSelectedCard }) => {
  const parentStyle = {
    aspectRatio: '2/1.4',
    backgroundColor:
      spot.typeRevealed.myType === null
        ? 'white'
        : colorPicker[spot.typeRevealed.myType],
    borderWidth: 2,
    borderColor: selectedCard?.word === spot.word ? 'green' : 'black',
    borderRadius: '40px',
  }

  const buttonStyle = {
    color: 'black',
    width: '100%',
    height: '100%',
    borderWidth: spot.typeRevealed.theirType === null ? '0' : '.4em',
    borderRadius: '38px',
    borderStyle: 'solid',
    borderColor:
      spot.typeRevealed.theirType === null
        ? 'transparent'
        : colorPickerPicked[spot.typeRevealed.theirType],
    p: '0px',
  }

  const makeMove = () => {
    if (spot.typeRevealed.myType !== null) return

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
