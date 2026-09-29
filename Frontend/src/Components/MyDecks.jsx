import { gql } from '@apollo/client'
import { useMutation, useQuery } from '@apollo/client/react'
import '@fontsource/suwannaphum'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { Box, Button, Divider, Typography } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { GET_ALL_DECKS, GET_MY_DECKS, MAKE_DECK } from '../queries'
import ListOfMyDecks from './ListOfMyDecks'
import LoadingScreen from './LoadingScreen'
import DeckObject from './DeckObject'
import PaginationComponent from './HelperTools/PaginationComponent'
import { useState } from 'react'

const MyDecks = () => {
  const decksPerPageFavorited = 12
  const [currentPageFavorited, setCurrentPageFavorited] = useState(1)

  const navigate = useNavigate()
  const location = useLocation()

  const deckResults = useQuery(GET_ALL_DECKS)

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
          getAllDecks(existingDeckRefs = []) {
            return {
              ...existingDeckRefs,
              myDecks: existingDeckRefs.myDecks.concat(newRef),
            }
          },
        },
      })

      navigate(`/mydecks/${data.makeDeck.id}`)
    },
  })

  if (deckResults.loading) return <LoadingScreen />
  const favoritedDecks = deckResults.data.getAllDecks.favoritedDecks ?? []

  const currentLeftItem = (currentPageFavorited - 1) * decksPerPageFavorited
  const paginationDecksFavorited = favoritedDecks.slice(
    currentLeftItem,
    currentLeftItem + decksPerPageFavorited,
  )

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

  const handlePageChange = (event, value) => {
    setCurrentPageFavorited(value)
  }

  return (
    <Box className='content flexColumn' sx={{ gap: '20px' }}>
      <Typography className='mainHeader'>My Decks</Typography>
      <Divider
        sx={{
          margin: '2rem 0',
        }}
      />

      <ListOfMyDecks setSelectedDeck={goToDeckPage}>
        <Button sx={buttonSX} onClick={tryMakeDeck}>
          <Box sx={innerboxSX}>
            <AddOutlinedIcon sx={{ fontSize: '2.5rem' }} />
            <Typography sx={textSX}>Add New Deck</Typography>
          </Box>
        </Button>
      </ListOfMyDecks>
      <Divider
        sx={{
          margin: '2rem 0',
        }}
      />
      <Typography
        className='secondaryHeader'
        sx={{ '&&': { fontSize: '2.5rem' } }}
      >
        My Saved Decks
      </Typography>

      <Box
        sx={{
          gap: '10px',
          justifyContent: 'center',
          gridTemplateColumns: 'repeat(auto-fit, calc(15rem + 26px))',
          display: 'grid',
        }}
      >
        {paginationDecksFavorited.map((deck, i) => (
          <DeckObject
            key={i}
            deck={deck}
            type={'public'}
            setSelectedDeck={goToDeckPage}
            isFavorited={favoritedDecks.some((x) => x.id === deck.id)}
          />
        ))}
      </Box>

      <PaginationComponent
        countPerPage={decksPerPageFavorited}
        page={currentPageFavorited}
        count={favoritedDecks.length}
        onChange={handlePageChange}
      />
    </Box>
  )
}

export default MyDecks
