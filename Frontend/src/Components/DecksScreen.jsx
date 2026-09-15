import { useQuery } from '@apollo/client/react'
import {
  Button,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { GET_ALL_DECKS } from '../queries'
import DeckObject from './DeckObject'
import Pagination from '@mui/material/Pagination'
import StartGameDrawer from './Popups/StartGameDrawer'
import ListOfMyDecks from './ListOfMyDecks'
import Divider from '@mui/material/Divider'

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
  const decksPerPage = 8
  const [currentPagePublic, setCurrentPagePublic] = useState(1)
  const [currentDeckTab, setCurrentDeckTab] = useState('mine')
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()

  //use to indicate the left most deck recorded for pagination purposes
  const [leftPublic, setLeftPublic] = useState(0)

  const deckResults = useQuery(GET_ALL_DECKS)

  if (deckResults.loading) return <div>LOADING...</div>

  const myDecks = deckResults.data.getAllDecks.myDecks
  const publicDecks = deckResults.data.getAllDecks.publicDecks

  const deckURL = searchParams.get('deck')

  let canEdit = false
  let deckToDisplay = myDecks.find((x) => x.id === deckURL)
  if (deckToDisplay === undefined) {
    deckToDisplay = publicDecks.find((x) => x.id === deckURL) ?? null
  } else canEdit = true

  const boxSX = {
    gridTemplateColumns: 'repeat(auto-fill, 266px)',
    display: 'grid',
    justifyContent: 'space-between',
    height: 'auto',
    flexFlow: 'wrap',
    gap: '10px',
  }

  const openRightPanel = (deck) => {
    if (deck === null) navigate('/startgame', { replace: true })
    else navigate(`?deck=${deck.id}`, { replace: true })
  }

  const handlePageChangePublic = (event, value) => {
    setCurrentPagePublic(value)
    setLeftPublic(decksPerPage * (value - 1))
  }

  const visibleDecksPublic = publicDecks.slice(
    leftPublic,
    leftPublic + decksPerPage,
  )

  const paginationCountPublic =
    Math.trunc(publicDecks.length / decksPerPage) + 1

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

  const myDecksPage = () => {
    if (myDecks.length === 0)
      return <Typography className='bigText'>No Decks Found ... </Typography>

    return (
      <Box sx={boxSX}>
        <ListOfMyDecks setSelectedDeck={openRightPanel} />
      </Box>
    )
  }
  const communityDecksPage = () => {
    if (visibleDecksPublic.length === 0)
      return <Typography className='bigText'>No Decks Found ... </Typography>
    return (
      <>
        <Box sx={boxSX}>
          {visibleDecksPublic.map((deck, i) => (
            <DeckObject
              key={i}
              deck={deck}
              type={'public'}
              setSelectedDeck={openRightPanel}
            />
          ))}
        </Box>

        {paginationCountPublic > 1 && (
          <Pagination
            page={currentPagePublic}
            count={paginationCountPublic}
            variant='outlined'
            onChange={handlePageChangePublic}
          />
        )}
      </>
    )
  }

  return (
    <Box className='flexColumn content' sx={{ gap: '20px' }}>
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
        canEdit={canEdit}
      />
    </Box>
  )
}

export default DecksScreen
