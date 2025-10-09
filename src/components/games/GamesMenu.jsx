const GamesMenu = ({ onSelectGame, theme, cardBg, borderColor, textSecondary }) => {
  const games = [
    {
      id: 'memory',
      emoji: '🧠',
      title: 'Memory Match',
      description: 'Match all the pairs of emojis'
    },
    {
      id: 'guess',
      emoji: '🔢',
      title: 'Number Guessing',
      description: 'Guess the number between 1-100'
    },
    {
      id: 'reaction',
      emoji: '⚡',
      title: 'Reaction Time',
      description: 'Test your reaction speed'
    }
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <span>🎮</span>
        Mini Games
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {games.map(game => (
          <div
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            className={`${cardBg} p-8 rounded-xl border ${borderColor} text-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg`}
          >
            <div className="text-6xl mb-4">{game.emoji}</div>
            <h3 className="text-xl font-bold mb-2">{game.title}</h3>
            <p className={textSecondary}>{game.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamesMenu;