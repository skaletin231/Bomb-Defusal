import { useQuery } from '@apollo/client/react'
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import Divider from '@mui/material/Divider'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { GET_ALL_DECKS, GET_MY_DECK } from '../queries'
import DeckObject from './DeckObject'
import ListOfMyDecks from './ListOfMyDecks'
import StartGameDrawer from './Popups/StartGameDrawer'
import LoadingScreen from './LoadingScreen'
import PaginationComponent from './HelperTools/PaginationComponent'

const toggleButtonSX = {
  borderStyle: 'none',
  color: 'black',
  textTransform: 'none',
  fontSize: '1.2rem',
  '&&': {
    borderRadius: '10px',
  },
  '&.Mui-selected, &:hover, &.Mui-selected:hover': {
    backgroundColor: '#9F4B24',
    color: 'white',
  },
}

const DecksScreen = () => {
  const decksPerPage = 12
  const [snapshotTime, setSnapshotTime] = useState(null)
  const [currentPagePublic, setCurrentPagePublic] = useState(1)
  const [currentPageFavorite, setCurrentPageFavorite] = useState(1)

  const [currentDeckTab, setCurrentDeckTab] = useState('mine')
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()
  const deckURL = searchParams.get('deck')

  const myDeckResults = useQuery(GET_MY_DECK, {
    variables: { deckID: deckURL },
    skip: !deckURL,
  })

  const deckResults = useQuery(GET_ALL_DECKS, {
    variables: {
      pageFavorite: currentPageFavorite,
      pagePublic: currentPagePublic,
      pageSize: decksPerPage,
      snapshotTime: snapshotTime,
    },
    onCompleted: (data) => {
      setSnapshotTime(data.getAllDecks.pageInfo.snapshotTime)
    },
  })

  if (deckResults.loading || myDeckResults.loading) return <LoadingScreen />

  const publicDecks = deckResults.data.getAllDecks.allDecks.publicDecks
  const favoritedDecks =
    deckResults.data.getAllDecks.allDecks.favoritedDecks ?? []

  const favoritedPageCount =
    deckResults.data.getAllDecks.pageInfo.totalPagesFavorite
  const publicPageCount = deckResults.data.getAllDecks.pageInfo.totalPagesPublic

  let editButtonDisplays = false

  let deckToDisplay = myDeckResults.data?.getMyDeck
  if (deckToDisplay === undefined) {
    deckToDisplay = publicDecks.find((x) => x.id === deckURL) ?? null
  } else editButtonDisplays = true

  const openRightPanel = (deck) => {
    if (deck === null) navigate('/startgame', { replace: true })
    else navigate(`?deck=${deck.id}`, { replace: true })
  }

  const handlePageChangePublic = (event, value) => {
    setCurrentPagePublic(value)
  }

  const handlePageChangeFavorite = (event, value) => {
    setCurrentPageFavorite(value)
  }

  const handleDeckTab = (event, newAlignment) => {
    if (newAlignment !== null) {
      setCurrentDeckTab(newAlignment)
    }
  }

  const screenToggle = () => {
    return (
      <ToggleButtonGroup
        sx={{ gap: '15px' }}
        value={currentDeckTab}
        exclusive
        onChange={handleDeckTab}
        aria-label='deck tab'
      >
        <ToggleButton value='mine' aria-label='mine' sx={toggleButtonSX}>
          My Decks
        </ToggleButton>
        <ToggleButton
          value='community'
          aria-label='community'
          sx={toggleButtonSX}
        >
          Community
        </ToggleButton>
      </ToggleButtonGroup>
    )
  }

  const myDecksObjects = () => {
    return <ListOfMyDecks setSelectedDeck={openRightPanel} decksPerPage={12} />
  }

  const favoriteDecksObjects = () => {
    if (favoritedDecks.length === 0) return null
    return (
      <>
        <Typography className='secondaryHeader'>My Saved Decks</Typography>
        <Box className='tableLayoutDeck'>
          {favoritedDecks.map((deck, i) => (
            <DeckObject
              key={i}
              deck={deck}
              type={'public'}
              setSelectedDeck={openRightPanel}
              isFavorited={favoritedDecks.some((x) => x.id === deck.id)}
            />
          ))}
        </Box>
        <PaginationComponent
          page={currentPageFavorite}
          count={favoritedPageCount}
          onChange={handlePageChangeFavorite}
        />
      </>
    )
  }

  const myDecksPage = () => {
    return (
      <>
        {myDecksObjects()}
        {favoriteDecksObjects()}
      </>
    )
  }
  const communityDecksPage = () => {
    if (publicDecks.length === 0)
      return <Typography className='bigText'>No Decks Found ... </Typography>
    return (
      <>
        <Box className='tableLayoutDeck'>
          {publicDecks.map((deck, i) => (
            <DeckObject
              key={i}
              deck={deck}
              type={'public'}
              setSelectedDeck={openRightPanel}
              isFavorited={favoritedDecks.some((x) => x.id === deck.id)}
            />
          ))}
        </Box>

        <PaginationComponent
          page={currentPagePublic}
          count={publicPageCount}
          onChange={handlePageChangePublic}
        />
      </>
    )
  }

  return (
    <Box className='flexColumn content' sx={{ gap: '20px', marginTop: '2vh' }}>
      <Typography className='mainHeader'>Choose a Deck</Typography>

      {screenToggle()}

      <Divider
        sx={{
          margin: '2rem 0',
        }}
      />

      {currentDeckTab === 'mine' && myDecksPage()}

      {currentDeckTab === 'community' && communityDecksPage()}

      <StartGameDrawer
        open={deckToDisplay !== null}
        setSelectedDeck={openRightPanel}
        selectedDeck={deckToDisplay}
        canEdit={editButtonDisplays}
      />
    </Box>
  )
}

export default DecksScreen
