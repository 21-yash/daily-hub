
import React from 'react';

const MemoryMatch = ({ 
  memoryCards, 
  flippedCards, 
  matchedCards, 
  memoryMoves, 
  gameWon,
  onCardClick, 
  onNewGame,
  theme,
  cardBg,
  borderColor,
  textSecondary
}) => {
  return (
    <div className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Memory Match 🧠</h3>
        <div className="flex items-center gap-4">
          <span className={textSecondary}>Moves: {memoryMoves}</span>
          <button
            onClick={onNewGame}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95"
          >
            New Game
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
        {memoryCards.map(card => (
          <button
            key={card.id}
            onClick={() => onCardClick(card.id)}
            disabled={matchedCards.includes(card.id)}
            className={`aspect-square text-4xl rounded-xl transition-all duration-300 ${
              flippedCards.includes(card.id) || matchedCards.includes(card.id)
                ? theme === 'dark' ? 'bg-blue-600' : 'bg-blue-400'
                : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'
            } ${matchedCards.includes(card.id) ? 'opacity-50' : ''}`}
          >
            {(flippedCards.includes(card.id) || matchedCards.includes(card.id)) ? card.emoji : '?'}
          </button>
        ))}
      </div>

      {gameWon && (
        <div className="mt-6 p-4 bg-green-500 text-white rounded-lg text-center">
          <p className="text-xl font-bold">🎉 You Won!</p>
          <p>Completed in {memoryMoves} moves</p>
        </div>
      )}
    </div>
  );
};

export default MemoryMatch;
