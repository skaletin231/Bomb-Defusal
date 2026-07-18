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

const GameCard = ({ spot, selectedCard, setSelectedCard }) => {
  const buttonStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '10%',
    p: '0px',
    color: 'inherit',
  }

  const makeMove = () => {
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

  return (
    <Card className={`parentStyle ${classToUse}`} variant='outlined'>
      <Button sx={buttonStyle} onClick={() => makeMove()}>
        <CardContent sx={style}>
          <Typography>{spot.word}</Typography>
        </CardContent>
      </Button>
    </Card>
  )
}

export default GameCard
