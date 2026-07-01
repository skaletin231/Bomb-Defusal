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
import MakeDeckScreen from './MakeDeckScreen'
import { Link } from 'react-router-dom'

const MyDecks = () => {
  const deckResults = useQuery(GET_MY_DECKS)

  if (deckResults.loading) return <div>LOADING...</div>
  console.log(deckResults)

  const decks = deckResults.data.getMyDecks

  return (
    <>
      <h1>My Decks</h1>
      {decks.map((deck) => (
        <Card key={deck.name} sx={{ marginTop: '1rem' }}>
          <CardContent>
            <DecksDropdown deck={deck} isDeckCreation={true} />
            <Button
              variant='contained'
              component={Link}
              to={`/mydecks/${deck.id}`}
            >
              {' '}
              Update Deck
            </Button>
          </CardContent>
        </Card>
      ))}
      <Button component={Link} to={'/mydecks/new'}>
        Make New Deck
      </Button>
    </>
  )
}

export default MyDecks
