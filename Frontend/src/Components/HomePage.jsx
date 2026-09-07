import { Box, Button, Container, Typography } from '@mui/material'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import JoinGameDialogue from './Popups/JoinGameDialogue'
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown'

import fullScreenImageBig from '../../images/Full Screen Big.png'
import gameplayGuess from '../../images/GameplayGuess.png'
import gameplayHint from '../../images/GameplayHint.png'
import makeDeck from '../../images/MakeDeck.png'

const boxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  justifyContent: 'center',
}

const containerSX = {
  alignContent: 'center',
  spacing: '20px',
}

const tutorialSectionSX = {
  width: '80vw',
  gap: '40px',
}

const tutorialImageSX = {
  flex: '1',
  minWidth: '0',
  height: '600px',
}

const tutorialTextContainerSX = {
  flex: '1',
  justifyContent: 'center',
  gap: '20px',
}

const tutorialSectionUI = () => {
  return (
    <Box className='flexColumn' sx={{ gap: '130px', padding: '0 5vw 5vw 5vw' }}>
      <Box
        className='flexRow'
        sx={[
          tutorialSectionSX,
          { flexDirection: 'row-reverse', alignSelf: 'end' },
        ]}
      >
        <Box className='flexColumn' sx={tutorialTextContainerSX}>
          <Typography variant='h4' sx={tutorialTextHeaderSX}>
            Create your deck, or use a community deck
          </Typography>
          <Typography variant='h6' sx={tutorialTextContentSX}>
            Defuser allows you to play with any collection of words you want.{' '}
            <strong>Log in</strong> to create your own decks, or borrow a deck
            from the community. Once you start the game, cards from your deck
            will be randomly selected to form the <strong>game board.</strong>
          </Typography>
        </Box>

        <img src={makeDeck} style={tutorialImageSX} />
      </Box>

      <Box className='flexRow' sx={tutorialSectionSX}>
        <Box className='flexColumn' sx={tutorialTextContainerSX}>
          <Typography variant='h4' sx={tutorialTextHeaderSX}>
            Associate as many words as you can
          </Typography>
          <Typography variant='h6' sx={tutorialTextContentSX}>
            Players take turns; on your turn, check the{' '}
            <span style={{ color: '#286B1F' }}>green</span> cards on your{' '}
            <strong>key card.</strong> Those are your{' '}
            <strong>defusing wires.</strong> Your job is to associate as many of
            them as possible using a hint—without mentioning the words on the
            cards themselves! Send your hint to your partner, along with the{' '}
            <strong>number of cards</strong> it points to.
          </Typography>
        </Box>

        <img src={gameplayHint} style={tutorialImageSX} />
      </Box>

      <Box
        className='flexRow'
        sx={[
          tutorialSectionSX,
          { flexDirection: 'row-reverse', alignSelf: 'end' },
        ]}
      >
        <Box className='flexColumn' sx={tutorialTextContainerSX}>
          <Typography variant='h4' sx={tutorialTextHeaderSX}>
            Defuse by guessing your partner’s cards
          </Typography>
          <Typography variant='h6' sx={tutorialTextContentSX}>
            Once you receive a hint from your partner, it’s up to you to{' '}
            <strong>defuse</strong> by guessing which cards they mean. A
            <strong>successful defusal</strong> means you can either defuse
            again, or if you’ve run out of hints, <strong>end your turn</strong>
            . A <strong>mistake</strong> ends your turn. Defusals are shared
            across the entire board—once a card is guessed, it’s out of the
            game!
          </Typography>
        </Box>

        <img src={gameplayGuess} style={tutorialImageSX} />
      </Box>

      <Box className='flexRow' sx={tutorialSectionSX}>
        <Box className='flexColumn' sx={tutorialTextContainerSX}>
          <Typography variant='h4' sx={tutorialTextHeaderSX}>
            Race the clock to defuse—but don’t blow up!
          </Typography>
          <Typography variant='h6' sx={tutorialTextContentSX}>
            If you manage to defuse all your cards within the round limit,{' '}
            <strong>you win!</strong> But be careful—if your partner guesses one
            of your <strong>black</strong> cards with{' '}
            <span style={{ color: '#B43131' }}>red</span> text, they’ve
            triggered a <strong>bomb</strong> and it’s{' '}
            <strong>game over!</strong> To avoid an explosive fate, make sure
            none of your hints can be associated with a bomb. Good luck, and
            have fun defusing!
          </Typography>
        </Box>

        <img src={gameplayHint} style={tutorialImageSX} />
      </Box>
    </Box>
  )
}

const tutorialTextHeaderSX = {
  fontWeight: 'bold',
  color: '#834724',
}

const tutorialTextContentSX = {
  color: '#3A1605',
}

const HomePage = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Box sx={{ overflow: 'hidden' }}>
        <Box
          id='backgroundImage'
          sx={{
            width: '140vw',
            height: '32.6vw',
            backgroundImage: `url(${fullScreenImageBig})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            justifySelf: 'center',
          }}
        ></Box>
      </Box>

      <Box className='content'>
        <Box
          className='mainContent flexColumn'
          sx={{ height: 'calc(93vh - 33vw)' }}
        >
          <div
            className={'background'}
            style={{ backgroundColor: '#FFF8E9' }}
          ></div>
          <Container className='homePage' sx={containerSX}>
            <Box sx={boxStyle}>
              <Button
                className='StartGameButton buttonStyle3D'
                variant='contained'
                component={Link}
                to='/startgame'
              >
                Start Game
              </Button>
              <Button
                className='JoinGameButton buttonStyle3D'
                variant='contained'
                onClick={() => setOpen(true)}
              >
                Join Game
              </Button>
            </Box>
          </Container>
          <Box
            className='flexColumn'
            sx={{ alignItems: 'center', marginTop: 'auto' }}
          >
            <Typography
              sx={{ fontSize: '2rem', color: '#834724', fontWeight: 'bold' }}
            >
              HOW TO PLAY
            </Typography>
            <KeyboardDoubleArrowDownIcon
              sx={{ fontSize: '4rem', color: '#834724' }}
            />
          </Box>
        </Box>

        <JoinGameDialogue open={open} setOpen={setOpen} />
      </Box>

      {tutorialSectionUI()}
    </>
  )
}

export default HomePage
