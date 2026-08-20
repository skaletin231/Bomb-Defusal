import { useQuery } from '@apollo/client/react'
import { Button, Card, CardContent, Box } from '@mui/material'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GET_ALL_DECKS } from '../queries'
import CreateGameDialogue from './Popups/CreateGameDialogue'
import DecksDropdown from './DeckDropdowns'
import DeckObject from './DeckObject'
import Pagination from '@mui/material/Pagination'

const DecksScreen = () => {
  const decksPerPage = 8
  const [currentPageMine, setCurrentPageMine] = useState(1)
  const [currentPagePublic, setCurrentPagePublic] = useState(1)

  const [id, setID] = useState(null)
  const [leftMine, setLeftMine] = useState(0)
  const [leftPublic, setLeftPublic] = useState(0)

  const deckResults = useQuery(GET_ALL_DECKS)

  if (deckResults.loading) return <div>LOADING...</div>

  const myDecks = deckResults.data.getAllDecks.myDecks
  const publicDecks = deckResults.data.getAllDecks.publicDecks

  const boxSX = {
    height: 'auto',
    flexFlow: 'wrap',
    display: 'flex',
    gap: '10px',
  }

  const handlePageChangeMine = (event, value) => {
    setCurrentPageMine(value)
    setLeftMine(decksPerPage * (value - 1))
  }

  const handlePageChangePublic = (event, value) => {
    setCurrentPagePublic(value)
    setLeftPublic(decksPerPage * (value - 1))
  }

  const visibleDecksMine = myDecks.slice(leftMine, leftMine + decksPerPage)
  const visibleDecksPublic = publicDecks.slice(
    leftPublic,
    leftPublic + decksPerPage,
  )

  const paginationCountMine = Math.trunc(myDecks.length / decksPerPage) + 1
  const paginationCountPublic =
    Math.trunc(publicDecks.length / decksPerPage) + 1

  return (
    <>
      <h1>Start Game</h1>

      <h2>Your Decks</h2>
      <Box sx={boxSX}>
        {visibleDecksMine.map((deck, i) => (
          <DeckObject key={i} deck={deck} type={'play'} setID={setID} />
        ))}
      </Box>
      {paginationCountMine > 1 && (
        <Pagination
          page={currentPageMine}
          count={paginationCountMine}
          variant='outlined'
          onChange={handlePageChangeMine}
        />
      )}

      <h2>Public Decks</h2>
      <Box sx={boxSX}>
        {visibleDecksPublic.map((deck, i) => (
          <DeckObject key={i} deck={deck} type={'play'} setID={setID} />
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
      <CreateGameDialogue id={id} setID={setID} />
    </>
  )
}

export default DecksScreen
