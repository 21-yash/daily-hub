import React, { useState, useEffect } from 'react';
import { Copy, FileText, Hash, Trash, Type } from 'lucide-react';

const TextCounter = ({ theme, showToast }) => {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    lines: 0,
    readingTime: 0
  });

  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  useEffect(() => {
    calculateStats(text);
  }, [text]);

  const calculateStats = (input) => {
    const characters = input.length;
    const charactersNoSpaces = input.replace(/\s/g, '').length;
    const words = input.trim() ? input.trim().split(/\s+/).length : 0;
    const sentences = input.trim() ? (input.match(/[.!?]+/g) || []).length : 0;
    const paragraphs = input.trim() ? input.split(/\n\n+/).filter(p => p.trim()).length : 0;
    const lines = input ? input.split('\n').length : 0;
    const readingTime = Math.ceil(words / 200); // Average reading speed: 200 words/min

    setStats({
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      lines,
      readingTime
    });
  };

  const copyStats = () => {
    const statsText = `
Text Statistics:
━━━━━━━━━━━━━━━
Characters: ${stats.characters}
Characters (no spaces): ${stats.charactersNoSpaces}
Words: ${stats.words}
Sentences: ${stats.sentences}
Paragraphs: ${stats.paragraphs}
Lines: ${stats.lines}
Reading Time: ${stats.readingTime} min
    `.trim();
    
    navigator.clipboard.writeText(statsText);
    showToast('Statistics copied to clipboard!');
  };

  const clearText = () => {
    setText('');
    showToast('Text cleared', 'info');
  };

  const sampleTexts = [
    {
      name: "Short",
      text: "The quick brown fox jumps over the lazy dog."
    },
    {
      name: "Medium",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
    },
    {
      name: "Long",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n\nExcepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">📝 Text Counter & Analyzer</h2>
        <div className="flex gap-2">
          <button
            onClick={copyStats}
            disabled={!text}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy size={20} />
            Copy Stats
          </button>
          <button
            onClick={clearText}
            disabled={!text}
            className="px-4 py-2 bg-red-500 text-white rounded-lg transition-all duration-200 hover:bg-red-600 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash size={20} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className={`${cardBg} p-4 rounded-xl border ${borderColor} text-center`}>
          <FileText className="mx-auto mb-2 text-blue-500" size={24} />
          <p className="text-3xl font-bold text-blue-500">{stats.characters}</p>
          <p className={`text-sm ${textSecondary}`}>Characters</p>
        </div>

        <div className={`${cardBg} p-4 rounded-xl border ${borderColor} text-center`}>
          <FileText className="mx-auto mb-2 text-green-500" size={24} />
          <p className="text-3xl font-bold text-green-500">{stats.charactersNoSpaces}</p>
          <p className={`text-sm ${textSecondary}`}>No Spaces</p>
        </div>

        <div className={`${cardBg} p-4 rounded-xl border ${borderColor} text-center`}>
          <Type className="mx-auto mb-2 text-purple-500" size={24} />
          <p className="text-3xl font-bold text-purple-500">{stats.words}</p>
          <p className={`text-sm ${textSecondary}`}>Words</p>
        </div>

        <div className={`${cardBg} p-4 rounded-xl border ${borderColor} text-center`}>
          <Hash className="mx-auto mb-2 text-orange-500" size={24} />
          <p className="text-3xl font-bold text-orange-500">{stats.sentences}</p>
          <p className={`text-sm ${textSecondary}`}>Sentences</p>
        </div>

        <div className={`${cardBg} p-4 rounded-xl border ${borderColor} text-center`}>
          <span className="text-2xl block mb-2">📄</span>
          <p className="text-3xl font-bold text-pink-500">{stats.paragraphs}</p>
          <p className={`text-sm ${textSecondary}`}>Paragraphs</p>
        </div>

        <div className={`${cardBg} p-4 rounded-xl border ${borderColor} text-center`}>
          <span className="text-2xl block mb-2">📏</span>
          <p className="text-3xl font-bold text-cyan-500">{stats.lines}</p>
          <p className={`text-sm ${textSecondary}`}>Lines</p>
        </div>

        <div className={`${cardBg} p-4 rounded-xl border ${borderColor} text-center`}>
          <span className="text-2xl block mb-2">⏱️</span>
          <p className="text-3xl font-bold text-red-500">{stats.readingTime}</p>
          <p className={`text-sm ${textSecondary}`}>Min Read</p>
        </div>
      </div>

      {/* Sample Texts */}
      <div className={`${cardBg} p-4 rounded-xl border ${borderColor} mb-6`}>
        <p className="font-semibold mb-3">Try with sample text:</p>
        <div className="flex gap-2 flex-wrap">
          {sampleTexts.map((sample) => (
            <button
              key={sample.name}
              onClick={() => setText(sample.text)}
              className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      {/* Text Input */}
      <div className={`${cardBg} rounded-xl border ${borderColor} overflow-hidden`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Enter or paste your text</h3>
          {text && (
            <span className={`text-sm ${textSecondary}`}>
              {((stats.characters / 5000) * 100).toFixed(0)}% of 5000 char limit
            </span>
          )}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text here..."
          className={`w-full p-6 ${cardBg} resize-none focus:outline-none min-h-[400px] font-mono text-lg`}
          maxLength={5000}
        />
      </div>

      {/* Additional Stats */}
      {text && (
        <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mt-6`}>
          <h3 className="text-xl font-semibold mb-4">Detailed Analysis 📊</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold mb-2">Average Metrics:</p>
              <ul className={`space-y-2 ${textSecondary}`}>
                <li>• Words per sentence: {stats.sentences > 0 ? (stats.words / stats.sentences).toFixed(1) : 0}</li>
                <li>• Characters per word: {stats.words > 0 ? (stats.charactersNoSpaces / stats.words).toFixed(1) : 0}</li>
                <li>• Sentences per paragraph: {stats.paragraphs > 0 ? (stats.sentences / stats.paragraphs).toFixed(1) : 0}</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Text Density:</p>
              <ul className={`space-y-2 ${textSecondary}`}>
                <li>• Space ratio: {stats.characters > 0 ? (((stats.characters - stats.charactersNoSpaces) / stats.characters) * 100).toFixed(1) : 0}%</li>
                <li>• Unique characters: {new Set(text.toLowerCase()).size}</li>
                <li>• Alphanumeric: {(text.match(/[a-zA-Z0-9]/g) || []).length}</li>
              </ul>
            </div>
          </div>

          {/* Character Frequency */}
          {text && (
            <div className="mt-6">
              <p className="font-semibold mb-3">Most Common Characters:</p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(
                  text.toLowerCase().split('').reduce((acc, char) => {
                    if (char.match(/[a-z]/)) {
                      acc[char] = (acc[char] || 0) + 1;
                    }
                    return acc;
                  }, {})
                )
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([char, count]) => (
                    <div key={char} className={`px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <span className="font-mono font-bold">{char}</span>
                      <span className={`ml-2 text-sm ${textSecondary}`}>×{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TextCounter;