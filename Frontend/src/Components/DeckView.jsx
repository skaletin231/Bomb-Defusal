import { useMutation, useQuery } from '@apollo/client/react'
import '@fontsource/suwannaphum'
import {
  Box,
  Button,
  Card,
  CardContent,
  Pagination,
  Typography,
} from '@mui/material'
import { COPY_DECK, REMOVE_DECK } from '../queries'
import { gql } from '@apollo/client'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import Divider from '@mui/material/Divider'
import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { GET_ONE_DECK, ME } from '../queries'
import ConfirmDeleteDialogue from './Popups/ConfrimDeleteDialogue'
import NotificationPopup from './Popups/NotificationPopup'
import SortMenu from './SortMenu'
import LoadingScreen from './LoadingScreen'

const deckCardsx = {
  height: '6rem',
  width: '10rem',
  borderRadius: '10px',
  border: '0.15rem solid #84582E',
  backgroundColor: '#ffffff',
  color: '#84582E',
}

const myButtonsSX = {
  '&&': {
    //width: 'fit-content',
    width: '10rem',
    alignSelf: 'center',
    display: 'flex',
    gap: '7px',
    height: '50px',
    flexShrink: '0',
  },
}

const sortSX = { alignContent: 'center', marginTop: '4px', marginLeft: 'auto' }

export default function DeckView() {
  const [openCreatePopup, setOpenCreatePopup] = useState(false)
  const { data: meData } = useQuery(ME, {})
  const me = meData.me

  const location = useLocation()
  const { id: deckID } = useParams()
  const [sortBy, setSortBy] = useState('Name (a-z)')
  const [currentPage, setCurrentPage] = useState(1)
  const [deletePanelOpen, setDeletePanelOpen] = useState(false)
  const navigate = useNavigate()

  const deckResults = useQuery(GET_ONE_DECK, {
    variables: { deckID: deckID },
    skip: !deckID,
  })
  const deck = deckResults.data?.getOneDeck
  const myDeck = me?.id === deck?.owner?.id

  const from = location.state?.from
  const [removeDeck] = useMutation(REMOVE_DECK, {
    update: (cache, response) => {
      cache.modify({
        fields: {
          getMyDecks(existingDeckRefs = [], { readField }) {
            return existingDeckRefs.filter(
              (deckRef) =>
                readField('id', deckRef) !== response.data.removeDeck,
            )
          },
          getAllDecks(existingDeckRefs, { readField }) {
            if (!existingDeckRefs) return existingDeckRefs

            return {
              ...existingDeckRefs,
              myDecks: existingDeckRefs.myDecks.filter(
                (deckRef) =>
                  readField('id', deckRef) !== response.data.removeDeck,
              ),
            }
          },
        },
      })
      navigate(from ?? '/', { replace: true })
    },
    onError: (error) => {
      console.log(error.message)
    },
  })

  const tryRemoveDeck = async () => {
    await removeDeck({
      variables: {
        deckID: deckID,
      },
    })
    setDeletePanelOpen(false)
  }

  const [copyDeck] = useMutation(COPY_DECK, {
    update(cache, { data }) {
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
          getAllDecks(existing) {
            if (!existing) return existing
            return { ...existing, myDecks: [existing.myDecks, newRef] }
          },
        },
      })

      setOpenCreatePopup(true)
    },
  })

  const tryMakeCopy = async () => {
    await copyDeck({
      variables: {
        deckID: deckID,
      },
    })
  }

  const sortedCards = useMemo(() => {
    if (!deck) return []
    if (sortBy === 'Date Added (Newest First)') return deck.cards
    if (sortBy === 'Date Added (Oldest First)') return [...deck.cards].reverse()

    return [...deck.cards].sort((a, b) => {
      switch (sortBy) {
        case 'Name (a-z)':
          return a.localeCompare(b)

        case 'Name (z-a)':
          return b.localeCompare(a)

        default:
          return 0
      }
    })
  }, [deck, sortBy])

  const cardsPerPage = 24
  const currentLeftItem = (currentPage - 1) * cardsPerPage
  const paginationCount = Math.trunc(sortedCards.length / cardsPerPage) + 1

  const visibleCardsInDeck = sortedCards.slice(
    currentLeftItem,
    currentLeftItem + cardsPerPage,
  )

  if (deckResults.loading) return <LoadingScreen />

  if (deckResults.error || !deck) {
    return <div>{deckResults.error.message}</div>
  }

  const handlePageChangePublic = (event, value) => {
    setCurrentPage(value)
  }

  const headerUI = () => {
    return (
      <Box className='flexColumn' sx={{ gap: '15px' }}>
        <Typography className='mainHeader'>{deck.name}</Typography>
        <Box className='flexRow' sx={{ gap: '10px' }}>
          <Typography sx={{ color: '#737373' }}>
            by {deck.owner.username}
          </Typography>
          <Typography sx={{ color: '#737373' }}>•</Typography>
          <Typography sx={{ color: '#737373' }}>
            {deck.cards.length} cards
          </Typography>
        </Box>

        <Typography sx={{ color: '#3A1605', width: '70%' }}>
          {deck.notes}
        </Typography>
      </Box>
    )
  }

  const buttonsUIMine = () => {
    return (
      <Box className='flexRow deckViewButtons'>
        <Box className='flexRow deckViewButtons' sx={{ gap: '10px' }}>
          <Button
            className='buttonStyle3D'
            variant='contained'
            component={Link}
            to={`/mydecks/${deck.id}`}
            sx={myButtonsSX}
          >
            <EditOutlinedIcon /> Edit Deck
          </Button>

          <Button
            onClick={() => setDeletePanelOpen(true)}
            className='buttonStyle3D warning'
            variant='contained'
            sx={myButtonsSX}
          >
            <DeleteForeverOutlinedIcon /> Delete Deck
          </Button>
        </Box>

        <Box sx={sortSX}>
          <SortMenu sortBy={sortBy} setSortBy={setSortBy} />
        </Box>
      </Box>
    )
  }

  const deckLAyoutUI = () => {
    return (
      <Box
        sx={{
          gridTemplateColumns: 'repeat(auto-fill, 160px)',
          display: 'grid',
          justifyContent: 'space-between',
          gap: '10px',
          padding: '.2rem 1rem',
          overflow: 'auto',
          alignContent: 'start',
        }}
      >
        {visibleCardsInDeck.map((card, i) => (
          <Card key={i} sx={deckCardsx}>
            <CardContent
              sx={{
                position: 'relative',
                padding: '16px',
                '&:last-child': {
                  padding: '16px',
                },
                height: '4rem',
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
              }}
            >
              <Typography
                sx={{
                  lineHeight: '1.2',
                  textAlign: 'center',
                  overflowWrap: 'anywhere',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                }}
              >
                {card}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    )
  }

  const closePopup = () => {
    setDeletePanelOpen(false)
  }

  const buttonsUINotMine = () => {
    return (
      <Box className='flexRow deckViewButtons'>
        {me !== null && (
          <Box className='flexRow deckViewButtons' sx={{ gap: '10px' }}>
            <Button
              onClick={tryMakeCopy}
              className='buttonStyle3D'
              variant='contained'
              sx={myButtonsSX}
            >
              <ContentCopyRoundedIcon /> Copy Deck
            </Button>
          </Box>
        )}

        <Box sx={sortSX}>
          <SortMenu sortBy={sortBy} setSortBy={setSortBy} />
        </Box>
      </Box>
    )
  }

  return (
    <Box
      className='flexColumn'
      sx={{
        gap: '10px',
        marginInline: 'auto',
        maxWidth: '80rem',
        marginTop: '2vh',
      }}
    >
      <Box className='flexColumn' sx={{ gap: '30px', padding: '0 1rem' }}>
        {headerUI()}
        {myDeck && buttonsUIMine()}
        {!myDeck && buttonsUINotMine()}
      </Box>

      <Divider
        sx={{
          borderColor: '#84582E',
          margin: '2rem 0',
          borderBottomWidth: '.15rem',
        }}
      />
      {deckLAyoutUI()}
      <Box sx={{ justifyItems: 'center', marginTop: '30px' }}>
        {paginationCount > 1 && (
          <Pagination
            sx={{
              '& .MuiPaginationItem-root': {
                color: '#84582E',
                borderColor: '#84582E',
              },
              '& .MuiPaginationItem-root.Mui-selected': {
                color: 'white',
                backgroundColor: '#84582E',
              },
              '& .MuiPaginationItem-root.Mui-selected:hover': {
                color: 'white',
                backgroundColor: '#84582E',
              },
              '& .MuiPaginationItem-root:hover': {
                color: 'white',
                backgroundColor: '#84582E',
              },
              '& .MuiPaginationItem-previousNext': {
                borderStyle: 'none',
              },
            }}
            page={currentPage}
            count={paginationCount}
            variant='outlined'
            onChange={handlePageChangePublic}
          />
        )}
      </Box>

      <ConfirmDeleteDialogue
        open={deletePanelOpen}
        onConfirm={tryRemoveDeck}
        setDeckToDelete={closePopup}
      />

      <NotificationPopup
        message={'Deck Created'}
        color={'success'}
        open={openCreatePopup}
        setOpen={setOpenCreatePopup}
      />
    </Box>
  )
}
