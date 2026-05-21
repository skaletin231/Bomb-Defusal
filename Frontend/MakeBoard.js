import { useGameStateActions } from './src/gameStateStore'

export const MakeBoard = (deck) => {
  //bomb - bomb: 1 -> 1
  //bomb - wire: 1 -> 2
  //bomb - dud: 1 -> 3
  //wire - bomb: 1 -> 4
  //wire - wire: 3 -> 5, 6, 7
  //wire - dud: 5 -> 8, 9, 10, 11, 12
  //dud - bomb: 1 -> 13
  //dud - wire: 5 -> 14, 15, 16, 17, 18
  //dud - dud: 7 -> 19, 20, 21, 22, 23, 24 ,25

  const spots = getUniqueRandomNumbers(25, 25)
  const wordChoice = getUniqueRandomNumbers(25, deck.length)

  const { setBoard } = useGameStateActions()
  const fromEmpty = () => ({
    word: '',
    player1Type: null,
    player2Type: null,
    typeRevealed: null,
    revealed: false,
  })

  const board = Array.from({ length: 25 }, fromEmpty)

  const player1Bombs = [spots[0], spots[1], spots[2]]
  const player1Wires = [
    spots[3],
    spots[4],
    spots[5],
    spots[6],
    spots[7],
    spots[8],
    spots[9],
    spots[10],
    spots[11],
  ]
  const player1Duds = [
    spots[12],
    spots[13],
    spots[14],
    spots[15],
    spots[16],
    spots[17],
    spots[18],
    spots[19],
    spots[20],
    spots[21],
    spots[22],
    spots[23],
    spots[24],
  ]

  const player2Bombs = [spots[0], spots[3], spots[12]]
  const player2Wires = [
    spots[1],
    spots[4],
    spots[5],
    spots[6],
    spots[13],
    spots[14],
    spots[15],
    spots[16],
    spots[17],
  ]
  const player2Duds = [
    spots[2],
    spots[7],
    spots[8],
    spots[9],
    spots[10],
    spots[11],
    spots[18],
    spots[19],
    spots[20],
    spots[21],
    spots[22],
    spots[23],
    spots[24],
  ]

  player1Bombs.forEach((index) => {
    board[index].player1Type = 'bomb'
  })
  player1Wires.forEach((index) => {
    board[index].player1Type = 'wire'
  })
  player1Duds.forEach((index) => {
    board[index].player1Type = 'dud'
  })
  player2Bombs.forEach((index) => {
    board[index].player2Type = 'bomb'
  })
  player2Wires.forEach((index) => {
    board[index].player2Type = 'wire'
  })
  player2Duds.forEach((index) => {
    board[index].player2Type = 'dud'
  })

  wordChoice.forEach((word, i) => {
    board[i].word = deck[word]
  })

  setBoard(board)

  //old way
  // const card1 = {
  //   bomb: [spots[0], spots[1], spots[2]],
  //   wire: [
  //     spots[3],
  //     spots[4],
  //     spots[5],
  //     spots[6],
  //     spots[7],
  //     spots[8],
  //     spots[9],
  //     spots[10],
  //     spots[11],
  //   ],
  //   dud: [
  //     spots[12],
  //     spots[13],
  //     spots[14],
  //     spots[15],
  //     spots[16],
  //     spots[17],
  //     spots[18],
  //     spots[19],
  //     spots[20],
  //     spots[21],
  //     spots[22],
  //     spots[23],
  //     spots[24],
  //   ],
  // }

  // const card2 = {
  //   bomb: [spots[0], spots[3], spots[12]],
  //   wire: [
  //     spots[1],
  //     spots[4],
  //     spots[5],
  //     spots[6],
  //     spots[13],
  //     spots[14],
  //     spots[15],
  //     spots[16],
  //     spots[17],
  //   ],
  //   dud: [
  //     spots[2],
  //     spots[7],
  //     spots[8],
  //     spots[9],
  //     spots[10],
  //     spots[11],
  //     spots[18],
  //     spots[19],
  //     spots[20],
  //     spots[21],
  //     spots[22],
  //     spots[23],
  //     spots[24],
  //   ],
  // }

  //return { card1: card1, card2: card2 }
}

export function getUniqueRandomNumbers(x, n) {
  if (x > n) throw new Error('x cannot be greater than n')

  const arr = Array.from({ length: n }, (_, i) => i)

  for (let i = n - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * i)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }

  return arr.slice(0, x)
}
