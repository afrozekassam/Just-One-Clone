import React, { useState } from 'react';

function App() {
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);
  const [guesserIndex, setGuesserIndex] = useState(0);
  const [clues, setClues] = useState({});
  const [mysteryWord, setMysteryWord] = useState('');
  const [guess, setGuess] = useState('');
  const [phase, setPhase] = useState('setup'); // setup, clueEntry, guessing, result

  const wordList = ['tree', 'ocean', 'book', 'apple', 'moon'];

  const addPlayer = () => {
    if (playerName.trim() !== '' && !players.includes(playerName)) {
      setPlayers([...players, playerName]);
      setPlayerName('');
    }
  };

  const removePlayer = (name) => {
    setPlayers(players.filter((player) => player !== name));
  };

  function getValidClues() {
    const clueCounts = {};
    Object.values(clues).forEach((clue) => {
      const lower = clue.trim().toLowerCase();
      if (lower) {
        clueCounts[lower] = (clueCounts[lower] || 0) + 1;
      }
    });
    return Object.entries(clues).filter(([player, clue]) => {
      return clueCounts[clue.trim().toLowerCase()] === 1;
    });
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: 'auto' }}>
      <h1>Just One Game</h1>

      {/* SETUP PHASE */}
      {phase === 'setup' && (
        <>
          <input
            type="text"
            placeholder="Enter player name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button onClick={addPlayer}>Add Player</button>

          <h2>Players:</h2>
          <ul>
            {players.map((p, i) => (
              <li key={i}>
                {p}
                <button onClick={() => removePlayer(p)}>X</button>
              </li>
            ))}
          </ul>

          <h2>Guesser:</h2>
          <select
            value={guesserIndex}
            onChange={(e) => setGuesserIndex(Number(e.target.value))}
          >
            {players.map((player, index) => (
              <option key={index} value={index}>
                {player}
              </option>
            ))}
          </select>

          {players.length >= 3 && (
            <button
              onClick={() => {
                const randomWord =
                  wordList[Math.floor(Math.random() * wordList.length)];
                setMysteryWord(randomWord);
                setClues({});
                setGuess('');
                setPhase('clueEntry');
              }}
            >
              Start Game
            </button>
          )}
        </>
      )}

      {/* CLUE ENTRY PHASE */}
      {phase === 'clueEntry' && (
        <>
          <h2>Submit Clues</h2>
          {players.map((player, index) => {
            if (index === guesserIndex) return null;
            return (
              <div key={player}>
                <p><strong>Word for {player}:</strong> {mysteryWord}</p>
                <label>{player}:</label>
                <input
                  type="text"
                  placeholder="Enter clue"
                  value={clues[player] || ''}
                  onChange={(e) => {
                    setClues({ ...clues, [player]: e.target.value });
                  }}
                />
              </div>
            );
          })}
          <button onClick={() => setPhase('guessing')}>
            Done Submitting Clues
          </button>
        </>
      )}

      {/* GUESSING PHASE */}
      {phase === 'guessing' && (
        <>
          <h2>Clues for Guesser</h2>
          <ul>
            {getValidClues().map(([player, clue]) => (
              <li key={player}>{clue}</li>
            ))}
          </ul>

          <h2>Guesser’s Turn</h2>
          <input
            type="text"
            placeholder="Enter your guess"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
          />
          <button onClick={() => setPhase('result')}>Submit Guess</button>
        </>
      )}

      {/* RESULT PHASE */}
      {phase === 'result' && (
        <>
          <h2>Result</h2>
          {guess.trim().toLowerCase() === mysteryWord.toLowerCase() ? (
            <p>🎉 Correct! The word was: {mysteryWord}</p>
          ) : (
            <p>❌ Wrong! The word was: {mysteryWord}</p>
          )}
          <button onClick={() => setPhase('setup')}>Play Again</button>
        </>
      )}
    </div>
  );
}

export default App;
