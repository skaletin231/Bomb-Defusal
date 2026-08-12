import { Button, Card, CardContent, Box, Typography } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import IconButton from '@mui/material/IconButton'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import { Link } from 'react-router-dom'
import { GET_ALL_DECKS, GET_MY_DECKS, REMOVE_DECK } from '../queries'
import { useMutation } from '@apollo/client/react'

const deckCardSX = {
  width: '15rem',
  height: '6.5rem',
  display: 'flex',
  position: 'relative',
  borderStyle: 'solid',
  borderWidth: '3px',
  borderColor: '#84582e',
  padding: '10px',
  borderRadius: '5%',
  boxShadow: '0px 4px 7px 0px #00000091',
}

const editButton = {
  padding: '0px',
}

const copyButton = {
  padding: '0px',
}

const deleteButton = {
  padding: '0px',
}

const buttonHolderSX = {
  position: 'absolute',
  top: '0',
  right: '0',
  padding: '10px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  boxSizing: 'border-box',
}

const cardContentSX = {
  gap: '10px',
  flexDirection: 'column',
  '&:last-child': {
    padding: '10px',
  },
}

const deckNameSX = {
  fontSize: '1.5rem',
  color: '#84582e',
}

const DeckObject = ({ deck, type, tryMakeDeck, setID, setSelectedDeck }) => {
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
          getAllDecks(existingDeckRefs = [], { readField }) {
            return existingDeckRefs.filter(
              (deckRef) =>
                readField('id', deckRef) !== response.data.removeDeck,
            )
          },
        },
      })
    },
    onError: (error) => {
      console.log(error.message)
    },
  })

  const tryRemoveDeck = () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete deck: ${deck.name}?`,
    )
    if (!confirmed) return

    removeDeck({
      variables: {
        deckID: deck.id,
      },
    })
  }

  const playGameButton = () => {
    return (
      <Box sx={buttonHolderSX}>
        <Button
          sx={copyButton}
          className='copyButton'
          variant='contained'
          onClick={() => setID(deck.id)}
        >
          Use Deck
        </Button>
      </Box>
    )
  }

  const myDeckButtons = () => {
    return (
      <Box sx={buttonHolderSX}>
        <IconButton
          sx={editButton}
          className='editButton'
          variant='contained'
          component={Link}
          to={`/mydecks/${deck.id}`}
        >
          <EditOutlinedIcon
            sx={{ color: '#633f1e', '&:hover': { color: '#84582e' } }}
          />
        </IconButton>
        <IconButton
          sx={copyButton}
          className='copyButton'
          variant='contained'
          onClick={() => tryMakeDeck(deck.id)}
        >
          <ContentCopyRoundedIcon
            sx={{ color: '#633f1e', '&:hover': { color: '#84582e' } }}
          />
        </IconButton>
        <IconButton
          sx={deleteButton}
          className='deleteButton'
          variant='contained'
          onClick={() => setSelectedDeck(deck.id)}
        >
          <DeleteForeverOutlinedIcon
            sx={{ color: '#9b2a2a', '&:hover': { color: '#B43131' } }}
          />
        </IconButton>
      </Box>
    )
  }

  return (
    <Card key={deck.name} sx={deckCardSX}>
      <CardContent sx={cardContentSX}>
        <Typography className='deckUsername'>{deck.owner.username}</Typography>
        <Typography className='deckCardCount'>{deck.cards.length}</Typography>
        <Typography className='deckName' sx={deckNameSX}>
          {deck.name}
        </Typography>
        {type === 'edit' && myDeckButtons()}
        {type === 'play' && playGameButton()}
      </CardContent>
    </Card>
  )
}

export default DeckObject
