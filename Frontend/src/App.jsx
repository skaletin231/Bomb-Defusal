import { useState } from 'react'
import GameScreen from './Components/GameScreen'

function App() {
  const [inGame, setInGame] = useState(false)

  if (inGame) return <GameScreen setInGame={setInGame} />

  return <button onClick={() => setInGame(true)}>Start Game</button>
}

export default App
