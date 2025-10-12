import React from 'react';

const TicTacToe = ({
  board,
  winner,
  currentPlayer,
  onCellClick,
  onNewGame,
  theme,
  cardBg,
  borderColor,
  textSecondary
}) => {
  const getStatusMessage = () => {
    if (winner) {
      return winner === 'Draw' ? `It's a Draw! 🤝` : `Player ${winner} Wins! 🎉`;
    }
    return `Player ${currentPlayer}'s Turn`;
  };

  return (
    <div className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Tic-Tac-Toe ⭕❌</h3>
        <button
          onClick={onNewGame}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95"
        >
          New Game
        </button>
      </div>

      <div className="text-center mb-4 text-xl font-semibold">{getStatusMessage()}</div>

      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
        {board.map((value, index) => (
          <button
            key={index}
            onClick={() => onCellClick(index)}
            disabled={value !== null || winner}
            className={`aspect-square text-5xl font-bold rounded-xl transition-colors duration-200 flex items-center justify-center ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700' : 'bg-gray-300 hover:bg-gray-400 disabled:bg-gray-300'
            }`}
          >
            {value === 'X' ? '❌' : value === 'O' ? '⭕' : ''}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TicTacToe;