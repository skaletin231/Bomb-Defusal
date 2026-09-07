import { gql } from '@apollo/client'
import { useMutation, useQuery } from '@apollo/client/react'
import '@fontsource/suwannaphum'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { Box, Button, Typography } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { GET_MY_DECKS, MAKE_DECK } from '../queries'
import NotificationPopup from './Popups/NotificationPopup'
import ListOfMyDecks from './ListOfMyDecks'

const MyDecks = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const deckResults = useQuery(GET_MY_DECKS)

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
    await makeDeck()
  }

  const goToDeckPage = (deck) => {
    navigate(`/decks/${deck.id}`, {
      state: {
        from: location.pathname,
      },
    })
  }

  return (
    <Box className='content'>
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

        <ListOfMyDecks setSelectedDeck={goToDeckPage} />
      </Box>
    </Box>
  )
}

export default MyDecks
