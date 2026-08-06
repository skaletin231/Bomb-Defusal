import { useQuery } from '@apollo/client/react'
import { Button, Card, CardContent } from '@mui/material'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GET_ALL_DECKS } from '../queries'
import CreateGameDialogue from './CreateGameDialogue'
import DecksDropdown from './DeckDropdowns'

const DecksScreen = () => {
  const [id, setID] = useState(null)
  const deckResults = useQuery(GET_ALL_DECKS)

  if (deckResults.loading) return <div>LOADING...</div>

  const decks = deckResults.data.getAllDecks

  console.log(decks[0])

  return (
    <>
      <h1>Start Game</h1>
      {decks.map((deck, i) => (
        <Card key={i}>
          <CardContent>
            <DecksDropdown deck={deck} key={deck.name} />
            <Button variant='contained' onClick={() => setID(deck.id)}>
              {' '}
              Use Deck
            </Button>
          </CardContent>
        </Card>
      ))}
      <Button component={Link} to='/'>
        Go Back
      </Button>
      <CreateGameDialogue id={id} setID={setID} />
    </>
  )
}

export default DecksScreen
