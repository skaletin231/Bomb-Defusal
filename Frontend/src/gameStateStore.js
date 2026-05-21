import { create } from 'zustand'

const useGameStateStore = create((set, get) => ({
  board: [],
  playerTurn: -1,
  players: [-1, -2],
  gameOver: false,
  actions: {
    revealCard: (spotToReveal) => {
      const currentPlayer = get().playerTurn
      const players = get().players
      const typeToReveal =
        currentPlayer.id === players[0].id
          ? spotToReveal.player1Type
          : spotToReveal.player2Type

      set((state) => ({
        board: state.board.map((spot) =>
          spot.word === spotToReveal.word
            ? { ...spotToReveal, typeRevealed: typeToReveal, revealed: true }
            : spot,
        ),
      }))
    },
    resetGame: () => {
      console.log('reset')
    },
    setBoard: (board) => {
      set(() => ({ board: board }))
    },
    setPlayersTurn: (player) => {
      set(() => ({ playerTurn: player }))
    },
    setPlayers: (players) => {
      set(() => ({ players: players }))
    },
    endTurn: () => {
      const currentPlayer = get().playerTurn
      const players = get().players

      if (currentPlayer.id === players[0].id) {
        set(() => ({ playerTurn: players[1] }))
      } else {
        set(() => ({ playerTurn: players[0] }))
      }
    },
  },
}))

export const useGameStateBoard = () => useGameStateStore((state) => state.board)

export const useGameStateGameOver = () =>
  useGameStateStore((state) => state.gameOver)

export const useGameStateTurn = () =>
  useGameStateStore((state) => state.playerTurn)

export const useGameStateActions = () =>
  useGameStateStore((state) => state.actions)

/*
  board{
    card1{
      word: someWord
      thisPlayer: type
      typeRevealed: type/null
      revealed: false
    }
    card2{
      word: someOtherWord
      thisPlayer: type
      typeRevealed: tpye/null
      revealed: true
    }
  }
*/
