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

const DeckObject = ({
  deck,
  type,
  tryMakeDeck,
  setDeckToDelete,
  setSelectedDeck,
}) => {
  // const [selected, setSelected] = useState(false)

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

  const cardClicked = () => {
    if (setSelectedDeck !== null) setSelectedDeck(deck)
  }

  return (
    <>
      <Card key={deck.name} sx={deckCardSX}>
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
        <CardActions>{type === 'mine' && myDeckButtons()}</CardActions>
      </Card>
    </>
  )
}

export default DeckObject
