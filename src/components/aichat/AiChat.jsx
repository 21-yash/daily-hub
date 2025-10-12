import React, { useState, useEffect, useRef } from 'react';
import { Send, BrainCircuit, User, Bot, Loader2, Key, Save } from 'lucide-react';

// --- Place the parser function here, inside the file but outside the component ---
function parseMarkdown(text) {
  if (!text) return '';

  let inCodeBlock = false;
  let codeLang = '';
  
  const lines = text.split('\n');
  const processedLines = [];

  for (const line of lines) {
    // Check for code block fences
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = line.trim().substring(3).trim();
        processedLines.push(`<pre><code class="language-${codeLang}">`);
      } else {
        inCodeBlock = false;
        processedLines.push('</code></pre>');
      }
      continue;
    }

    let processedLine = line;
    if (inCodeBlock) {
      // Escape HTML inside code blocks
      processedLine = processedLine.replace(/</g, '&lt;').replace(/>/g, '&gt;');

      // Simple syntax highlighting
      processedLine = processedLine.replace(/^(def|import|from|return|if|else|for|while|in|True|False|None)\b/g, '<span class="token keyword">$1</span>');
      processedLine = processedLine.replace(/(\".*?\"|\'.*?\')/g, '<span class="token string">$1</span>');
      processedLine = processedLine.replace(/(#.*)/g, '<span class="token comment">$1</span>');
      processedLine = processedLine.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\(/g, '<span class="token function">$1</span>(');

    } else {
      // Escape HTML outside code blocks
      processedLine = processedLine.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      // Handle lists (this needs to be smarter when outside code blocks)
      if (/^\s*[\*\-]\s+/.test(processedLine)) {
          processedLine = `<ul><li>${processedLine.replace(/^\s*[\*\-]\s+/, '')}</li></ul>`;
      }

      // Inline elements
      processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
      processedLine = processedLine.replace(/_(.*?)_/g, '<em>$1</em>');
    }
    processedLines.push(processedLine);
  }

  // Combine lines and handle paragraph breaks
  return processedLines.join('<br />')
    .replace(/<\/pre><br \/>/g, '</pre>') // Clean up breaks after code blocks
    .replace(/<br \/><ul>/g, '<ul>') // Clean up breaks before lists
    .replace(/<\/ul><br \/>/g, '</ul>'); // Clean up breaks after lists
}


// --- Main AI Chat Component ---
const AiChat = ({ theme }) => {
  // --- State Management ---
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  // --- UI Style Calculation ---
  const cardBg = theme === 'dark' ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm';
  const inputBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const secondaryTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  // --- Effects for Local Storage and Scrolling ---
  useEffect(() => {
    const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const savedApiKey = localStorage.getItem('geminiApiKey');
    
    if (envApiKey) {
      setApiKey(envApiKey);
      setShowApiKeyInput(false);
    } else if (savedApiKey) {
      setApiKey(savedApiKey);
      setShowApiKeyInput(false);
    } else {
      setShowApiKeyInput(true);
    }

    const savedHistory = localStorage.getItem('geminiChatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('geminiChatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  // --- Core Functions ---
  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('geminiApiKey', apiKey);
      setShowApiKeyInput(false);
      setError(null);
    } else {
      setError("Please enter a valid API key.");
    }
  };
  
  const handleSendMessage = async () => {
    if (!apiKey) {
      setError("Gemini API key is not configured. Please add it via the settings or input field.");
      return;
    }
    if (!userInput.trim() || isLoading) return;

    const newUserMessage = { role: 'user', parts: [{ text: userInput }] };
    const newHistory = [...chatHistory, newUserMessage];

    setChatHistory(newHistory);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      const payload = {
        contents: newHistory.map(msg => ({
          role: msg.role,
          parts: msg.parts
        }))
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "An unknown API error occurred.");
      }

      const data = await response.json();
      const modelResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (modelResponse) {
        setChatHistory([...newHistory, { role: 'model', parts: [{ text: modelResponse }] }]);
      } else {
        throw new Error("Received an empty response from the API.");
      }

    } catch (err) {
      console.error(err);
      setError(`Error: ${err.message}`);
      setChatHistory(chatHistory);
    } finally {
      setIsLoading(false);
    }
  };

  // --- UI Rendering ---

  // Component for displaying a single message bubble
  const Message = ({ message }) => {
    const isUser = message.role === 'user';
    const messageBg = isUser 
        ? 'bg-blue-600 text-white' 
        : (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200');
    const alignment = isUser ? 'items-end' : 'items-start';
    const Icon = isUser ? User : Bot;

    const messageContent = isUser ? (
      <p className="whitespace-pre-wrap">{message.parts[0].text}</p>
    ) : (
      <div 
        className="prose-styles"
        dangerouslySetInnerHTML={{ __html: parseMarkdown(message.parts[0].text) }} 
      />
    );

    return (
      <div className={`flex flex-col ${alignment} gap-2`}>
        <div className="flex items-start gap-3">
            {!isUser && <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}><Icon size={18} /></div>}
            <div className={`max-w-xl p-3 rounded-2xl ${messageBg}`}>
                {messageContent}
            </div>
            {isUser && <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-blue-800' : 'bg-blue-200'}`}><Icon size={18} /></div>}
        </div>
      </div>
    );
  };

  if (showApiKeyInput) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className={`p-8 rounded-2xl border ${cardBg} ${borderColor} shadow-xl max-w-md w-full text-center`}>
            <BrainCircuit size={48} className="mx-auto text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Gemini API Key Required</h2>
            <p className={secondaryTextColor}>Please enter your Google AI Studio API key to start chatting.</p>
            <div className="flex gap-2 my-4">
                <Key className={`mt-3 ${secondaryTextColor}`} size={20} />
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key..."
                    className={`flex-1 px-4 py-2 rounded-lg ${inputBg} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
            </div>
            <button 
              onClick={handleSaveApiKey}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} /> Save and Start Chatting
            </button>
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
        {/* Add a style tag to handle the prose styles for markdown */}
        <style>{`
            .prose-styles ul {
              list-style-type: disc;
              padding-left: 1.5rem;
            }
            .prose-styles strong {
              font-weight: 600;
            }
            .prose-styles em {
              font-style: italic;
            }
            /* Code Block Styles */
            .prose-styles pre {
              background-color: #2d2d2d;
              color: #dcdcdc;
              font-family: 'Fira Code', 'Courier New', monospace;
              padding: 1rem;
              border-radius: 0.5rem;
              overflow-x: auto;
              margin-top: 1rem;
              margin-bottom: 1rem;
            }
            .prose-styles pre code {
              background-color: transparent;
              padding: 0;
            }
            /* Syntax Highlighting */
            .prose-styles .token.keyword { color: #569cd6; }
            .prose-styles .token.function { color: #dcdcaa; }
            .prose-styles .token.string { color: #ce9178; }
            .prose-styles .token.comment { color: #6a9955; font-style: italic; }

        `}</style>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold flex items-center gap-2">
            <BrainCircuit size={28} /> AI Chat
        </h2>
        <button 
            onClick={() => { localStorage.removeItem('geminiApiKey'); setApiKey(''); setShowApiKeyInput(true); }}
            className={`text-xs ${secondaryTextColor} hover:text-red-500 transition-colors`}
        >
            Change API Key
        </button>
      </div>

      {/* Chat Messages */}
      <div className={`flex-1 p-4 rounded-2xl border ${cardBg} ${borderColor} overflow-y-auto mb-4`}>
        <div className="space-y-6">
          {chatHistory.length === 0 && (
            <div className="text-center py-10">
              <Bot size={48} className={`mx-auto mb-4 ${secondaryTextColor}`} />
              <h3 className="text-2xl font-bold mb-2">Welcome to your AI Assistant!</h3>
              <p className={secondaryTextColor}>
                I can help you brainstorm, organize, or learn something new.
              </p>
              <p className={`text-sm ${secondaryTextColor} mt-2`}>
                Your conversation will be saved here.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                <button
                  onClick={() => setUserInput("Help me organize my tasks for the week")}
                  className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} text-left transition-all`}
                >
                  <span className="font-medium">📋 Organize tasks</span>
                  <p className="text-xs mt-1 opacity-70">Help me prioritize my to-dos for the week</p>
                </button>
                <button
                  onClick={() => setUserInput("Give me 5 productivity tips")}
                  className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} text-left transition-all`}
                >
                  <span className="font-medium">💡 Productivity tips</span>
                  <p className="text-xs mt-1 opacity-70">Give me some ideas to boost my efficiency</p>
                </button>
                <button
                  onClick={() => setUserInput("Brainstorm some ideas for a new project")}
                  className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} text-left transition-all`}
                >
                  <span className="font-medium">🚀 Brainstorm ideas</span>
                  <p className="text-xs mt-1 opacity-70">Let's think of a new creative project</p>
                </button>
                <button
                  onClick={() => setUserInput("Explain quantum computing in simple terms")}
                  className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} text-left transition-all`}
                >
                  <span className="font-medium">🧠 Explain a concept</span>
                  <p className="text-xs mt-1 opacity-70">Teach me something new and complex</p>
                </button>
              </div>
            </div>
          )}
          {chatHistory.map((msg, index) => <Message key={index} message={msg} />)}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}><Bot size={18} /></div>
              <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <Loader2 className="animate-spin" size={20} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="relative">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
          placeholder="Type your message here... (Shift+Enter for new line)"
          rows="1"
          className={`w-full p-4 pr-16 rounded-xl border ${inputBg} ${borderColor} resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        <button 
          onClick={handleSendMessage}
          disabled={isLoading || !userInput.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-blue-700 transition-all"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default AiChat;

