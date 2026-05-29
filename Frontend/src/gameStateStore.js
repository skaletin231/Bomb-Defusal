import { create } from 'zustand'

const useGameStateStore = create((set, get) => ({
  board: [],
  currentPlayer: -1,
  playerTurn: -1,
  players: [-1, -2],
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
    setPlayer: (newPlayer) => {
      const players = get().players
      set(() => ({ currentPlayer: players[newPlayer] }))
    },
  },
}))

export const useGameStateActions = () =>
  useGameStateStore((state) => state.actions)

export const useGameStateCurrentPlayer = () =>
  useGameStateStore((state) => state.currentPlayer)
