import { decks } from '../../db'
import DecksDropdown from './DeckDropdowns'

const DecksScreen = ({ tryCreateGame }) => {
  return (
    <>
      {decks.map((deck) => (
        <DecksDropdown
          deck={deck}
          key={deck.name}
          tryCreateGame={tryCreateGame}
        />
      ))}
    </>
  )
}

export default DecksScreen
