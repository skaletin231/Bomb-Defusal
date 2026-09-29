import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Typography,
} from '@mui/material'
import IconButton from '@mui/material/IconButton'
import { Link } from 'react-router-dom'
import LanguageIcon from '@mui/icons-material/Language'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { FAVORITE_DECK } from '../queries'
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
  borderRadius: '10px',
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

const DeckObject = ({
  deck,
  type,
  tryMakeDeck,
  setDeckToDelete,
  setSelectedDeck,
  isFavorited,
}) => {
  const [favoriteDeck] = useMutation(FAVORITE_DECK, {
    update(cache, { data }) {
      cache.modify({
        fields: {
          getAllDecks(existingDeckRefs = [], { readField }) {
            if (!data.favoriteDeck.isFavorited) {
              const newData = existingDeckRefs.favoritedDecks.filter(
                (deckRef) =>
                  readField('id', deckRef) !== data.favoriteDeck.deck.id,
              )

              return {
                ...existingDeckRefs,
                favoritedDecks: newData,
              }
            }

            return {
              ...existingDeckRefs,
              favoritedDecks: existingDeckRefs.favoritedDecks.concat(
                data.favoriteDeck.deck,
              ),
            }
          },
        },
      })
    },
  })

  const tryFavoriteDeck = async (id) => {
    await favoriteDeck({
      variables: {
        deckID: id,
      },
    })
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
          onClick={() => setDeckToDelete(deck.id)}
        >
          <DeleteForeverOutlinedIcon
            sx={{ color: '#9b2a2a', '&:hover': { color: '#B43131' } }}
          />
        </IconButton>
      </Box>
    )
  }

  const otherDeckButtons = () => {
    return (
      <Box sx={buttonHolderSX}>
        <IconButton
          sx={editButton}
          className='likeButton'
          variant='contained'
          onClick={() => tryFavoriteDeck(deck.id)}
        >
          {isFavorited ? (
            <FavoriteIcon
              sx={{ color: '#ff0000', '&:hover': { color: '#ff0000' } }}
            />
          ) : (
            <FavoriteBorderIcon
              sx={{ color: '#ff0000', '&:hover': { color: '#ff0000' } }}
            />
          )}
        </IconButton>
      </Box>
    )
  }

  const cardClicked = () => {
    if (setSelectedDeck !== null) setSelectedDeck(deck)
  }

  return (
    <>
      <Card key={deck.name} sx={deckCardSX}>
        {type === 'mine' && deck.public && (
          <LanguageIcon
            fontSize='medium'
            sx={{
              position: 'absolute',
              top: '2px',
              left: '2px',
              color: 'text.secondary',
            }}
          />
        )}
        <CardActionArea
          disableRipple
          onClick={cardClicked}
          sx={{
            '&:hover .MuiCardActionArea-focusHighlight': {
              opacity: 0,
            },
          }}
        >
          <CardContent sx={cardContentSX}>
            <Typography className='deckUsername'>
              {deck.owner.username}
            </Typography>
            <Typography className='deckCardCount'>
              {deck.cards.length} cards
            </Typography>
            <Typography className='deckName' sx={deckNameSX}>
              {deck.name}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          {type === 'mine' && myDeckButtons()}
          {type !== 'mine' && otherDeckButtons()}
        </CardActions>
      </Card>
    </>
  )
}

export default DeckObject
