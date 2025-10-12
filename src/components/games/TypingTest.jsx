import React from 'react';

const TypingTest = ({
  textToType,
  userInput,
  gameStatus,
  wpm,
  accuracy,
  onInputChange,
  onNewGame,
  cardBg,
  borderColor,
  textSecondary
}) => {
  const getCharClass = (char, index) => {
    if (index >= userInput.length) {
      return textSecondary; // Not typed yet
    }
    return char === userInput[index] ? 'text-green-500' : 'text-red-500 bg-red-200 dark:bg-red-900 rounded';
  };

  return (
    <div className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">Typing Test ⌨️</h3>
        <button
          onClick={onNewGame}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95"
        >
          Restart
        </button>
      </div>

      <div className={`p-4 rounded-lg border ${borderColor} mb-4 font-mono text-lg tracking-wider`}>
        <p>
          {textToType.split('').map((char, index) => (
            <span key={index} className={gameStatus === 'finished' ? '' : getCharClass(char, index)}>
              {char}
            </span>
          ))}
        </p>
      </div>
      
      {gameStatus === 'finished' ? (
        <div className="text-center">
          <h4 className="text-2xl font-bold mb-2">Test Complete!</h4>
          <div className="flex justify-center gap-8 text-xl">
            <p><strong className="font-bold">{wpm}</strong> WPM</p>
            <p><strong className="font-bold">{accuracy}%</strong> Accuracy</p>
          </div>
        </div>
      ) : (
        <textarea
          value={userInput}
          onChange={onInputChange}
          className={`w-full p-3 rounded-lg border ${borderColor} ${cardBg} font-mono text-lg tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500`}
          rows="3"
          placeholder="Start typing here..."
          autoFocus
        />
      )}
    </div>
  );
};

export default TypingTest;