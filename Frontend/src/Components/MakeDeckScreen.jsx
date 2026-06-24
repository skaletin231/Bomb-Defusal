import { useMutation } from '@apollo/client/react'
import { MAKE_DECK, GET_MY_DECKS, UPDATE_DECK } from '../queries'
import { useState } from 'react'
import {
  Button,
  Box,
  Stack,
  Paper,
  Typography,
  TextField,
  CardContent,
  Card,
  IconButton,
} from '@mui/material'

const formStyle = {
  justifyContent: 'flex-start',
  flexDirection: 'row',
  display: 'flex',
}

const center = {
  justifyContent: 'center',
  display: 'flex',
}

//this can possible take an ID for reference.
//it will use that id to update if it does
const MakeDeckScreen = ({ setMakeNewDeck, startingDeck, setDeckToUpdate }) => {
  //console.log(startingDeck)
  const [cardToAdd, setCardToAdd] = useState('')
  const [deckName, setDeckName] = useState(
    startingDeck ? startingDeck.name : '',
  )
  const [allCards, setAllCards] = useState(
    startingDeck ? startingDeck.cards : [],
  )
  const [isPublicDeck, setIsPublickDeck] = useState(
    startingDeck ? startingDeck.public : false,
  )

  const [makeDeck] = useMutation(MAKE_DECK, {
    refetchQueries: [GET_MY_DECKS],
  })

  const [updateDeck] = useMutation(UPDATE_DECK, {
    refetchQueries: [GET_MY_DECKS],
  })

  const tryVerifyDeckChanges = async (event) => {
    event.preventDefault()

    if (startingDeck) {
      await updateDeck({
        variables: {
          deckID: startingDeck.id,
          name: deckName,
          public: isPublicDeck,
          cards: allCards,
        },
      })
      setDeckToUpdate(null)
    } else {
      await makeDeck({
        variables: {
          name: deckName,
          public: isPublicDeck,
          cards: allCards,
        },
      })
      setMakeNewDeck(false)
    }

    // if (results.data !== null) {
    //   console.log('deck was made')
    //   console.log(results.data)
    // }
  }

  const tryAddCardsToList = (event) => {
    event.preventDefault()
    if (cardToAdd === '' || !allCards.includes(cardToAdd)) {
      setAllCards(allCards.concat(cardToAdd))
    }
    setCardToAdd('')
    //console.log(allCards)
    return
  }

  const goBack = () => {
    setMakeNewDeck(false)
    setDeckToUpdate(null)
  }

  const removeCard = (index) => {
    setAllCards(allCards.filter((card, i) => i !== index))
    console.log(index)
  }

  return (
    <div style={{ width: '90%', justifySelf: 'center' }}>
      <div style={{ backgroundColor: '#d6d6d6' }}>
        <Box
          className={'nameHolder'}
          sx={[center, { backgroundColor: '#e9e9e9' }]}
        >
          <TextField
            sx={[{ margin: '.4rem .1rem' }]}
            variant='outlined'
            label='Name'
            value={deckName}
            onChange={({ target }) => setDeckName(target.value)}
          ></TextField>
        </Box>
        <div className={'cardsHolder'} style={{ height: '30rem' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(3, 1fr)',
                sm: 'repeat(5, 1fr)',
                md: 'repeat(7, 1fr)',
              },
              gap: 2,
              overflowY: 'auto',
              maxHeight: '30rem',
              padding: '.2rem',
            }}
          >
            {allCards.map((card, i) => (
              <Card key={i}>
                <CardContent
                  sx={{
                    position: 'relative',
                    padding: '16px',
                    '&:last-child': {
                      padding: '16px',
                    },
                  }}
                >
                  <IconButton
                    sx={{
                      position: 'absolute',
                      right: '.1rem',
                      top: '.1rem',
                      margin: '0',
                      padding: '0',
                      fontSize: '1.1rem',
                    }}
                    onClick={() => removeCard(i)}
                  >
                    X
                  </IconButton>
                  <Typography sx={{ textAlign: 'center' }}>{card}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </div>
        <Box sx={{ backgroundColor: '#e9e9e9' }}>
          <div style={{ textAlign: 'center' }}>
            <Button
              variant='outlined'
              onClick={() => setIsPublickDeck(!isPublicDeck)}
              sx={{ marginLeft: 'auto', margin: '.4rem' }}
            >
              {isPublicDeck && 'Public'}
              {!isPublicDeck && 'Private'}
            </Button>
          </div>

          <div style={center}>
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

            <Button onClick={tryVerifyDeckChanges}>
              {startingDeck && 'Update Deck'}
              {!startingDeck && 'Create Deck'}
            </Button>
          </div>
        </Box>
      </div>

      <div style={{ textAlign: 'center', marginTop: '5rem' }}>
        <Button variant='contained' onClick={goBack}>
          Go Back
        </Button>
      </div>
    </div>
  )
}

export default MakeDeckScreen
