import { gql } from '@apollo/client'
import { useMutation, useQuery } from '@apollo/client/react'
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { GET_MY_DECK, GET_MY_DECKS, MAKE_DECK, UPDATE_DECK } from '../queries'

const formStyle = {
  justifyContent: 'flex-start',
  flexDirection: 'row',
  display: 'flex',
}

const center = {
  justifyContent: 'center',
  display: 'flex',
}

const maxCardSize = 15

const MakeDeckScreen = () => {
  const { id: deckID } = useParams()
  const editMode = deckID !== undefined
  const [cardToAdd, setCardToAdd] = useState('')
  const [deckName, setDeckName] = useState('')
  const [allCards, setAllCards] = useState([])
  const [isPublicDeck, setIsPublicDeck] = useState(false)

  const deckResults = useQuery(GET_MY_DECK, {
    variables: { deckID: deckID },
    skip: !deckID,
  })

  const [makeDeck] = useMutation(MAKE_DECK, {
    refetchQueries: [GET_MY_DECKS],
    update(cache, { data }) {
      console.log(data.makeDeck)
      const newRef = cache.writeFragment({
        data: data.makeDeck,
        fragment: gql`
          fragment Deck on Deck {
            id
            owner {
              __typename
              username
              id
            }
            name
            public
            cards
          }
        `,
      })

      //if i ever add pagination, this may not be a good thing to do anymore
      cache.modify({
        fields: {
          getMyDecks(existing = []) {
            return [...existing, newRef]
          },
          getAllDecks(existing = []) {
            return [...existing, newRef]
          },
        },
      })
    },
  })

  const [updateDeck] = useMutation(UPDATE_DECK, {
    update(cache, { data }) {
      cache.modify({
        id: cache.identify({
          __typename: 'Deck',
          id: data.updateDeck.id,
        }),
        fields: {
          name: () => data.updateDeck.name,
          public: () => data.updateDeck.public,
          cards: () => data.updateDeck.cards,
        },
      })
    },
  })

  useEffect(() => {
    if (deckResults.data?.getMyDeck) {
      const deck = deckResults.data.getMyDeck
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDeckName(deck.name)
      setAllCards(deck.cards)
      setIsPublicDeck(deck.public)
    }
  }, [deckResults.data])

  if (deckResults.loading) return <div>loading...</div>

  if (deckResults.error) {
    return <div>{deckResults.error.message}</div>
  }

  if (editMode && !deckResults.data?.getMyDeck)
    return <div>Issue Loading Deck</div>

  const tryVerifyDeckChanges = async (event) => {
    event.preventDefault()

    if (editMode) {
      console.log('updateDeck: ', {
        deckID: deckResults.data?.getMyDeck.id,
        name: deckName,
        public: isPublicDeck,
        cards: allCards,
      })
      await updateDeck({
        variables: {
          deckID: deckResults.data?.getMyDeck.id,
          name: deckName,
          public: isPublicDeck,
          cards: allCards,
        },
      })
    } else {
      console.log('makeDeck')
      await makeDeck({
        variables: {
          name: deckName,
          public: isPublicDeck,
          cards: allCards,
        },
      })
    }
  }

  function capitalizeWords(str) {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const tryAddCardsToList = (event) => {
    event.preventDefault()
    const formattedWord = capitalizeWords(cardToAdd.trim())
    if (
      formattedWord !== '' &&
      formattedWord.length <= maxCardSize &&
      !allCards.includes(formattedWord)
    ) {
      setAllCards(allCards.concat(formattedWord))
    }
    setCardToAdd('')
    return
  }

  const removeCard = (index) => {
    setAllCards(allCards.filter((card, i) => i !== index))
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
        <div
          className={'cardsHolder'}
          style={{ height: '30rem', overflow: 'hidden' }}
        >
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
                    height: '4rem',
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
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
                  <Typography
                    sx={{
                      lineHeight: '1.2',
                      textAlign: 'center',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {card}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </div>
        <Box sx={{ backgroundColor: '#e9e9e9' }}>
          <div style={{ textAlign: 'center' }}>
            <Button
              variant='outlined'
              onClick={() => setIsPublicDeck(!isPublicDeck)}
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

            <Button variant='contained' onClick={tryVerifyDeckChanges}>
              {editMode && 'Update Deck'}
              {!editMode && 'Create Deck'}
            </Button>
          </div>
        </Box>
      </div>

      <div style={{ textAlign: 'center', marginTop: '5rem' }}>
        <Button variant='contained' component={Link} to={'/mydecks'}>
          Back To Decks
        </Button>
      </div>
    </div>
  )
}

export default MakeDeckScreen
