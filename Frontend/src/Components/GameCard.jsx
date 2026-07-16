import { Button, Card, CardContent, Typography } from '@mui/material'

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

const classesForColors = {
  wire: 'wireColor',
  bomb: 'bombColor',
  dud: 'dudColor',
  null: 'notRevealedColor',
}
const classesForReveals = {
  wire: 'wireRevealedColor',
  bomb: 'bombRevealedColor',
  dud: 'dudRevealedColor',
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
    display: 'flex',
    justifyContent: 'center',
    borderRadius: '10%',
    borderWidth: '4px',
  }

  const buttonStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '10%',
    p: '0px',
    color: 'inherit',
  }

  const makeMove = () => {
    console.log('click')
    if (spot.typeRevealed.myType !== null) return

    if (selectedCard?.word === spot.word) {
      setSelectedCard(null)
      return
    }

    setSelectedCard(spot)
  }

  const classToUse =
    selectedCard?.word === spot.word
      ? `cardSelected ${classesForColors[spot.typeRevealed.myType]}`
      : classesForColors[spot.typeRevealed.myType]

  console.log(classToUse)

  return (
    <Card className={classToUse} sx={parentStyle} variant='outlined'>
      <Button sx={buttonStyle} onClick={() => makeMove()}>
        <CardContent sx={style}>
          <Typography>{spot.word}</Typography>
        </CardContent>
      </Button>
    </Card>
  )
}

export default GameCard
