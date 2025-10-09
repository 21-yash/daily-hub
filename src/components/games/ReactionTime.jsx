
import React from 'react';

const ReactionTime = ({
  reactionStartTime,
  reactionWaiting,
  reactionTimes,
  onStart,
  onClick,
  theme,
  cardBg,
  borderColor,
  textSecondary
}) => {
  return (
    <div className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
      <h3 className="text-2xl font-bold mb-6">Reaction Time ⚡</h3>

      <div className="max-w-md mx-auto">
        <p className={`text-center mb-6 ${textSecondary}`}>
          Click the box when it turns green!
        </p>

        <button
          onClick={() => {
            if (!reactionStartTime && !reactionWaiting) {
              onStart();
            } else {
              onClick();
            }
          }}
          className={`w-full h-64 rounded-xl text-2xl font-bold transition-all duration-200 ${
            reactionWaiting 
              ? 'bg-red-500 text-white' 
              : reactionStartTime 
              ? 'bg-green-500 text-white animate-pulse' 
              : theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {reactionWaiting ? 'Wait...' : reactionStartTime ? 'Click Now!' : 'Start Test'}
        </button>

        {reactionTimes.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Your Times:</h4>
            <div className="space-y-2">
              {reactionTimes.map((time, idx) => (
                <div key={idx} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex justify-between items-center">
                    <span>Attempt {reactionTimes.length - idx}</span>
                    <span className="font-bold text-lg">{time}ms</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-blue-500 text-white rounded-lg text-center">
              <p className="font-semibold">Average</p>
              <p className="text-2xl font-bold">
                {Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)}ms
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReactionTime;
