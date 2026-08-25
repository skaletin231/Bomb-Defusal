import { useMutation, useQuery } from '@apollo/client/react'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ImportExportIcon from '@mui/icons-material/ImportExport'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  TextField,
  Typography,
} from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import InputAdornment from '@mui/material/InputAdornment'
import InputBase from '@mui/material/InputBase'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { GET_MY_DECK, UPDATE_DECK } from '../queries'

const formStyle = {
  justifyContent: 'flex-start',
  flexDirection: 'row',
  display: 'flex',
  width: '50%',
  gap: '40px',
}

const titleText = {
  color: '#3A1605',
  fontSize: '3rem',
  margin: '10px 0 0 0',
  fontFamily: '"Suwannaphum", serif',
  fontWeight: 'bold',
}

const saveButton = {
  '&&': {
    width: 'auto',
    alignSelf: 'center',
    display: 'flex',
    height: '50px',
    gap: '7px',
  },
}

const addCardButton = {
  '&&': {
    width: 'auto',
    alignSelf: 'center',
    height: '50px',
  },
}

const titleSaveBox = {
  width: '50%',
  display: 'flex',
  gap: '40px',
}

const styleToggleSX = {
  alignSelf: 'center',
  borderRadius: '50px',
  border: '0.15rem solid #84582E',
  padding: '10px',
}

const styleToggleButtonSX = {
  borderRadius: '50px',
  borderWidth: '0px',
  color: '#9F4B24',
  '&.Mui-selected': {
    backgroundColor: '#9F4B24',
    color: 'white',
  },
  '&.MuiToggleButtonGroup-lastButton': {
    borderRadius: '50px',
    marginLeft: '0px',
    borderWidth: '0px',
  },
  '&.MuiToggleButtonGroup-firstButton': {
    borderRadius: '50px',
  },
}

const deckCardsx = {
  height: '6rem',
  width: '10rem',
  borderRadius: '10px',
  border: '0.15rem solid #84582E',
  backgroundColor: '#ffffff',
  color: '#84582E',
}

const maxCardSize = 15

const MakeDeckScreen = () => {
  const { id: deckID } = useParams()

  const [addStyle, setAddStyle] = useState('left')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('default')

  const [cardToAdd, setCardToAdd] = useState('')
  const [notes, setNotes] = useState('')
  const [filterDeck, setFilterDeck] = useState('')
  const [deckName, setDeckName] = useState('')
  const [allCards, setAllCards] = useState([])
  const [isPublicDeck, setIsPublicDeck] = useState(false)
  const [selectMultiple, setSelectMultiple] = useState(false)

  const deckResults = useQuery(GET_MY_DECK, {
    variables: { deckID: deckID },
    skip: !deckID,
  })

  const [updateDeck] = useMutation(UPDATE_DECK, {
    update(cache, { data }) {
      cache.modify({
        id: cache.identify({
          __typename: 'Deck',
          id: data.updateDeck.id,
        }),
        fields: {
          name: () => data.updateDeck.name,
          public: () => data.updateDeck.public,
          cards: () => data.updateDeck.cards,
        },
      })
    },
  })

  const sortCombined = `${sortBy} ${sortOrder}`

  const sortedCards = useMemo(() => {
    if (sortCombined === 'Date default') return allCards
    if (sortCombined === 'Date reverse') return [...allCards].reverse()

    return [...allCards].sort((a, b) => {
      switch (sortCombined) {
        case 'Name default':
          return a.localeCompare(b)

        case 'Name reverse':
          return b.localeCompare(a)

        default:
          return 0
      }
    })
  }, [allCards, sortCombined])

  useEffect(() => {
    if (deckResults.data?.getMyDeck) {
      const deck = deckResults.data.getMyDeck
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDeckName(deck.name)
      setAllCards(deck.cards)
      setIsPublicDeck(deck.public)
    }
  }, [deckResults.data])

  if (deckResults.loading) return <div>loading...</div>

  if (deckResults.error) {
    return <div>{deckResults.error.message}</div>
  }

  if (!deckResults.data?.getMyDeck) return <div>Issue Loading Deck</div>

  const tryVerifyDeckChanges = async (event) => {
    event.preventDefault()
    console.log('updateDeck: ', {
      deckID: deckResults.data?.getMyDeck.id,
      name: deckName,
      public: isPublicDeck,
      cards: allCards,
    })
    await updateDeck({
      variables: {
        deckID: deckResults.data?.getMyDeck.id,
        name: deckName,
        public: isPublicDeck,
        cards: allCards,
      },
    })
  }

  function capitalizeWords(str) {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const tryAddCardsToList = (event) => {
    event.preventDefault()
    const formattedWord = capitalizeWords(cardToAdd.trim())
    if (
      formattedWord !== '' &&
      formattedWord.length <= maxCardSize &&
      !allCards.includes(formattedWord)
    ) {
      setAllCards(allCards.concat(formattedWord))
    }
    setCardToAdd('')
    return
  }

  const removeCard = (index) => {
    setAllCards(allCards.filter((card, i) => i !== index))
  }

  const handleAddStyle = (event, newAlignment) => {
    if (newAlignment !== null) {
      setAddStyle(newAlignment)
    }
  }

  const headerUI = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Typography variant='h2' style={titleText}>
          Edit Deck
        </Typography>
        <Box className='nameAndSaveChanges' sx={titleSaveBox}>
          <TextField
            variant='outlined'
            placeholder='Name'
            className='textFieldStyle3D'
            value={deckName}
            onChange={({ target }) => setDeckName(target.value)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <EditOutlinedIcon />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            variant='contained'
            className='buttonStyle3D'
            sx={saveButton}
            onClick={tryVerifyDeckChanges}
          >
            <SaveOutlinedIcon />
            Save Changes
          </Button>
        </Box>

        <FormGroup sx={{ width: 'fit-content' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isPublicDeck}
                onChange={(event) => setIsPublicDeck(event.target.checked)}
                sx={{ color: '#84582E' }}
              />
            }
            label='Public Deck'
            sx={{ color: '#84582E' }}
            className='publicCheck'
          />
        </FormGroup>
      </Box>
    )
  }

  const addStyleToggleUI = () => {
    return (
      <ToggleButtonGroup
        sx={styleToggleSX}
        value={addStyle}
        exclusive
        onChange={handleAddStyle}
        aria-label='add style'
      >
        <ToggleButton
          sx={styleToggleButtonSX}
          value='left'
          aria-label='left aligned'
        >
          Add and Delete
        </ToggleButton>
        <ToggleButton
          sx={styleToggleButtonSX}
          value='center'
          aria-label='centered'
        >
          Quick Import
        </ToggleButton>
      </ToggleButtonGroup>
    )
  }

  const addCardUI = () => {
    return (
      <form onSubmit={tryAddCardsToList} style={formStyle}>
        <TextField
          variant='outlined'
          placeholder='Type to add a card'
          className='textFieldStyle3D'
          value={cardToAdd}
          onChange={({ target }) => setCardToAdd(target.value)}
        ></TextField>

        <Button
          type='submit'
          variant='contained'
          className='buttonStyle3D'
          sx={addCardButton}
        >
          Add Card
        </Button>
      </form>
    )
  }

  const deckSearchUI = () => {
    return (
      <Box
        component='form'
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          boxSizing: 'border-box',
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px',
          backgroundColor: '#FFFFFF',
          border: '0.15rem solid #D1D1D1',
          borderWidth: '0 0 .15rem 0',
          gap: '20px',
        }}
      >
        <InputBase
          sx={{
            ml: 1,
            flex: 1,
            '& input': {
              color: '#3A1605',
            },
            '& input::placeholder': {
              color: '#808080',
              opacity: 1,
            },
          }}
          placeholder='Search...'
          inputProps={{ 'aria-label': 'search google maps' }}
          value={filterDeck}
          onChange={(event) => setFilterDeck(event.target.value)}
          startAdornment={
            filterDeck === '' ? <SearchIcon sx={{ color: '#808080' }} /> : null
          }
        />
        <Box>
          <Button
            sx={{ p: '10px', color: '#3A1605' }}
            onClick={() =>
              sortBy === 'Name' ? setSortBy('Date') : setSortBy('Name')
            }
          >
            Sort By: {sortBy}
          </Button>
          <Button
            sx={{
              color: '#3A1605',
              padding: '0px',
              justifyContent: 'start',
              minWidth: '0',
            }}
            disableRipple
            onClick={() =>
              sortOrder === 'default'
                ? setSortOrder('reverse')
                : setSortOrder('default')
            }
          >
            <ImportExportIcon />
          </Button>
        </Box>

        <FormGroup sx={{ width: 'fit-content' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectMultiple}
                onChange={(event) => setSelectMultiple(event.target.checked)}
                sx={{ color: '#808080' }}
              />
            }
            label='Select Multiple'
            sx={{ color: '#3A1605' }}
            className='selectMultipleButton'
          />
        </FormGroup>
      </Box>
    )
  }

  const deckUI = () => {
    return (
      <div
        style={{
          width: '90%',
          justifySelf: 'center',
          backgroundColor: '#F5F5F5',
          borderRadius: '10px',
          border: '0.15rem solid #D1D1D1',
        }}
      >
        {deckSearchUI()}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            height: '30rem',
            gap: 2,
            maxHeight: '30rem',
            padding: '.2rem 1rem',
            overflow: 'auto',
          }}
        >
          {sortedCards.map((card, i) => (
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
                <IconButton
                  sx={{
                    position: 'absolute',
                    right: '.2rem',
                    top: '.1rem',
                    margin: '0',
                    padding: '0',
                    fontSize: '1.1rem',
                    color: '#B43131',
                  }}
                  onClick={() => removeCard(i)}
                >
                  X
                </IconButton>
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
      </div>
    )
  }

  const notesUI = () => {
    return (
      <Box>
        <Typography sx={{ color: '#3A1605', fontWeight: 'bold' }}>
          Notes
        </Typography>
        <TextField
          multiline
          sx={{
            margin: '.4rem .1rem',
            width: '90%',
            '& .MuiInputBase-root': {
              backgroundColor: '#F5F5F5',
              borderRadius: '10px',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: '0.15rem solid #D1D1D1',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              border: '0.15rem solid #c5c5c5',
            },
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
              {
                border: '0.15rem solid #c5c5c5',
              },
          }}
          placeholder='Type to add notes'
          value={notes}
          onChange={({ target }) => setNotes(target.value)}
          rows={4}
        ></TextField>
      </Box>
    )
  }

  return (
    <Box sx={{ gap: '30px', display: 'flex', flexDirection: 'column' }}>
      {headerUI()}
      {addStyleToggleUI()}
      {addCardUI()}
      {deckUI()}
      {notesUI()}
    </Box>
  )
}

export default MakeDeckScreen
