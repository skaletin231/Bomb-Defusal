import { gql } from '@apollo/client'
import { useMutation, useQuery } from '@apollo/client/react'
import '@fontsource/suwannaphum'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { Box, Button, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COPY_DECK, GET_MY_DECKS, MAKE_DECK, REMOVE_DECK } from '../queries'
import DeckObject from './DeckObject'
import ConfirmDeleteDialogue from './Popups/ConfrimDeleteDialogue'

const MyDecks = () => {
  const navigate = useNavigate()

  const [selectedDeck, setSelectedDeck] = useState(null)
  const deckResults = useQuery(GET_MY_DECKS)

  const [copyDeck] = useMutation(COPY_DECK, {
    update(cache, { data }) {
      const newRef = cache.writeFragment({
        data: data.copyDeck,
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

  const [removeDeck] = useMutation(REMOVE_DECK, {
    update: (cache, response) => {
      cache.modify({
        fields: {
          getMyDecks(existingDeckRefs = [], { readField }) {
            return existingDeckRefs.filter(
              (deckRef) =>
                readField('id', deckRef) !== response.data.removeDeck,
            )
          },
          getAllDecks(existingDeckRefs = [], { readField }) {
            return existingDeckRefs.filter(
              (deckRef) =>
                readField('id', deckRef) !== response.data.removeDeck,
            )
          },
        },
      })
    },
    onError: (error) => {
      console.log(error.message)
    },
  })

  const [makeDeck] = useMutation(MAKE_DECK, {
    refetchQueries: [GET_MY_DECKS],
    update(cache, { data }) {
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

      navigate(`/mydecks/${data.makeDeck.id}`)
    },
  })

  if (deckResults.loading) return <div>LOADING...</div>

  const decks = deckResults.data.getMyDecks

  const boxSX = {
    display: 'flex',
    gap: '10px',
    flexFlow: 'wrap',
  }

  const innerboxSX = {
    height: '100%',
    width: '100%',
    display: 'flex',
    position: 'relative',
    background: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  }

  const buttonSX = {
    width: '15rem',
    height: '6.5rem',
    padding: '10px',
    borderRadius: '5%',
    borderStyle: 'dashed',
    borderWidth: '3px',
    borderColor: '#84582e',
    color: '#84582e',
    boxSizing: 'content-box',
    '&:hover': {
      borderColor: '#9F4B24',
      color: '#9F4B24',
    },
  }

  const textSX = {
    fontSize: '1.3rem',
  }

  const tryMakeDeck = async () => {
    await makeDeck({
      variables: {
        name: 'New Deck',
        public: false,
        cards: [],
      },
    })
  }

  const tryMakeCopy = async (deckID) => {
    await copyDeck({
      variables: {
        deckID: deckID,
      },
    })
  }

  const tryRemoveDeck = async () => {
    await removeDeck({
      variables: {
        deckID: selectedDeck,
      },
    })
    setSelectedDeck(null)
  }

  return (
    <Box>
      <Typography
        sx={{ fontSize: '2rem', margin: '10px 0px', fontWeight: 'bold' }}
      >
        My Decks
      </Typography>

      <Box sx={boxSX}>
        <Button sx={buttonSX} onClick={tryMakeDeck}>
          <Box sx={innerboxSX}>
            <AddOutlinedIcon sx={{ fontSize: '2.5rem' }} />
            <Typography sx={textSX}>Add New Deck</Typography>
          </Box>
        </Button>

        {decks.map((deck, i) => (
          <DeckObject
            key={i}
            deck={deck}
            type={'edit'}
            tryMakeDeck={tryMakeCopy}
            setSelectedDeck={setSelectedDeck}
          />
        ))}
      </Box>
      <ConfirmDeleteDialogue
        open={selectedDeck !== null}
        onConfirm={tryRemoveDeck}
        setSelectedDeck={setSelectedDeck}
      />
    </Box>
  )
}

export default MyDecks
