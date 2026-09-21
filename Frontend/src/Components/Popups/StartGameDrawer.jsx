import { useMutation } from '@apollo/client/react'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import RemoveIcon from '@mui/icons-material/Remove'
import VisibilityIcon from '@mui/icons-material/Visibility'
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
  Typography,
} from '@mui/material'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ME, START_GAME } from '../../queries'

const hintCountButtonStyling = {
  minWidth: '0px',
  height: '2em',
  width: '2em',
}

const hintCountBox = {
  position: 'relative',
  width: '50px',
  height: '40px',
  background: 'white',
  border: '.15rem solid #84582E',
  borderRadius: '10px',
  alignContent: 'center',
  '&:after': {
    content: '""',
    position: 'absolute',
    top: '4px',
    left: '-2px',
    right: '-2px',
    bottom: '-8px',
    display: 'block',
    border: '.15rem solid #84582E',
    backgroundColor: '#E1E1E1',
    borderRadius: '10px',
    zIndex: '-1',
  },
}

const textFieldSX = {
  height: '100%',
  width: '100%',
  '& .MuiOutlinedInput-root': {
    height: '100%',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}

const boxCountSX = {
  display: 'flex',
  flexDirection: 'row',
  gap: '10px',
  alignItems: 'center',
}

export default function StartGameDrawer({
  open,
  setSelectedDeck,
  selectedDeck,
  canEdit,
}) {
  const location = useLocation()
  // const [gridSizeX, setGridSizeX] = useState(5)
  // const [gridSizeY, setGridSizeY] = useState(5)

  const [mistakeLimitExists, setMistakeLimitExists] = useState(false)
  const [roundLimit, setRoundLimit] = useState(9)
  const [mistakeLimit, setMistakeLimit] = useState(0)
  const [wordLimit, setWordLimit] = useState(1)

  const navigate = useNavigate()

  const [startGame] = useMutation(START_GAME, {
    refetchQueries: [ME],
  })

  const handleSubmit = async (event) => {
    event.preventDefault()

    const result = await startGame({
      variables: {
        deckID: selectedDeck.id,
        mistakeLimit: mistakeLimitExists ? mistakeLimit : -1,
        turnLimit: roundLimit,
      },
    })

    if (result.data === null || result.data === undefined) return

    navigate(`/playing/${result.data.startGame}`)
  }

  //is there any way to smartly do this?
  const updateRoundLimit = (change) => {
    setRoundLimit(Math.max(Number(roundLimit) + change, 2))
  }

  const updateMistakeLimit = (change) => {
    setMistakeLimit(Math.max(Number(mistakeLimit) + change, 0))
  }

  const updateWordLimit = (change) => {
    setWordLimit(Math.max(Number(wordLimit) + change, 1))
  }

  const cleanUpNumber = (number) => {
    const rawValue = number
    const cleanValue = rawValue.replace(/[^0-9]/g, '')
    return cleanValue
  }

  const mistakeLimitUI = () => {
    return (
      <>
        <Typography>Limit</Typography>

        <Box className='HintCount' sx={boxCountSX}>
          <Button
            sx={hintCountButtonStyling}
            className='DownButton'
            onClick={() => updateMistakeLimit(-1)}
          >
            <RemoveIcon sx={{ color: '#84582E' }} />
          </Button>
          <Box className='hintCountBox' sx={hintCountBox}>
            <TextField
              value={mistakeLimit}
              onChange={(e) => setMistakeLimit(cleanUpNumber(e.target.value))}
              sx={textFieldSX}
            />
          </Box>

          <Button
            sx={hintCountButtonStyling}
            className='UpButton'
            onClick={() => updateMistakeLimit(1)}
          >
            <AddIcon sx={{ color: '#84582E' }} />
          </Button>
        </Box>
      </>
    )
  }

  const setDefaults = () => {
    //setGridSizeX(5)
    //setGridSizeY(5)
    setMistakeLimitExists(false)
    setRoundLimit(9)
    setMistakeLimit(0)
    setWordLimit(1)
  }

  return (
    <Drawer
      anchor='right'
      open={open}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px 0 0 20px',
            border: '0.3rem solid #84582E',
            borderWidth: '0 0 0 0.3rem',
            backgroundColor: '#FFF8E9',
          },
        },
      }}
      onClose={() => setSelectedDeck(null)}
    >
      <Box sx={{ width: 400, p: 3, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ gap: '30px' }} id='InnerBox' className='flexColumn'>
          <Box className='flexRow'>
            <Box className='flexColumn'>
              <Typography className='biggerText'>
                {selectedDeck?.name}
              </Typography>
              <Typography className='grayText' sx={{ whiteSpace: 'pre' }}>
                by{' '}
                <span style={{ color: '#3A1605' }}>
                  {selectedDeck?.owner?.username}
                </span>
                {'   •   '}
                <span style={{ color: '#3A1605' }}>
                  {selectedDeck?.cards.length}
                </span>{' '}
                cards
              </Typography>
            </Box>
            <Box
              className='flexRow'
              sx={{ flexGrow: '1', justifyContent: 'center' }}
            >
              <Button
                component={Link}
                to={`/decks/${selectedDeck?.id}`}
                state={{ from: location.pathname }}
              >
                <VisibilityIcon sx={{ color: '#84582E' }} />
              </Button>
              {canEdit && (
                <Button component={Link} to={`/mydecks/${selectedDeck?.id}`}>
                  <EditIcon sx={{ color: '#84582E' }} />
                </Button>
              )}
            </Box>
          </Box>

          {/* <Box id='gridSize'>
            <Typography>Grid Size</Typography>
            <Box sx={{ gap: '10px', alignItems: 'center' }} className='flexRow'>
              <Select
                sx={hintCountBox}
                value={gridSizeX}
                onChange={(e) => setGridSizeX(e.target.value)}
              >
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={4}>4</MenuItem>
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={6}>6</MenuItem>
                <MenuItem value={7}>7</MenuItem>
              </Select>

              <Typography> X </Typography>

              <Select
                sx={hintCountBox}
                value={gridSizeY}
                onChange={(e) => setGridSizeY(e.target.value)}
              >
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={4}>4</MenuItem>
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={6}>6</MenuItem>
                <MenuItem value={7}>7</MenuItem>
              </Select>
            </Box>
          </Box> */}

          <Box id='roundLimit'>
            <Typography>Round Limit</Typography>
            <Box className='HintCount' sx={boxCountSX}>
              <Button
                sx={hintCountButtonStyling}
                className='DownButton'
                onClick={() => updateRoundLimit(-1)}
              >
                <RemoveIcon sx={{ color: '#84582E' }} />
              </Button>
              <Box className='hintCountBox' sx={hintCountBox}>
                <TextField
                  value={roundLimit}
                  onChange={(e) => setRoundLimit(cleanUpNumber(e.target.value))}
                  sx={textFieldSX}
                />
              </Box>

              <Button
                sx={hintCountButtonStyling}
                className='UpButton'
                onClick={() => updateRoundLimit(1)}
              >
                <AddIcon sx={{ color: '#84582E' }} />
              </Button>
            </Box>
          </Box>

          <Box id='mistakeLimit'>
            <FormGroup sx={{ width: 'fit-content' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={mistakeLimitExists}
                    onChange={(event) =>
                      setMistakeLimitExists(event.target.checked)
                    }
                    sx={{ color: '#808080' }}
                  />
                }
                label='Add Mistake Limit'
                sx={{ color: '#3A1605' }}
                className='overrideDeckButton'
              />
            </FormGroup>
            {mistakeLimitExists && mistakeLimitUI()}
          </Box>

          <Box id='wordLimit'>
            <Typography>Words Per Hint</Typography>
            <Box className='HintCount' sx={boxCountSX}>
              <Button
                sx={hintCountButtonStyling}
                className='DownButton'
                onClick={() => updateWordLimit(-1)}
              >
                <RemoveIcon sx={{ color: '#84582E' }} />
              </Button>
              <Box className='hintCountBox' sx={hintCountBox}>
                <TextField
                  value={wordLimit}
                  onChange={(e) => setWordLimit(cleanUpNumber(e.target.value))}
                  sx={textFieldSX}
                />
              </Box>

              <Button
                sx={hintCountButtonStyling}
                className='UpButton'
                onClick={() => updateWordLimit(1)}
              >
                <AddIcon sx={{ color: '#84582E' }} />
              </Button>
            </Box>
          </Box>

          <Button
            sx={{ width: 'fit-content', color: '#84582E' }}
            onClick={setDefaults}
          >
            Restore Defaults
          </Button>

          <Button
            variant='contained'
            sx={{ '&&': { width: '250px', fontSize: '1.5rem' } }}
            className='buttonStyle3D'
            onClick={handleSubmit}
          >
            Start Game!
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}
