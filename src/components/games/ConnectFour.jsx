import React from 'react';

const ConnectFour = ({
  board,
  winner,
  currentPlayer,
  onColumnClick,
  onNewGame,
  cardBg,
  borderColor
}) => {
  const getStatusMessage = () => {
    if (winner) {
      if (winner === 'draw') return "It's a Draw! 🤝";
      return winner === 'player' ? 'You Win! 🎉' : 'Computer Wins 🤖';
    }
    return currentPlayer === 'player' ? "Your Turn 🔵" : "Computer's Turn 🔴";
  };

  return (
    <div className={`${cardBg} p-6 rounded-xl border ${borderColor} text-center`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">Connect Four 🔵🔴</h3>
        <button
          onClick={onNewGame}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95"
        >
          New Game
        </button>
      </div>
      
      <div className="text-center mb-4 text-xl font-semibold">{getStatusMessage()}</div>

      <div className={`inline-grid grid-cols-7 gap-1 p-2 rounded-lg ${borderColor} bg-gray-400 dark:bg-gray-900`}>
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => onColumnClick(colIndex)}
              className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center cursor-pointer"
            >
              <div
                className={`w-10 h-10 md:w-14 md:h-14 rounded-full transition-colors duration-300
                  ${cell === 'player' ? 'bg-blue-500' : cell === 'ai' ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'}`}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConnectFour;