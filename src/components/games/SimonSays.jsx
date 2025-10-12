import React from 'react';

const SimonSays = ({
  sequence,
  playerTurn,
  gameStatus,
  litButton,
  onButtonClick,
  onNewGame,
  cardBg,
  borderColor,
  textSecondary
}) => {
  const colors = ['green', 'red', 'yellow', 'blue'];

  const getButtonClass = (color) => {
    const isLit = litButton === color;
    
    const colorClasses = {
      green: isLit 
        ? 'bg-green-400 shadow-[0_0_40px_rgba(34,197,94,0.8)] scale-110 ring-4 ring-green-300' 
        : 'bg-green-600 shadow-lg',
      red: isLit 
        ? 'bg-red-400 shadow-[0_0_40px_rgba(239,68,68,0.8)] scale-110 ring-4 ring-red-300' 
        : 'bg-red-600 shadow-lg',
      yellow: isLit 
        ? 'bg-yellow-300 shadow-[0_0_40px_rgba(250,204,21,0.8)] scale-110 ring-4 ring-yellow-200' 
        : 'bg-yellow-500 shadow-lg',
      blue: isLit 
        ? 'bg-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.8)] scale-110 ring-4 ring-blue-300' 
        : 'bg-blue-600 shadow-lg',
    };

    const hoverClasses = {
      green: 'hover:bg-green-500',
      red: 'hover:bg-red-500',
      yellow: 'hover:bg-yellow-400',
      blue: 'hover:bg-blue-500',
    };

    return `${colorClasses[color]} ${playerTurn && gameStatus === 'playing' ? hoverClasses[color] : ''}`;
  };

  const getStatusMessage = () => {
    if (gameStatus === 'lost') return `Game Over! You reached level ${sequence.length}.`;
    if (playerTurn) return '🎮 Your Turn - Repeat the sequence!';
    return '👀 Watch carefully...';
  };

  const getStatusColor = () => {
    if (gameStatus === 'lost') return 'text-red-500';
    if (playerTurn) return 'text-green-500';
    return 'text-blue-500';
  };

  return (
    <div className={`${cardBg} p-8 rounded-xl border ${borderColor} text-center`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-3xl font-bold">Simon Says 🚥</h3>
        <button
          onClick={onNewGame}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg transition-all duration-200 hover:from-blue-600 hover:to-purple-700 hover:scale-105 active:scale-95 shadow-lg font-semibold"
        >
          {gameStatus === 'playing' ? '🔄 Restart' : '🎮 New Game'}
        </button>
      </div>

      <div className="mb-8 space-y-2">
        <div className="flex items-center justify-center gap-3">
          <p className="text-4xl font-bold text-purple-500">
            Level {sequence.length}
          </p>
          {sequence.length > 3 && (
            <span className="text-2xl animate-bounce">🔥</span>
          )}
        </div>
        <p className={`text-xl font-semibold ${getStatusColor()} transition-colors duration-300`}>
          {getStatusMessage()}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-md mx-auto aspect-square mb-6">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => {
              if (playerTurn && gameStatus === 'playing') {
                onButtonClick(color);
              }
            }}
            disabled={!playerTurn || gameStatus !== 'playing'}
            className={`
              w-full h-full rounded-2xl 
              transition-all duration-200 
              ${getButtonClass(color)} 
              disabled:opacity-40 disabled:cursor-not-allowed
              active:scale-95
              relative overflow-hidden
            `}
          >
            {/* Pulse effect when lit */}
            {litButton === color && (
              <div className="absolute inset-0 animate-ping opacity-75 rounded-2xl bg-white"></div>
            )}
            
            {/* Color indicator emoji */}
            <span className="text-4xl relative z-10">
              {color === 'green' && '🟢'}
              {color === 'red' && '🔴'}
              {color === 'yellow' && '🟡'}
              {color === 'blue' && '🔵'}
            </span>
          </button>
        ))}
      </div>

      {/* Game Over Stats */}
      {gameStatus === 'lost' && sequence.length > 0 && (
        <div className={`mt-6 p-4 rounded-lg ${cardBg} border-2 border-red-500`}>
          <p className="text-lg font-semibold text-red-500 mb-2">
            {sequence.length <= 3 ? 'Keep trying!' : 
             sequence.length <= 7 ? 'Good effort!' :
             sequence.length <= 12 ? 'Great job!' : 
             'Amazing memory! 🏆'}
          </p>
          <p className={textSecondary}>
            You remembered {sequence.length} colors in sequence!
          </p>
        </div>
      )}

      {/* Instructions */}
      {gameStatus === 'waiting' && (
        <div className={`mt-6 p-4 rounded-lg border ${borderColor}`}>
          <p className="font-semibold mb-2">How to Play:</p>
          <ul className={`text-sm ${textSecondary} space-y-1 text-left max-w-md mx-auto`}>
            <li>• Watch the sequence of colors light up</li>
            <li>• Repeat the sequence by clicking the buttons</li>
            <li>• Each round adds one more color</li>
            <li>• Make a mistake and it's game over!</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SimonSays;