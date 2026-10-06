import { useMutation, useQuery } from '@apollo/client/react'
import '@fontsource/suwannaphum'
import { useState } from 'react'
import { COPY_DECK, GET_MY_DECKS, REMOVE_DECK } from '../queries'
import DeckObject from './DeckObject'
import ConfirmDeleteDialogue from './Popups/ConfrimDeleteDialogue'
import NotificationPopup from './Popups/NotificationPopup'
import LoadingScreen from './LoadingScreen'
import PaginationComponent from './HelperTools/PaginationComponent'
import { Box } from '@mui/material'

export default function ListOfMyDecks({
  setSelectedDeck,
  children,
  decksPerPage = 11,
}) {
  const [currentPage, setCurrentPage] = useState(1)

  const [openCreatePopup, setOpenCreatePopup] = useState(false)
  const [openRemovePopup, setOpenRemovePopup] = useState(false)

  const [deckToDelete, setDeckToDelete] = useState(null)
  const { isLoading: myDecksIsLoading, data: myDecksData } = useQuery(
    GET_MY_DECKS,
    {
      variables: {
        page: currentPage,
        pageSize: decksPerPage,
      },
    },
  )

  const [copyDeck] = useMutation(COPY_DECK, {
    update(cache) {
      cache.evict({
        fieldName: 'getMyDecks',
      })
      cache.gc()

      setOpenCreatePopup(true)
    },
  })

  const [removeDeck] = useMutation(REMOVE_DECK, {
    refetchQueries: [GET_MY_DECKS],
    update: (cache) => {
      cache.evict({
        fieldName: 'getMyDecks',
      })
      cache.gc()

      setOpenRemovePopup(true)
    },
    onError: (error) => {
      console.log(error.message)
    },
  })

  //Only runs when there is nothing to display yet
  if (myDecksIsLoading && !myDecksData)
    return (
      <Box className='tableLayoutDeck'>
        <LoadingScreen />
      </Box>
    )

  if (!myDecksData) return null

  const decks = myDecksData.getMyDecks?.decks ?? []
  const count = myDecksData.getMyDecks?.pageInfo?.totalPages ?? 0

  const tryMakeCopy = async (deckID) => {
    await copyDeck({
      variables: {
        deckID: deckID,
      },
    })
  }

  const tryRemoveDeck = async () => {
    const previousDeckCount = decks.length
    await removeDeck({
      variables: {
        deckID: deckToDelete,
      },
    })
    if (previousDeckCount === 1 && currentPage > 1)
      setCurrentPage(currentPage - 1)
    setDeckToDelete(null)
  }

  const handlePageChange = (event, value) => {
    setCurrentPage(value)
  }

  return (
    <>
      <Box className='tableLayoutDeck'>
        {children}

        {decks.map((deck, i) => (
          <DeckObject
            key={i}
            deck={deck}
            type={'mine'}
            tryMakeDeck={tryMakeCopy}
            setDeckToDelete={setDeckToDelete}
            setSelectedDeck={setSelectedDeck}
          />
        ))}
      </Box>

      <PaginationComponent
        page={currentPage}
        count={count}
        onChange={handlePageChange}
      />

      <ConfirmDeleteDialogue
        open={deckToDelete !== null}
        onConfirm={tryRemoveDeck}
        setTracker={setDeckToDelete}
      />

      <NotificationPopup
        message={'Deck Removed'}
        color={'success'}
        open={openRemovePopup}
        setOpen={setOpenRemovePopup}
      />

      <NotificationPopup
        message={'Deck Created'}
        color={'success'}
        open={openCreatePopup}
        setOpen={setOpenCreatePopup}
      />
    </>
  )
}
