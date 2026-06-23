//import { decks } from '../../db'
import DecksDropdown from './DeckDropdowns'
import { useQuery } from '@apollo/client/react'
import { GET_MY_DECKS } from '../queries'
import { Button } from '@mui/material'

const DecksScreen = ({ tryCreateGame, setScreen }) => {
  const myDeckResults = useQuery(GET_MY_DECKS)

  if (myDeckResults.loading) return <div>LOADING...</div>

  const decks = myDeckResults.data.getMyDecks

  return (
    <>
      {decks.map((deck) => (
        <DecksDropdown
          deck={deck}
          key={deck.name}
          tryCreateGame={tryCreateGame}
        />
      ))}
      <Button onClick={() => setScreen('')}>Go Back</Button>
    </>
  )
}

export default DecksScreen
