import DecksDropdown from './DeckDropdowns'
import { useMutation, useQuery } from '@apollo/client/react'
import { GET_ALL_DECKS, START_GAME, NEW_PLAYER_JOINED } from '../queries'
import { Button, Card, CardContent } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

const DecksScreen = () => {
  const deckResults = useQuery(GET_ALL_DECKS)
  const navigate = useNavigate()

  const [startGame] = useMutation(START_GAME)

  if (deckResults.loading) return <div>LOADING...</div>

  const decks = deckResults.data.getAllDecks

  const tryCreateGame = async (deck) => {
    event.preventDefault()
    console.log('tryCreateGame', deck)
    const result = await startGame({
      variables: {
        deckID: deck.id,
      },
    })

    if (result.data === null) return
    console.log(result.data)
    if (result.data.startGame) navigate(`/playing/${result.data.startGame}`)
  }

  return (
    <>
      <h1>Start Game</h1>
      {decks.map((deck, i) => (
        <Card key={i}>
          <CardContent>
            <DecksDropdown deck={deck} key={deck.name} />
            <Button variant='contained' onClick={() => tryCreateGame(deck)}>
              {' '}
              Use Deck
            </Button>
          </CardContent>
        </Card>
      ))}
      <Button component={Link} to='/'>
        Go Back
      </Button>
    </>
  )
}

export default DecksScreen
