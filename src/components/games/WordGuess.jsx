import React from 'react';

const WordGuess = ({
  guesses,
  currentGuess,
  gameStatus,
  onNewGame,
  cardBg,
  borderColor,
  textSecondary
}) => {
  const totalGuesses = 6;

  const getTileClass = (letter, index, guess) => {
    if (!guess.evaluation) return theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'; // Not yet evaluated
    
    const status = guess.evaluation[index];
    if (status === 'correct') return 'bg-green-600 text-white'; // Correct position
    if (status === 'present') return 'bg-yellow-500 text-white'; // Present but wrong position
    return 'bg-gray-500 text-white'; // Absent
  };

  return (
    <div className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Word Guess 🟩🟨</h3>
        <button
          onClick={onNewGame}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95"
        >
          New Game
        </button>
      </div>

      <div className="grid grid-rows-6 gap-2 max-w-xs mx-auto mb-6">
        {Array.from({ length: totalGuesses }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, colIndex) => {
              const guess = guesses[rowIndex];
              const letter = guess ? guess.word[colIndex] : (rowIndex === guesses.length) ? currentGuess[colIndex] : '';
              return (
                <div
                  key={colIndex}
                  className={`aspect-square text-3xl font-bold uppercase rounded-md flex items-center justify-center border ${borderColor} transition-colors duration-500
                    ${guess ? getTileClass(letter, colIndex, guess) : ''}`}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {gameStatus !== 'playing' && (
        <div className={`mt-6 p-4 ${gameStatus === 'won' ? 'bg-green-500' : 'bg-red-500'} text-white rounded-lg text-center`}>
          <p className="text-xl font-bold">{gameStatus === 'won' ? '🎉 You Won!' : '😢 Nice Try!'}</p>
          <p>Click "New Game" to play again.</p>
        </div>
      )}
    </div>
  );
};

export default WordGuess;