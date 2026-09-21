import { gql } from '@apollo/client'
import { useMutation, useQuery } from '@apollo/client/react'
import '@fontsource/suwannaphum'
import { useState } from 'react'
import { COPY_DECK, GET_MY_DECKS, REMOVE_DECK } from '../queries'
import DeckObject from './DeckObject'
import ConfirmDeleteDialogue from './Popups/ConfrimDeleteDialogue'
import NotificationPopup from './Popups/NotificationPopup'

export default function ListOfMyDecks({ setSelectedDeck }) {
  const [openCreatePopup, setOpenCreatePopup] = useState(false)
  const [openRemovePopup, setOpenRemovePopup] = useState(false)

  const [deckToDelete, setDeckToDelete] = useState(null)
  const deckResults = useQuery(GET_MY_DECKS)

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

      setOpenRemovePopup(true)
    },
    onError: (error) => {
      console.log(error.message)
    },
  })

  if (deckResults.loading) return <div>LOADING...</div>

  if (!deckResults.data) return <></>

  const decks = deckResults.data.getMyDecks

  const tryMakeCopy = async (deckID) => {
    await copyDeck({
      variables: {
        deckID: deckID,
      },
    })
  }

  const tryRemoveDeck = async () => {
    await removeDeck({
      variables: {
        deckID: deckToDelete,
      },
    })
    setDeckToDelete(null)
  }

  return (
    <>
      {decks.map((deck, i) => (
        <DeckObject
          key={i}
          deck={deck}
          type={'mine'}
          tryMakeDeck={tryMakeCopy}
          setDeckToDelete={setDeckToDelete}
          setSelectedDeck={setSelectedDeck}
        />
      ))}

      <ConfirmDeleteDialogue
        open={deckToDelete !== null}
        onConfirm={tryRemoveDeck}
        setTracker={setDeckToDelete}
      />

      <NotificationPopup
        message={'Deck Removed'}
        color={'success'}
        open={openRemovePopup}
        setOpen={setOpenRemovePopup}
      />

      <NotificationPopup
        message={'Deck Created'}
        color={'success'}
        open={openCreatePopup}
        setOpen={setOpenCreatePopup}
      />
    </>
  )
}
