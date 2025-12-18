import React, { useState, useRef, useEffect } from 'react';
import { Search, Replace, Copy, Eraser, FileText, Download, Upload, Repeat } from 'lucide-react';

const FindReplace = ({ theme, showToast }) => {
  const [text, setText] = useState('');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [highlightedText, setHighlightedText] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const textareaRef = useRef(null);

  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const inputBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100';

  useEffect(() => {
    if (findText && text) {
      highlightMatches();
    } else {
      setHighlightedText('');
      setMatchCount(0);
    }
  }, [text, findText, caseSensitive, wholeWord]);

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const highlightMatches = () => {
    if (!findText) {
      setHighlightedText('');
      setMatchCount(0);
      return;
    }

    let searchPattern;
    const escapedFind = escapeRegExp(findText);

    if (wholeWord) {
      searchPattern = new RegExp(`\\b${escapedFind}\\b`, caseSensitive ? 'g' : 'gi');
    } else {
      searchPattern = new RegExp(escapedFind, caseSensitive ? 'g' : 'gi');
    }

    const matches = text.match(searchPattern);
    setMatchCount(matches ? matches.length : 0);

    const highlighted = text.replace(searchPattern, (match) => {
      return `<mark class="bg-yellow-400 dark:bg-yellow-600 text-black rounded px-1">${match}</mark>`;
    });

    setHighlightedText(highlighted);
  };

  const handleReplace = () => {
    if (!findText) {
      showToast('Please enter text to find', 'warning');
      return;
    }

    let searchPattern;
    const escapedFind = escapeRegExp(findText);

    if (wholeWord) {
      searchPattern = new RegExp(`\\b${escapedFind}\\b`, caseSensitive ? 'g' : 'gi');
    } else {
      searchPattern = new RegExp(escapedFind, caseSensitive ? 'g' : 'gi');
    }

    const matches = text.match(searchPattern);
    const count = matches ? matches.length : 0;

    if (count === 0) {
      showToast('No matches found', 'info');
      return;
    }

    const newText = text.replace(searchPattern, replaceText);
    setText(newText);
    showToast(`Replaced ${count} occurrence${count > 1 ? 's' : ''}`, 'success');
  };

  const handleClear = () => {
    setText('');
    setFindText('');
    setReplaceText('');
    setHighlightedText('');
    setMatchCount(0);
    showToast('Text cleared', 'info');
  };

  const handleCopy = () => {
    if (!text) {
      showToast('No text to copy', 'warning');
      return;
    }
    navigator.clipboard.writeText(text);
    showToast('Text copied to clipboard', 'success');
  };

  const handleExport = () => {
    if (!text) {
      showToast('No text to export', 'warning');
      return;
    }

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `text-tool-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Text exported successfully', 'success');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'text/plain') {
      showToast('Please select a text file (.txt)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setText(event.target.result);
      showToast('Text imported successfully', 'success');
    };
    reader.onerror = () => {
      showToast('Failed to read file', 'error');
    };
    reader.readAsText(file);
  };

  const getStats = () => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const lines = text.split('\n').length;

    return { words, characters, charactersNoSpaces, lines };
  };

  const stats = getStats();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${cardBg} rounded-2xl border ${borderColor} p-4`}>
        <div className="flex items-center gap-2 mb-2">
          <FileText size={24} className="text-blue-500" />
          <h2 className="text-xl font-bold">Text Tool</h2>
        </div>
        <p className={textSecondary}>
          Find and replace text, or highlight matches in your content
        </p>
      </div>

      {/* Main Text Input */}
      <div className={`${cardBg} rounded-2xl border ${borderColor} p-4`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Text Content</h3>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".txt"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className={`p-2 rounded-xl cursor-pointer transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              title="Import text file"
            >
              <Upload size={18} />
            </label>
            <button
              onClick={handleExport}
              className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              title="Export as text file"
              disabled={!text}
            >
              <Download size={18} />
            </button>
            <button
              onClick={handleCopy}
              className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              title="Copy to clipboard"
              disabled={!text}
            >
              <Copy size={18} />
            </button>
            <button
              onClick={handleClear}
              className={`p-2 rounded-xl text-red-500 transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              title="Clear all"
            >
              <Eraser size={18} />
            </button>
          </div>
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter or paste your text here..."
          className={`w-full h-64 px-4 py-3 rounded-xl ${inputBg} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
        />

        {/* Text Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <div className={`${inputBg} rounded-xl p-3 text-center`}>
            <p className={`text-xs ${textSecondary}`}>Words</p>
            <p className="font-bold text-lg">{stats.words}</p>
          </div>
          <div className={`${inputBg} rounded-xl p-3 text-center`}>
            <p className={`text-xs ${textSecondary}`}>Characters</p>
            <p className="font-bold text-lg">{stats.characters}</p>
          </div>
          <div className={`${inputBg} rounded-xl p-3 text-center`}>
            <p className={`text-xs ${textSecondary}`}>No Spaces</p>
            <p className="font-bold text-lg">{stats.charactersNoSpaces}</p>
          </div>
          <div className={`${inputBg} rounded-xl p-3 text-center`}>
            <p className={`text-xs ${textSecondary}`}>Lines</p>
            <p className="font-bold text-lg">{stats.lines}</p>
          </div>
        </div>
      </div>

      {/* Find and Replace */}
      <div className={`${cardBg} rounded-2xl border ${borderColor} p-4`}>
        <h3 className="font-bold mb-3">Find & Replace</h3>

        <div className="space-y-3">
          {/* Find Input */}
          <div>
            <label className={`text-sm ${textSecondary} mb-1 block`}>Find</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="Text to find..."
                className={`flex-1 px-3 py-3 rounded-xl ${inputBg} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button
                onClick={highlightMatches}
                className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 flex-shrink-0"
              >
                <Search size={18} />
              </button>
            </div>
          </div>

          {/* Replace Input */}
          <div>
            <label className={`text-sm ${textSecondary} mb-1 block`}>Replace with</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replace with..."
                className={`flex-1 px-4 py-3 rounded-xl ${inputBg} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button
                onClick={handleReplace}
                className="px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center gap-2 flex-shrink-0"
              >
                <Replace size={18} />
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Case sensitive</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={wholeWord}
                onChange={(e) => setWholeWord(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Match whole word</span>
            </label>
          </div>

          {/* Match Count */}
          {findText && (
            <div className={`${inputBg} rounded-xl p-3 text-center`}>
              <p className="text-sm">
                Found <span className="font-bold text-blue-500">{matchCount}</span> match{matchCount !== 1 ? 'es' : ''}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preview with Highlights */}
      {highlightedText && (
        <div className={`${cardBg} rounded-2xl border ${borderColor} p-4`}>
          <h3 className="font-bold mb-3">Preview (Highlighted)</h3>
          <div
            className={`w-full min-h-32 max-h-64 overflow-auto px-4 py-3 rounded-xl ${inputBg} border ${borderColor} whitespace-pre-wrap break-words`}
            dangerouslySetInnerHTML={{ __html: highlightedText }}
          />
          <p className={`text-xs ${textSecondary} mt-2`}>
            💡 Matched text is highlighted in yellow
          </p>
        </div>
      )}
    </div>
  );
};

export default FindReplace;