import { useMutation, useQuery } from '@apollo/client/react'
import { Button, Card, CardContent, Box, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { GET_ALL_DECKS, GET_MY_DECKS, COPY_DECK } from '../queries'
import DeckObject from './DeckObject'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import IconButton from '@mui/material/IconButton'
import { gql } from '@apollo/client'

const MyDecks = () => {
  const deckResults = useQuery(GET_MY_DECKS)

  const [copyDeck] = useMutation(COPY_DECK, {
    update(cache, { data }) {
      console.log(data.copyDeck)
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

  if (deckResults.loading) return <div>LOADING...</div>

  const decks = deckResults.data.getMyDecks

  const boxSX = {
    display: 'flex',
    gap: '10px',
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

  const tryMakeDeck = async (deckID) => {
    await copyDeck({
      variables: {
        deckID: deckID,
      },
    })
  }

  return (
    <Box>
      <h1>My Decks</h1>

      <Box sx={boxSX}>
        <Button sx={buttonSX} component={Link} to={'/mydecks/new'}>
          <Box sx={innerboxSX}>
            <AddOutlinedIcon sx={{ fontSize: '2.5rem' }} />
            <Typography sx={textSX}>Add New Deck</Typography>
          </Box>
        </Button>

        {decks.map((deck, i) => (
          <DeckObject
            key={i}
            deck={deck}
            type={'mine'}
            tryMakeDeck={tryMakeDeck}
          />
        ))}
      </Box>
    </Box>
  )
}

export default MyDecks
