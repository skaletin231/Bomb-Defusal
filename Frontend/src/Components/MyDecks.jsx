import { useQuery } from '@apollo/client/react'
import { Button, Card, CardContent, Box, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { GET_MY_DECKS } from '../queries'
import DecksDropdown from './DeckDropdowns'
import EditIcon from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton'

const MyDecks = () => {
  const deckResults = useQuery(GET_MY_DECKS)

  if (deckResults.loading) return <div>LOADING...</div>
  console.log(deckResults)

  const decks = deckResults.data.getMyDecks

  const deckCardSX = {
    width: '15rem',
    height: '5rem',
    display: 'flex',
    position: 'relative',
    borderStyle: 'solid',
    borderWidth: '3px',
    borderColor: '#84582e',
    justifyContent: 'center',
  }

  const editButton = {
    top: '0px',
    right: '0px',
    position: 'absolute',
  }

  const cardContentSX = {
    gap: '10px',
    flexDirection: 'column',
    alignContent: 'center',
    '&:last-child': {
      padding: '10px',
    },
  }

  const boxSX = {
    display: 'flex',
    gap: '10px',
  }

  return (
    <Box>
      <h1>My Decks</h1>
      <Box sx={boxSX}>
        {decks.map((deck) => (
          <Card key={deck.name} sx={deckCardSX}>
            <CardContent sx={cardContentSX}>
              <Typography sx={{ fontSize: '1.5rem' }}>{deck.name}</Typography>
              {/* <DecksDropdown deck={deck} isDeckCreation={true} /> */}
              <IconButton
                sx={editButton}
                variant='contained'
                component={Link}
                to={`/mydecks/${deck.id}`}
              >
                {' '}
                <EditIcon
                  sx={{ color: '#633f1e', '&:hover': { color: '#84582e' } }}
                />
              </IconButton>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Button component={Link} to={'/mydecks/new'}>
        Make New Deck
      </Button>
    </Box>
  )
}

export default MyDecks
