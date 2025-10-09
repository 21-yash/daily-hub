import React, { useState, useEffect, useRef } from 'react';
import { Send, BrainCircuit, User, Bot, Loader2, Key, Save } from 'lucide-react';

// --- Main AI Chat Component ---
const AiChat = ({ theme }) => {
  // --- State Management ---
  const [apiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '');
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

  // Load chat history from local storage on initial render
  useEffect(() => {
    const savedHistory = localStorage.getItem('geminiChatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save chat history to local storage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('geminiChatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  // --- Core Functions ---

  const handleSendMessage = async () => {
    if (!apiKey) {
      setError("Gemini API key not configured. Please contact administrator.");
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

      // Construct the payload with the entire chat history
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
      // Revert history if API call fails
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

    return (
      <div className={`flex flex-col ${alignment} gap-2`}>
        <div className="flex items-start gap-3">
            {!isUser && <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}><Icon size={18} /></div>}
            <div className={`max-w-xl p-3 rounded-2xl ${messageBg}`}>
                <p className="whitespace-pre-wrap">{message.parts[0].text}</p>
            </div>
            {isUser && <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-blue-800' : 'bg-blue-200'}`}><Icon size={18} /></div>}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold flex items-center gap-2">
            <BrainCircuit size={28} /> AI Chat
        </h2>
      </div>

      {/* Chat Messages */}
      <div className={`flex-1 p-4 rounded-2xl border ${cardBg} ${borderColor} overflow-y-auto mb-4`}>
        <div className="space-y-6">
          {chatHistory.length === 0 && (
            <div className="text-center py-10">
              <Bot size={40} className={`mx-auto ${secondaryTextColor}`} />
              <p className={`mt-2 ${secondaryTextColor}`}>Ask me anything! Your conversation will be saved here.</p>
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
