import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  TextField,
  Typography,
} from '@mui/material'
import { useQuery } from '@apollo/client/react'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { GET_ONE_DECK } from '../queries'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft'
import SortMenu from './SortMenu'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'

export default function DeckView() {
  const { id: deckID } = useParams()
  const [sortBy, setSortBy] = useState('Name (a-z)')
  const [firstItem, setFirstItem] = useState(0)

  //resize pagination
  const containerRef = useRef(null)
  const [itemsPerRow, setItemsPerRow] = useState(1)

  const deckResults = useQuery(GET_ONE_DECK, {
    variables: { deckID: deckID },
    skip: !deckID,
  })

  const cardsPerPage = itemsPerRow * 5
  const deck = deckResults.data?.getOneDeck

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

  useLayoutEffect(() => {
    const grid = containerRef.current

    if (!grid) return

    const updateItemsPerRow = () => {
      const children = [...grid.children]

      if (children.length === 0) {
        setItemsPerRow(1)
        return
      }

      const firstRowTop = children[0].offsetTop

      const count = children.filter(
        (child) => child.offsetTop === firstRowTop,
      ).length

      setItemsPerRow(count)
    }

    // Calculate initially
    updateItemsPerRow()

    // Recalculate whenever the grid changes size
    const observer = new ResizeObserver(updateItemsPerRow)
    observer.observe(grid)

    return () => observer.disconnect()
  }, [sortedCards])

  const visibleCardsInDeck = sortedCards.slice(
    firstItem,
    firstItem + cardsPerPage,
  )

  if (deckResults.loading) return <div>loading...</div>

  if (deckResults.error || !deck) {
    return <div>{deckResults.error.message}</div>
  }

  const headerUI = () => {
    return (
      <Box>
        <Typography variant='h2' sx={{ fontWeight: 'bold', color: '#3A1605' }}>
          {deck.name}
        </Typography>
        <Box className='flexRow' sx={{ gap: '10px' }}>
          <Typography sx={{ color: '#737373' }}>
            by {deck.owner.username}
          </Typography>
          <Typography sx={{ color: '#737373' }}>•</Typography>
          <Typography sx={{ color: '#737373' }}>
            {deck.cards.length} cards
          </Typography>
        </Box>

        <Typography>{deck.cards.notes}</Typography>
      </Box>
    )
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
            onClick={() => console.log('test')}
            className='buttonStyle3D warning'
            variant='contained'
            sx={myButtonsSX}
          >
            <DeleteForeverOutlinedIcon /> Delete Deck
          </Button>
        </Box>

        <Box>
          <SortMenu sortBy={sortBy} setSortBy={setSortBy} />
        </Box>
      </Box>
    )
  }

  const deckCardsx = {
    height: '6rem',
    width: '10rem',
    borderRadius: '10px',
    border: '0.15rem solid #84582E',
    backgroundColor: '#ffffff',
    color: '#84582E',
  }

  const deckLAyoutUI = () => {
    return (
      <Box
        ref={containerRef}
        sx={{
          gridTemplateColumns: 'repeat(auto-fill, 160px)',
          display: 'grid',
          justifyContent: 'space-between',
          gap: '10px',
          maxHeight: 'calc(30rem + 60px)',
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

  console.log(itemsPerRow)

  return (
    <Box className='flexColumn' sx={{ gap: '30px' }}>
      {headerUI()}
      {buttonsUIMine()}
      <br />
      {deckLAyoutUI()}
    </Box>
  )
}
