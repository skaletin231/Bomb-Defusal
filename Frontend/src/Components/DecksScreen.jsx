import DecksDropdown from './DeckDropdowns'
import { useQuery } from '@apollo/client/react'
import { GET_ALL_DECKS } from '../queries'
import { Button, Card, CardContent } from '@mui/material'

const DecksScreen = ({ tryCreateGame, setScreen }) => {
  const deckResults = useQuery(GET_ALL_DECKS)

  if (deckResults.loading) return <div>LOADING...</div>

  const decks = deckResults.data.getAllDecks

  return (
    <>
      {decks.map((deck) => (
        <Card>
          <CardContent>
            <DecksDropdown
              deck={deck}
              key={deck.name}
              tryCreateGame={tryCreateGame}
            />
            <Button variant='contained' onClick={() => tryCreateGame(deck)}>
              {' '}
              Use Deck
            </Button>
          </CardContent>
        </Card>
      ))}
      <Button onClick={() => setScreen('')}>Go Back</Button>
    </>
  )
}

export default DecksScreen
