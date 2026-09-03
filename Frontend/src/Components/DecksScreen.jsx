import { useQuery } from '@apollo/client/react'
import { Button, Box, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { GET_ALL_DECKS } from '../queries'
import DeckObject from './DeckObject'
import Pagination from '@mui/material/Pagination'
import StartGameDrawer from './Popups/StartGameDrawer'
import ListOfMyDecks from './ListOfMyDecks'

const DecksScreen = () => {
  const decksPerPage = 8
  //const [currentPageMine, setCurrentPageMine] = useState(1)
  const [currentPagePublic, setCurrentPagePublic] = useState(1)
  const [currentDeckTab, setCurrentDeckTab] = useState('mine')
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()

  //use to indicate the left most deck recorded for pagination purposes
  //const [leftMine, setLeftMine] = useState(0)
  const [leftPublic, setLeftPublic] = useState(0)

  const deckResults = useQuery(GET_ALL_DECKS)

  if (deckResults.loading) return <div>LOADING...</div>

  const myDecks = deckResults.data.getAllDecks.myDecks
  const publicDecks = deckResults.data.getAllDecks.publicDecks

  const deckURL = searchParams.get('deck')
  const deckToDisplay =
    deckURL === null
      ? null
      : (myDecks.find((x) => x.id === deckURL) ??
        publicDecks.find((x) => x.id === deckURL) ??
        null)

  const boxSX = {
    height: 'auto',
    flexFlow: 'wrap',
    display: 'flex',
    gap: '10px',
  }

  const openRightPanel = (deck) => {
    if (deck === null) navigate('/startgame', { replace: true })
    else navigate(`?deck=${deck.id}`, { replace: true })
  }

  // const handlePageChangeMine = (event, value) => {
  //   setCurrentPageMine(value)
  //   setLeftMine(decksPerPage * (value - 1))
  // }

  const handlePageChangePublic = (event, value) => {
    setCurrentPagePublic(value)
    setLeftPublic(decksPerPage * (value - 1))
  }

  //const visibleDecksMine = myDecks.slice(leftMine, leftMine + decksPerPage)
  const visibleDecksPublic = publicDecks.slice(
    leftPublic,
    leftPublic + decksPerPage,
  )

  //const paginationCountMine = Math.trunc(myDecks.length / decksPerPage) + 1
  const paginationCountPublic =
    Math.trunc(publicDecks.length / decksPerPage) + 1

  const handleAddStyle = (event, newAlignment) => {
    if (newAlignment !== null) {
      setCurrentDeckTab(newAlignment)
    }
  }

  const screenToggle = () => {
    return (
      <ToggleButtonGroup
        // sx={styleToggleSX}
        value={currentDeckTab}
        exclusive
        onChange={handleAddStyle}
        aria-label='deck tab'
      >
        <ToggleButton
          // sx={styleToggleButtonSX}
          value='mine'
          aria-label='mine'
        >
          My Decks
        </ToggleButton>
        <ToggleButton
          // sx={styleToggleButtonSX}
          value='community'
          aria-label='community'
        >
          Community Decks
        </ToggleButton>
      </ToggleButtonGroup>
    )
  }

  return (
    <>
      <h1>Start Game</h1>

      {screenToggle()}

      <h2>My Decks</h2>
      <Box sx={boxSX}>
        <ListOfMyDecks setSelectedDeck={openRightPanel} />
      </Box>
      {/* {paginationCountMine > 1 && (
        <Pagination
          page={currentPageMine}
          count={paginationCountMine}
          variant='outlined'
          onChange={handlePageChangeMine}
        />
      )} */}

      <h2>Public Decks</h2>
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

      <Button component={Link} to='/'>
        Go Back
      </Button>
      <StartGameDrawer
        open={deckToDisplay !== null}
        setSelectedDeck={openRightPanel}
        selectedDeck={deckToDisplay}
      />
    </>
  )
}

export default DecksScreen
