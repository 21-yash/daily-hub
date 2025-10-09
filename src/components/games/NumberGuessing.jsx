
import React from 'react';

const NumberGuessing = ({
  guessNumber,
  guessAttempts,
  guessHistory,
  gameWon,
  onGuess,
  onNewGame,
  onInputChange,
  theme,
  cardBg,
  borderColor,
  textSecondary
}) => {
  return (
    <div className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Number Guessing 🔢</h3>
        <div className="flex items-center gap-4">
          <span className={textSecondary}>Attempts: {guessAttempts}</span>
          <button
            onClick={onNewGame}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95"
          >
            New Game
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <p className={`text-center mb-4 ${textSecondary}`}>
          Guess a number between 1 and 100
        </p>
        
        {!gameWon && (
          <div className="flex gap-2 mb-6">
            <input
              type="number"
              value={guessNumber}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onGuess()}
              placeholder="Enter your guess"
              min="1"
              max="100"
              className={`flex-1 px-4 py-3 rounded-lg ${cardBg} border ${borderColor} text-center text-2xl`}
            />
            <button
              onClick={onGuess}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95"
            >
              Guess
            </button>
          </div>
        )}

        {gameWon && (
          <div className="mb-6 p-4 bg-green-500 text-white rounded-lg text-center">
            <p className="text-xl font-bold">🎉 Correct!</p>
            <p>You found the number in {guessAttempts} attempts</p>
          </div>
        )}

        <div className="space-y-2">
          {guessHistory.map((entry, idx) => (
            <div key={idx} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">{entry.guess}</span>
                <span className={textSecondary}>{entry.hint}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NumberGuessing;
