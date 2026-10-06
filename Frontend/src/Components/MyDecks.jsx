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
  const [snapshotTime, setSnapshotTime] = useState(null)

  const navigate = useNavigate()
  const location = useLocation()

  const deckResults = useQuery(GET_ALL_DECKS, {
    variables: {
      pageFavorite: currentPageFavorited,
      pagePublic: 1,
      pageSize: decksPerPageFavorited,
      snapshotTime: snapshotTime,
    },
    onCompleted: (data) => {
      setSnapshotTime(data.getAllDecks.pageInfo.snapshotTime)
    },
  })

  const [makeDeck] = useMutation(MAKE_DECK, {
    update(cache, { data }) {
      cache.evict({
        fieldName: 'getMyDecks',
      })
      cache.gc()

      navigate(`/mydecks/${data.makeDeck.id}`)
    },
  })

  const favoritedDecks =
    deckResults.data?.getAllDecks?.allDecks?.favoritedDecks ?? []
  const favoritedPageCount =
    deckResults.data?.getAllDecks?.pageInfo?.totalPagesFavorite

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

  const favoritedDecksObject = () => {
    if (deckResults.loading) {
      return <LoadingScreen />
    }

    return (
      <>
        {favoritedDecks.map((deck, i) => (
          <DeckObject
            key={i}
            deck={deck}
            type={'public'}
            setSelectedDeck={goToDeckPage}
            isFavorited={favoritedDecks.some((x) => x.id === deck.id)}
          />
        ))}
      </>
    )
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

      <Typography className='secondaryHeader'>My Saved Decks</Typography>

      <Box className='tableLayoutDeck'>{favoritedDecksObject()}</Box>

      <PaginationComponent
        page={currentPageFavorited}
        count={favoritedPageCount}
        onChange={handlePageChange}
      />
    </Box>
  )
}

export default MyDecks
