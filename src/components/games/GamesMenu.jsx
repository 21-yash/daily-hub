const GamesMenu = ({ onSelectGame, theme, cardBg, borderColor, textSecondary }) => {
  const games = [
    {
      id: 'chess',
      emoji: '♟️',
      title: 'Chess',
      description: 'Play against a friend or AI'
    },
    {
      id: 'memory',
      emoji: '🧠',
      title: 'Memory Match',
      description: 'Match all the pairs of emojis'
    },
    {
      id: 'tic-tac-toe',
      emoji: '⭕',
      title: 'Tic-Tac-Toe',
      description: 'Classic three-in-a-row game'
    },
    {
      id: 'word-guess',
      emoji: '🟩',
      title: 'Word Guess',
      description: 'Guess the hidden 5-letter word'
    },
    {
      id: 'connect-four',
      emoji: '🔵',
      title: 'Connect Four',
      description: 'Get four discs in a row'
    },
    {
      id: 'simon-says',
      emoji: '🚥',
      title: 'Simon Says',
      description: 'Repeat the color pattern'
    },
    {
      id: 'guess',
      emoji: '🔢',
      title: 'Number Guess',
      description: 'Guess the number 1-100'
    },
    {
      id: 'typing-test',
      emoji: '⌨️',
      title: 'Typing Test',
      description: 'Test your typing speed'
    },
    {
      id: 'whac-a-mole',
      emoji: '🔨',
      title: 'Whac-A-Mole',
      description: 'Whack the moles quickly!'
    },
    {
      id: 'reaction',
      emoji: '⚡',
      title: 'Reaction Time',
      description: 'Test your reaction speed'
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <span className="text-3xl">🎮</span>
        Mini Games
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {games.map(game => (
          <button
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            className={`${cardBg} p-6 rounded-2xl border ${borderColor} text-center transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95`}
          >
            <div className="text-5xl mb-3">{game.emoji}</div>
            <h3 className="text-lg font-bold mb-2">{game.title}</h3>
            <p className={`text-xs ${textSecondary}`}>{game.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GamesMenu;
