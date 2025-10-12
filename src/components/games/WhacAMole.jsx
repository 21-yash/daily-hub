import React from 'react';

const WhacAMole = ({
  moles,
  score,
  timeLeft,
  gameActive,
  onMoleWhack,
  onNewGame,
  cardBg,
  borderColor
}) => {
  return (
    <div className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Whac-A-Mole 🔨</h3>
        <div className="text-lg font-semibold">
          <span>Score: {score}</span> | <span>Time: {timeLeft}s</span>
        </div>
      </div>
      
      {!gameActive && timeLeft === 0 ? (
        <div className="text-center py-12">
            <h4 className="text-3xl font-bold mb-4">Game Over!</h4>
            <p className="text-xl mb-6">Your final score is {score}</p>
            <button onClick={onNewGame} className="px-6 py-3 text-lg bg-blue-500 text-white rounded-lg hover:bg-blue-600">Play Again</button>
        </div>
      ) : !gameActive ? (
        <div className="text-center py-12">
            <button onClick={onNewGame} className="px-6 py-3 text-lg bg-green-500 text-white rounded-lg hover:bg-green-600">Start Game</button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {moles.map((isMoleUp, index) => (
            <div key={index} className={`aspect-square rounded-full border-4 ${borderColor} bg-yellow-800 flex items-center justify-center overflow-hidden`}>
              {isMoleUp && (
                <button 
                  onClick={() => onMoleWhack(index)}
                  className="text-6xl cursor-pointer animate-pop-up"
                  style={{transform: 'translateY(25%)'}}
                >
                  🐹
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WhacAMole;