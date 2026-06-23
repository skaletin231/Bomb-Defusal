import { useMutation, useQuery } from '@apollo/client/react'
import { MAKE_DECK } from '../queries'
import { useState } from 'react'
import { Button, Box, Stack, Paper, Typography, TextField } from '@mui/material'

const formStyle = {
  justifyContent: 'flex-start',
  flexDirection: 'row',
  display: 'flex',
}
//this can possible take an ID for reference.
//it will use that id to update if it does
const MakeDeckScreen = ({ setScreen }) => {
  const [cardToAdd, setCardToAdd] = useState('')
  const [deckName, setDeckName] = useState('')
  const [allCards, setAllCards] = useState([])
  const [isPublicDeck, setIsPublickDeck] = useState(false)

  const [makeDeck] = useMutation(MAKE_DECK)

  const tryMakeDeck = async (event) => {
    event.preventDefault()
    const results = await makeDeck({
      variables: {
        name: deckName,
        public: isPublicDeck,
        cards: allCards,
      },
    })

    if (results.data !== null) {
      console.log('deck was made')
      console.log(results.data)
    }
  }

  const tryAddCardsToList = (event) => {
    event.preventDefault()
    if (cardToAdd === '' || !allCards.includes(cardToAdd)) {
      setAllCards(allCards.concat(cardToAdd))
    }
    setCardToAdd('')
    console.log(allCards)
    return
  }

  return (
    <div>
      <div className={'nameHolder'}>
        <TextField
          sx={{ margin: '.4rem .1rem' }}
          variant='outlined'
          label='Name'
          onChange={({ target }) => setDeckName(target.value)}
        ></TextField>
      </div>
      <div className={'cardsHolder'}>
        {allCards.map((card, i) => (
          <p key={i}>{card}</p>
        ))}
      </div>
      <div className={'addCardHolder'}>
        <form onSubmit={tryAddCardsToList} style={formStyle}>
          <div>
            <TextField
              sx={{ margin: '.4rem .1rem' }}
              variant='outlined'
              label='Card'
              value={cardToAdd}
              onChange={({ target }) => setCardToAdd(target.value)}
            ></TextField>
          </div>

          <Button
            type='submit'
            sx={{ marginLeft: 'auto', margin: '.4rem' }}
            variant='contained'
          >
            Add Card
          </Button>
        </form>
      </div>
      <Button
        onClick={() => setIsPublickDeck(!isPublicDeck)}
        sx={{ marginLeft: 'auto', margin: '.4rem' }}
      >
        {isPublicDeck.toString()}
      </Button>
      <Button onClick={tryMakeDeck}>Create Deck</Button>
      <Button onClick={() => setScreen('')}>Go Back</Button>
    </div>
  )
}

export default MakeDeckScreen
