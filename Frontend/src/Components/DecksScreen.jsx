import { useLazyQuery, useQuery } from '@apollo/client/react'
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import Divider from '@mui/material/Divider'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { GET_ALL_DECKS, GET_MY_DECK, GET_ONE_DECK, ME } from '../queries'
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
  const snapshotTime = useRef(null)
  const [currentPagePublic, setCurrentPagePublic] = useState(1)
  const [currentPageFavorite, setCurrentPageFavorite] = useState(1)

  const [currentDeckTab, setCurrentDeckTab] = useState('mine')
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()
  const deckURL = searchParams.get('deck')

  const { data: meData } = useQuery(ME, {})

  const oneDeckResults = useQuery(GET_ONE_DECK, {
    variables: { deckID: deckURL },
    skip: !deckURL,
  })

  const [getDecks, { isLoading: decksIsLoading, data: decksData }] =
    useLazyQuery(GET_ALL_DECKS)

  useEffect(() => {
    getDecks({
      variables: {
        pageFavorite: 1,
        pagePublic: 1,
        pageSize: decksPerPage,
        snapshotTime: null,
      },
    }).then((result) => {
      snapshotTime.current = result.data.getAllDecks.snapshotTime
    })
  }, [getDecks])

  const loadDecks = (pageFavorite, pagePublic) => {
    getDecks({
      variables: {
        pageFavorite,
        pagePublic,
        pageSize: decksPerPage,
        snapshotTime: snapshotTime.current,
      },
    })
  }

  if (meData.isLoading) return <LoadingScreen />
  const me = meData.me

  const publicDecks = decksData?.getAllDecks?.allDecks?.publicDecks ?? []
  const favoritedDecks = decksData?.getAllDecks?.allDecks?.favoritedDecks ?? []

  const favoritedPageCount =
    decksData?.getAllDecks?.pageInfo?.totalPagesFavorite ?? 1
  const publicPageCount =
    decksData?.getAllDecks?.pageInfo?.totalPagesPublic ?? 1

  let editButtonDisplays = false

  let deckToDisplay = oneDeckResults.data?.getOneDeck?.deck ?? null
  if (deckToDisplay) editButtonDisplays = deckToDisplay?.id === me?.id

  const openRightPanel = (deck) => {
    if (deck === null) navigate('/startgame', { replace: true })
    else navigate(`?deck=${deck.id}`, { replace: true })
  }

  const handlePageChangePublic = (event, value) => {
    setCurrentPagePublic(value)
    loadDecks(currentPageFavorite, value)
  }

  const handlePageChangeFavorite = (event, value) => {
    setCurrentPageFavorite(value)
    loadDecks(value, currentPagePublic)
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
    if (decksIsLoading)
      return (
        <Box className='tableLayoutDeck'>
          <LoadingScreen />
        </Box>
      )
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
    if (decksIsLoading)
      return (
        <Box className='tableLayoutDeck'>
          <LoadingScreen />
        </Box>
      )
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
              isFavorited={deck.favorited}
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
