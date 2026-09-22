import { useMutation, useQuery } from '@apollo/client/react'
import CheckIcon from '@mui/icons-material/Check'
import DownloadIcon from '@mui/icons-material/Download'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import SearchIcon from '@mui/icons-material/Search'
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft'
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
import NotificationPopup from './Popups/NotificationPopup'
import SortMenu from './SortMenu'
import LoadingScreen from './LoadingScreen'

const formStyle = {
  justifyContent: 'flex-start',
  flexDirection: 'row',
  display: 'flex',
  width: 'calc(50VW - 3rem)',
  minWidth: '30rem',
  gap: '40px',
}

const titleText = {
  margin: '10px 0 0 0',
  width: 'fit-content',
}

const saveButton = {
  '&&': {
    width: 'fit-content',
    alignSelf: 'center',
    display: 'flex',
    gap: '7px',
    height: '50px',
    flexShrink: '0',
  },
  '&.Mui-disabled': {
    backgroundColor: '#588A29',
    color: '#FFFFFF',
    borderColor: '#1E5C15',
  },
}

const addCardButton = {
  '&&': {
    width: 'auto',
    alignSelf: 'center',
    height: '50px',
    display: 'flex',
    gap: '7px',
    flexShrink: '0',
    padding: '0px 10px',
  },
}

const importButton = {
  '&&': {
    width: 'auto',
    alignSelf: 'center',
    height: '50px',
    display: 'flex',
    gap: '7px',
    flexShrink: '0',
  },
}

const titleSaveBox = {
  width: 'calc(50VW - 3rem)',
  minWidth: '30rem',
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

  const [addStyle, setAddStyle] = useState('default')
  const [sortBy, setSortBy] = useState('Name (a-z)')
  //const [sortOrder, setSortOrder] = useState('default')

  const [cardToAdd, setCardToAdd] = useState('')
  const [openPopup, setOpenPopup] = useState(false)

  const [deckName, setDeckName] = useState('')
  const [allCards, setAllCards] = useState([])
  const [isPublicDeck, setIsPublicDeck] = useState(false)
  const [notes, setNotes] = useState('')

  const [filterDeck, setFilterDeck] = useState('')
  //const [selectMultiple, setSelectMultiple] = useState(false)

  const [importWords, setImportWords] = useState('')
  const [override, setOverride] = useState(false)

  const [needsSave, setNeedsSave] = useState(true)

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
          notes: () => data.updateDeck.notes,
        },
      })

      setOpenPopup(true)
      setNeedsSave(false)
    },
  })

  const sortedCards = useMemo(() => {
    if (sortBy === 'Date Added (Newest First)') return allCards
    if (sortBy === 'Date Added (Oldest First)') return [...allCards].reverse()

    return [...allCards].sort((a, b) => {
      switch (sortBy) {
        case 'Name (a-z)':
          return a.localeCompare(b)

        case 'Name (z-a)':
          return b.localeCompare(a)

        default:
          return 0
      }
    })
  }, [allCards, sortBy])

  useEffect(() => {
    if (deckResults.data?.getMyDeck) {
      const deck = deckResults.data.getMyDeck
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDeckName(deck.name)
      setAllCards(deck.cards)
      setIsPublicDeck(deck.public)
      setNotes(deck.notes)
    }
  }, [deckResults.data])

  if (deckResults.loading) return <LoadingScreen />

  if (deckResults.error) {
    return <div>{deckResults.error.message}</div>
  }

  if (!deckResults.data?.getMyDeck) return <div>Issue Loading Deck</div>

  const tryVerifyDeckChanges = async (event) => {
    event.preventDefault()
    await updateDeck({
      variables: {
        deckID: deckResults.data?.getMyDeck.id,
        name: deckName,
        public: isPublicDeck,
        cards: allCards,
        notes: notes,
      },
    })
  }

  function capitalizeWords(str) {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const tryAddCardToList = (card) => {
    const formattedWord = capitalizeWords(card.trim())
    if (
      formattedWord !== '' &&
      formattedWord.length <= maxCardSize &&
      !allCards.includes(formattedWord)
    ) {
      setAllCards((prevCards) => prevCards.concat(formattedWord))
    }
    setCardToAdd('')
    return
  }

  const removeCard = (name) => {
    setAllCards(allCards.filter((card) => name !== card))
  }

  const handleAddStyle = (event, newAlignment) => {
    if (newAlignment !== null) {
      setAddStyle(newAlignment)
    }
  }

  const tryImportCards = () => {
    if (override) setAllCards([])
    const words = importWords.split(/,|\r?\n/)
    words.forEach((word) => tryAddCardToList(word))
    setImportWords('')
  }

  const headerUI = () => {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: 'fit-content',
        }}
      >
        <Typography className='mainHeader' style={titleText}>
          Edit Deck
        </Typography>
        <Box className='nameAndSaveChanges' sx={titleSaveBox}>
          <TextField
            variant='outlined'
            placeholder='Name'
            className='textFieldStyle3D'
            value={deckName}
            onChange={({ target }) => {
              setDeckName(target.value)
              setNeedsSave(true)
            }}
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
            disabled={!needsSave}
          >
            {needsSave && <SaveOutlinedIcon />}
            {!needsSave && <CheckIcon />}
            {needsSave && 'Save Changes'}
            {!needsSave && 'Saved'}
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
          value='default'
          aria-label='default'
        >
          Add and Delete
        </ToggleButton>
        <ToggleButton
          sx={styleToggleButtonSX}
          value='import'
          aria-label='import'
        >
          Quick Import
        </ToggleButton>
      </ToggleButtonGroup>
    )
  }

  const submitForm = (event) => {
    event?.preventDefault()
    tryAddCardToList(cardToAdd)
    setCardToAdd('')
    setNeedsSave(true)
  }

  const addCardUI = () => {
    return (
      <form style={formStyle} onSubmit={submitForm}>
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
          <SubdirectoryArrowLeftIcon /> Add Card
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
          height: '3.13rem',
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
        <SortMenu sortBy={sortBy} setSortBy={setSortBy} />

        {/* <FormGroup sx={{ width: 'fit-content' }}>
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
        </FormGroup> */}
      </Box>
    )
  }

  const deckUI = () => {
    return (
      <div
        style={{
          width: 'calc(90VW - 6rem)',
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
            gap: '10px',
            maxHeight: '30rem',
            padding: '.2rem 1rem',
            overflow: 'auto',
            alignContent: 'start',
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
                  onClick={() => {
                    removeCard(card)
                    setNeedsSave(true)
                  }}
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
      <Box sx={{ width: 'fit-content', gap: '10px' }} className='flexColumn'>
        <Typography className='bigText' sx={{ width: 'fit-content' }}>
          Notes
        </Typography>
        <TextField
          multiline
          sx={{
            margin: '.4rem .1rem',
            width: 'calc(90VW - 6rem)',
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
          onChange={({ target }) => {
            setNotes(target.value)
            setNeedsSave(true)
          }}
          rows={4}
        ></TextField>
      </Box>
    )
  }

  const addAndDeleteStyle = () => {
    return (
      <>
        {addCardUI()}
        {deckUI()}
      </>
    )
  }

  const quickAddStyle = () => {
    return (
      <Box sx={{ gap: '10px' }} className='flexColumn'>
        <Typography className='bigText' sx={{ width: 'fit-content' }}>
          Card List
        </Typography>
        <TextField
          multiline
          value={importWords}
          onChange={({ target }) => setImportWords(target.value)}
          sx={{
            width: 'calc(90VW - 6rem)',
            justifySelf: 'center',
            backgroundColor: '#F5F5F5',
            borderRadius: '10px',
            border: '0.15rem solid #D1D1D1',
            // '& .MuiInputBase-root': {
            //   height: '33.13rem',
            // },
          }}
          placeholder='Apple, Banana, Cherry, ...'
          rows={20}
        ></TextField>
        <Box sx={{ gap: '40px', alignItems: 'center' }} className='flexRow'>
          <Button
            variant='contained'
            className='buttonStyle3D'
            sx={importButton}
            onClick={tryImportCards}
          >
            <DownloadIcon />
            Import Deck
          </Button>
          <FormGroup sx={{ width: 'fit-content' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={override}
                  onChange={(event) => setOverride(event.target.checked)}
                  sx={{ color: '#808080' }}
                />
              }
              label='Override Existing Deck'
              sx={{ color: '#3A1605' }}
              className='overrideDeckButton'
            />
          </FormGroup>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        gap: '2rem',
        display: 'flex',
        flexDirection: 'column',
        width: 'fit-content',
        justifySelf: 'center',
        marginTop: '2rem',
      }}
    >
      {headerUI()}
      {addStyleToggleUI()}
      {addStyle === 'default' && addAndDeleteStyle()}
      {addStyle === 'import' && quickAddStyle()}

      {notesUI()}
      <NotificationPopup
        message={'Deck Updated'}
        color={'success'}
        open={openPopup}
        setOpen={setOpenPopup}
      />
    </Box>
  )
}

export default MakeDeckScreen
