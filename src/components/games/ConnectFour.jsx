
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

  const getStatusColor = () => {
    if (winner === 'player') return 'text-blue-500';
    if (winner === 'ai') return 'text-red-500';
    if (winner === 'draw') return 'text-yellow-500';
    return currentPlayer === 'player' ? 'text-blue-500' : 'text-red-500';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🔵🔴 Connect Four
        </h2>
        <button
          onClick={onNewGame}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          New Game
        </button>
      </div>

      {/* Status Card */}
      <div className={`${cardBg} p-4 rounded-2xl border ${borderColor} text-center`}>
        <p className={`text-xl font-bold ${getStatusColor()}`}>
          {getStatusMessage()}
        </p>
      </div>

      {/* Game Board */}
      <div className={`${cardBg} p-4 rounded-2xl border ${borderColor}`}>
        <div className="flex justify-center">
          <div className={`inline-grid grid-cols-7 gap-1 p-3 rounded-2xl border ${borderColor} bg-gradient-to-br from-blue-500/10 to-red-500/10`}>
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => onColumnClick(colIndex)}
                  disabled={winner !== null}
                  className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-transform active:scale-95 ${
                    winner === null ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full transition-all duration-300 shadow-lg ${
                      cell === 'player' 
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/50' 
                        : cell === 'ai' 
                        ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/50' 
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  />
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Game Info */}
      <div className={`${cardBg} p-4 rounded-2xl border ${borderColor}`}>
        <h3 className="font-bold mb-3">How to Play</h3>
        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></span>
            You are Blue - tap any column to drop your piece
          </p>
          <p className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-gradient-to-br from-red-400 to-red-600"></span>
            Computer is Red - plays automatically
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            🎯 Connect 4 pieces in a row (horizontally, vertically, or diagonally) to win!
          </p>
        </div>
      </div>

      {/* Winner Banner */}
      {winner && (
        <div className={`${cardBg} p-4 rounded-2xl border-2 ${
          winner === 'player' ? 'border-blue-500 bg-blue-500/10' :
          winner === 'ai' ? 'border-red-500 bg-red-500/10' :
          'border-yellow-500 bg-yellow-500/10'
        } animate-pop-up`}>
          <p className="text-center text-lg font-bold">
            {winner === 'player' && '🎉 Congratulations! You won!'}
            {winner === 'ai' && '🤖 Computer wins! Try again?'}
            {winner === 'draw' && '🤝 It\'s a draw! Well played!'}
          </p>
          <button
            onClick={onNewGame}
            className={`w-full mt-3 px-4 py-2 ${
              winner === 'player' ? 'bg-blue-500' :
              winner === 'ai' ? 'bg-red-500' :
              'bg-yellow-500'
            } text-white rounded-xl font-medium hover:opacity-90 transition-opacity`}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectFour;
