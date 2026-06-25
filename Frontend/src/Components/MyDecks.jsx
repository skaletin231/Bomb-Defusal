import DecksDropdown from './DeckDropdowns'
import { useQuery } from '@apollo/client/react'
import { GET_MY_DECKS } from '../queries'
import {
  Button,
  Box,
  Stack,
  Paper,
  Typography,
  TextField,
  Card,
  CardContent,
} from '@mui/material'
import { useState } from 'react'
import MakeDeckScreen from './MakeDeckScreen'

const MyDecks = ({ tryCreateGame, setScreen }) => {
  const [makeNewDeck, setMakeNewDeck] = useState(false)
  const [deckToUpdate, setDeckToUpdate] = useState(null)
  const deckResults = useQuery(GET_MY_DECKS)

  if (deckResults.loading) return <div>LOADING...</div>
  console.log(deckResults)

  const decks = deckResults.data.getMyDecks

  if (makeNewDeck) {
    return <MakeDeckScreen setMakeNewDeck={setMakeNewDeck} />
  }

  if (deckToUpdate) {
    return (
      <MakeDeckScreen
        setMakeNewDeck={setMakeNewDeck}
        startingDeck={deckToUpdate}
        setDeckToUpdate={setDeckToUpdate}
      />
    )
  }

  return (
    <>
      {decks.map((deck) => (
        <Card key={deck.name} sx={{ marginTop: '1rem' }}>
          <CardContent>
            <DecksDropdown
              deck={deck}
              tryCreateGame={tryCreateGame}
              isDeckCreation={true}
            />
            <Button variant='contained' onClick={() => setDeckToUpdate(deck)}>
              {' '}
              Update Deck
            </Button>
          </CardContent>
        </Card>
      ))}
      <Button onClick={() => setMakeNewDeck(true)}>Make New Deck</Button>

      <Button onClick={() => setScreen('')}>Go Back</Button>
    </>
  )
}

export default MyDecks
