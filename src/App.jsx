import React, { useState, useEffect } from 'react';
import { Plus, CheckSquare, Key, StickyNote, Link2, Calculator, Gauge, Moon, Sun, Menu, X, Search, Home, Settings, Download, Upload, Trash2, Eye, EyeOff, Copy, Lock } from 'lucide-react';

const DailyHub = () => {
  const [theme, setTheme] = useState('light');
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Todo state
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [todoFilter, setTodoFilter] = useState('all');

  // Password Manager state
  const [masterPassword, setMasterPassword] = useState('');
  const [masterPasswordSet, setMasterPasswordSet] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwords, setPasswords] = useState([]);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordLength, setPasswordLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [newPasswordEntry, setNewPasswordEntry] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    category: 'general',
    notes: ''
  });
  const [searchPassword, setSearchPassword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showPasswordId, setShowPasswordId] = useState(null);
  const [recoveryQuestion, setRecoveryQuestion] = useState('');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [autoLockTimeout, setAutoLockTimeout] = useState(5);
  
  // Toast state
  const [toasts, setToasts] = useState([]);
  
  // Notes state
  const [notes, setNotes] = useState([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [currentNote, setCurrentNote] = useState({ title: '', content: '', category: 'personal' });
  const [searchNote, setSearchNote] = useState('');
  const [noteCategoryFilter, setNoteCategoryFilter] = useState('all');

  // Dashboard state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('Mumbai');
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Load data from memory on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedTodos = localStorage.getItem('todos');
    const savedMasterPassword = localStorage.getItem('masterPassword');
    const savedPasswords = localStorage.getItem('passwords');
    const savedRecovery = localStorage.getItem('recoveryData');
    const savedAutoLock = localStorage.getItem('autoLockTimeout');
    const savedNotes = localStorage.getItem('notes');
    
    setTheme(savedTheme);
    if (savedTodos) setTodos(JSON.parse(savedTodos));
    if (savedMasterPassword) setMasterPasswordSet(true);
    if (savedPasswords) setPasswords(JSON.parse(savedPasswords));
    if (savedRecovery) {
      const recovery = JSON.parse(savedRecovery);
      setRecoveryQuestion(recovery.question);
      setRecoveryAnswer(recovery.answer);
    }
    if (savedAutoLock) setAutoLockTimeout(parseInt(savedAutoLock));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (passwords.length > 0 || localStorage.getItem('passwords')) {
      localStorage.setItem('passwords', JSON.stringify(passwords));
    }
  }, [passwords]);

  useEffect(() => {
    if (notes.length > 0 || localStorage.getItem('notes')) {
      localStorage.setItem('notes', JSON.stringify(notes));
    }
  }, [notes]);

  // Auto-lock functionality
  useEffect(() => {
    if (!isUnlocked) return;

    const checkInactivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      const lockTimeMs = autoLockTimeout * 60 * 1000;

      if (timeSinceLastActivity >= lockTimeMs) {
        lockVault();
        showToast('Vault locked due to inactivity', 'warning');
      }
    };

    const interval = setInterval(checkInactivity, 10000);
    return () => clearInterval(interval);
  }, [isUnlocked, lastActivity, autoLockTimeout]);

  // Track user activity
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('click', updateActivity);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load saved city and fetch weather
  useEffect(() => {
    const savedCity = localStorage.getItem('city') || 'Mumbai';
    setCity(savedCity);
    fetchWeather(savedCity);
  }, []);

  const fetchWeather = async (cityName) => {
    setWeatherLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=YOUR_API_KEY&units=metric`
      );
      if (response.ok) {
        const data = await response.json();
        setWeather(data);
      } else {
        setWeather({
          name: cityName,
          main: { temp: 28, feels_like: 30 },
          weather: [{ description: 'Unable to fetch weather', main: 'Clear' }]
        });
      }
    } catch (error) {
      setWeather({
        name: cityName,
        main: { temp: 28, feels_like: 30 },
        weather: [{ description: 'Weather unavailable', main: 'Clear' }]
      });
    }
    setWeatherLoading(false);
  };

  const updateCity = (newCity) => {
    setCity(newCity);
    localStorage.setItem('city', newCity);
    fetchWeather(newCity);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  const getGreetingIcon = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '🌅';
    if (hour < 17) return '☀️';
    if (hour < 21) return '🌆';
    return '🌙';
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Toast functions
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Todo functions
  const addTodo = () => {
    if (newTodo.trim()) {
      const todo = {
        id: Date.now(),
        text: newTodo,
        completed: false,
        priority: 'medium',
        createdAt: new Date().toISOString(),
        category: 'general'
      };
      setTodos([todo, ...todos]);
      setNewTodo('');
      showToast('Task added successfully!');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
    showToast('Task deleted', 'info');
  };

  const updateTodoPriority = (id, priority) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, priority } : todo
    ));
  };

  // Password Manager Functions
  const generatePassword = () => {
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (charset === '') {
      showToast('Please select at least one character type', 'error');
      return;
    }
    
    let password = '';
    for (let i = 0; i < passwordLength; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setGeneratedPassword(password);
    showToast('Password generated!');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  };

  const setupMasterPassword = () => {
    if (passwordInput.length < 6) {
      showToast('Master password must be at least 6 characters', 'error');
      return;
    }
    if (!recoveryQuestion || !recoveryAnswer) {
      showToast('Please set up recovery question and answer', 'error');
      return;
    }
    localStorage.setItem('masterPassword', passwordInput);
    localStorage.setItem('recoveryData', JSON.stringify({
      question: recoveryQuestion,
      answer: recoveryAnswer.toLowerCase()
    }));
    setMasterPassword(passwordInput);
    setMasterPasswordSet(true);
    setIsUnlocked(true);
    setPasswordInput('');
    setLastActivity(Date.now());
    showToast('Master password created successfully!');
  };

  const unlockVault = () => {
    const saved = localStorage.getItem('masterPassword');
    if (passwordInput === saved) {
      setMasterPassword(passwordInput);
      setIsUnlocked(true);
      setPasswordInput('');
      setLastActivity(Date.now());
      setShowRecovery(false);
      showToast('Vault unlocked!');
    } else {
      showToast('Incorrect password', 'error');
    }
  };

  const recoverPassword = (answer) => {
    const saved = JSON.parse(localStorage.getItem('recoveryData'));
    if (answer.toLowerCase() === saved.answer) {
      const masterPass = localStorage.getItem('masterPassword');
      showToast(`Your master password is: ${masterPass}`, 'info');
      setTimeout(() => setShowRecovery(false), 5000);
    } else {
      showToast('Incorrect answer', 'error');
    }
  };

  const lockVault = () => {
    setIsUnlocked(false);
    setMasterPassword('');
    setShowGenerator(false);
    setShowAddPassword(false);
  };

  const addPasswordEntry = () => {
    if (!newPasswordEntry.title || !newPasswordEntry.password) {
      showToast('Title and Password are required', 'error');
      return;
    }
    
    const entry = {
      id: Date.now(),
      ...newPasswordEntry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setPasswords([entry, ...passwords]);
    setNewPasswordEntry({
      title: '',
      username: '',
      password: '',
      url: '',
      category: 'general',
      notes: ''
    });
    setShowAddPassword(false);
    setLastActivity(Date.now());
    showToast('Password saved successfully!');
  };

  const deletePasswordEntry = (id) => {
    setPasswords(passwords.filter(p => p.id !== id));
    setLastActivity(Date.now());
    showToast('Password deleted', 'info');
  };

  const filteredPasswords = passwords.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchPassword.toLowerCase()) ||
                         p.username.toLowerCase().includes(searchPassword.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['general', 'social', 'banking', 'work', 'email', 'shopping', 'other'];

  // Notes Functions
  const addOrUpdateNote = () => {
    if (!currentNote.title.trim()) {
      showToast('Note title is required', 'error');
      return;
    }

    if (editingNote) {
      setNotes(notes.map(note => 
        note.id === editingNote.id 
          ? { ...currentNote, id: editingNote.id, updatedAt: new Date().toISOString() }
          : note
      ));
      showToast('Note updated successfully!');
    } else {
      const newNote = {
        ...currentNote,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setNotes([newNote, ...notes]);
      showToast('Note added successfully!');
    }

    setCurrentNote({ title: '', content: '', category: 'personal' });
    setShowAddNote(false);
    setEditingNote(null);
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
    showToast('Note deleted', 'info');
  };

  const editNote = (note) => {
    setCurrentNote({ title: note.title, content: note.content, category: note.category });
    setEditingNote(note);
    setShowAddNote(true);
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchNote.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchNote.toLowerCase());
    const matchesCategory = noteCategoryFilter === 'all' || note.category === noteCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const noteCategories = ['personal', 'work', 'ideas', 'shopping', 'recipes', 'other'];

  const clearAllData = () => {
    const password = prompt('Enter master password to confirm deletion:');
    const saved = localStorage.getItem('masterPassword');
    
    if (password === saved) {
      localStorage.clear();
      setTodos([]);
      setPasswords([]);
      setNotes([]);
      setMasterPasswordSet(false);
      setIsUnlocked(false);
      showToast('All data cleared successfully', 'info');
    } else {
      showToast('Incorrect password. Data not deleted.', 'error');
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (todoFilter === 'active') return !todo.completed;
    if (todoFilter === 'completed') return todo.completed;
    return true;
  });

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'todos', label: 'Tasks', icon: CheckSquare },
    { id: 'passwords', label: 'Passwords', icon: Key },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'links', label: 'Quick Links', icon: Link2 },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'converter', label: 'Unit Converter', icon: Gauge },
  ];

  const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} transition-colors duration-200`}>
      {/* Toast Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-500 text-white' :
              toast.type === 'error' ? 'bg-red-500 text-white' :
              toast.type === 'warning' ? 'bg-orange-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <header className={`${cardBg} border-b ${borderColor} sticky top-0 z-40`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-xl font-bold">Daily Hub</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className={`w-64 ${cardBg} border-r ${borderColor} min-h-screen p-4`}>
            <nav className="space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                      isActive 
                        ? theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-500 text-white shadow-lg'
                        : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className={`mt-8 pt-8 border-t ${borderColor}`}>
              <button
                onClick={() => setActiveView('settings')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                  activeView === 'settings'
                    ? theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-500 text-white shadow-lg'
                    : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <Settings size={20} />
                <span>Settings</span>
              </button>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            <div>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{getGreetingIcon()}</span>
                  <h2 className="text-4xl font-bold">{getGreeting()}!</h2>
                </div>
                <p className={`text-lg ${textSecondary}`}>Welcome back to your Daily Hub</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Clock Widget */}
                <div className={`${cardBg} p-8 rounded-2xl border ${borderColor} shadow-lg`}>
                  <p className={`${textSecondary} mb-2`}>{formatDate()}</p>
                  <div className="text-6xl font-bold tracking-tight mb-1">
                    {formatTime()}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <div className={`px-3 py-1 rounded-lg ${theme === 'dark' ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                      Week {Math.ceil((currentTime.getDate() + new Date(currentTime.getFullYear(), currentTime.getMonth(), 1).getDay()) / 7)}
                    </div>
                    <div className={`px-3 py-1 rounded-lg ${theme === 'dark' ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                      Day {Math.floor((currentTime - new Date(currentTime.getFullYear(), 0, 0)) / 86400000)}
                    </div>
                  </div>
                </div>

                {/* Weather Widget */}
                <div className={`${cardBg} p-8 rounded-2xl border ${borderColor} shadow-lg`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Weather</h3>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => updateCity(e.target.value)}
                      onBlur={(e) => fetchWeather(e.target.value)}
                      className={`px-3 py-1 rounded-lg text-sm ${cardBg} border ${borderColor} w-32`}
                    />
                  </div>
                  {weatherLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                  ) : weather ? (
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-6xl">
                          {weather.weather?.[0]?.main === 'Clear' ? '☀️' :
                           weather.weather?.[0]?.main === 'Clouds' ? '☁️' :
                           weather.weather?.[0]?.main === 'Rain' ? '🌧️' :
                           weather.weather?.[0]?.main === 'Snow' ? '❄️' :
                           weather.weather?.[0]?.main === 'Thunderstorm' ? '⛈️' :
                           '🌤️'}
                        </div>
                        <div>
                          <div className="text-5xl font-bold">{Math.round(weather.main?.temp || 28)}°C</div>
                          <p className={textSecondary}>Feels like {Math.round(weather.main?.feels_like || 30)}°C</p>
                        </div>
                      </div>
                      <p className="capitalize text-lg">{weather.weather?.[0]?.description || 'Clear sky'}</p>
                      <p className={`${textSecondary} text-sm mt-1`}>{weather.name}</p>
                    </div>
                  ) : (
                    <div className={textSecondary}>Weather data unavailable</div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className={`${cardBg} p-6 rounded-xl border ${borderColor} hover:shadow-lg transition-all duration-200 hover:scale-105`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={textSecondary}>Total Tasks</h3>
                    <CheckSquare className="text-blue-500" size={24} />
                  </div>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className={`text-sm ${textSecondary} mt-1`}>
                    {stats.active} active
                  </p>
                </div>
                
                <div className={`${cardBg} p-6 rounded-xl border ${borderColor} hover:shadow-lg transition-all duration-200 hover:scale-105`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={textSecondary}>Passwords</h3>
                    <Key className="text-green-500" size={24} />
                  </div>
                  <p className="text-3xl font-bold">{passwords.length}</p>
                  <p className={`text-sm ${textSecondary} mt-1`}>
                    Secured
                  </p>
                </div>
                
                <div className={`${cardBg} p-6 rounded-xl border ${borderColor} hover:shadow-lg transition-all duration-200 hover:scale-105`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={textSecondary}>Notes</h3>
                    <StickyNote className="text-yellow-500" size={24} />
                  </div>
                  <p className="text-3xl font-bold">{notes.length}</p>
                  <p className={`text-sm ${textSecondary} mt-1`}>
                    Saved
                  </p>
                </div>

                <div className={`${cardBg} p-6 rounded-xl border ${borderColor} hover:shadow-lg transition-all duration-200 hover:scale-105`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={textSecondary}>Completed</h3>
                    <CheckSquare className="text-purple-500" size={24} />
                  </div>
                  <p className="text-3xl font-bold">{stats.completed}</p>
                  <p className={`text-sm ${textSecondary} mt-1`}>
                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% done
                  </p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Tasks */}
                <div className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Recent Tasks</h3>
                    <button
                      onClick={() => setActiveView('todos')}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      View all
                    </button>
                  </div>
                  {todos.slice(0, 5).map(todo => (
                    <div key={todo.id} className={`flex items-center gap-3 py-3 border-b ${borderColor} last:border-0`}>
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="w-4 h-4"
                      />
                      <span className={`flex-1 ${todo.completed ? 'line-through opacity-50' : ''}`}>
                        {todo.text}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        todo.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                        todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {todo.priority}
                      </span>
                    </div>
                  ))}
                  {todos.length === 0 && (
                    <div className={`text-center py-8 ${textSecondary}`}>
                      <CheckSquare size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No tasks yet. Start adding tasks!</p>
                    </div>
                  )}
                </div>

                {/* Recent Notes */}
                <div className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Recent Notes</h3>
                    <button
                      onClick={() => setActiveView('notes')}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      View all
                    </button>
                  </div>
                  {notes.slice(0, 4).map(note => (
                    <div key={note.id} className={`py-3 border-b ${borderColor} last:border-0`}>
                      <h4 className="font-semibold mb-1">{note.title}</h4>
                      <p className={`text-sm ${textSecondary} line-clamp-2`}>
                        {note.content || 'No content'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          {note.category}
                        </span>
                        <span className={`text-xs ${textSecondary}`}>
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {notes.length === 0 && (
                    <div className={`text-center py-8 ${textSecondary}`}>
                      <StickyNote size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No notes yet. Create your first note!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mt-6`}>
                <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => setActiveView('todos')}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-600/20 hover:bg-blue-600/30' : 'bg-blue-50 hover:bg-blue-100'} transition-all duration-200 hover:scale-105 active:scale-95`}
                  >
                    <Plus className="mx-auto mb-2 text-blue-500" size={24} />
                    <p className="text-sm font-medium">Add Task</p>
                  </button>
                  <button
                    onClick={() => setActiveView('passwords')}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-600/20 hover:bg-green-600/30' : 'bg-green-50 hover:bg-green-100'} transition-all duration-200 hover:scale-105 active:scale-95`}
                  >
                    <Key className="mx-auto mb-2 text-green-500" size={24} />
                    <p className="text-sm font-medium">Passwords</p>
                  </button>
                  <button
                    onClick={() => setActiveView('notes')}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-yellow-600/20 hover:bg-yellow-600/30' : 'bg-yellow-50 hover:bg-yellow-100'} transition-all duration-200 hover:scale-105 active:scale-95`}
                  >
                    <StickyNote className="mx-auto mb-2 text-yellow-500" size={24} />
                    <p className="text-sm font-medium">New Note</p>
                  </button>
                  <button
                    onClick={() => setActiveView('calculator')}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-purple-600/20 hover:bg-purple-600/30' : 'bg-purple-50 hover:bg-purple-100'} transition-all duration-200 hover:scale-105 active:scale-95`}
                  >
                    <Calculator className="mx-auto mb-2 text-purple-500" size={24} />
                    <p className="text-sm font-medium">Calculator</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tasks View */}
          {activeView === 'todos' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">Tasks</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTodoFilter('all')}
                    className={`px-4 py-2 rounded-lg ${todoFilter === 'all' ? 'bg-blue-500 text-white' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
                  >
                    All ({stats.total})
                  </button>
                  <button
                    onClick={() => setTodoFilter('active')}
                    className={`px-4 py-2 rounded-lg ${todoFilter === 'active' ? 'bg-blue-500 text-white' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
                  >
                    Active ({stats.active})
                  </button>
                  <button
                    onClick={() => setTodoFilter('completed')}
                    className={`px-4 py-2 rounded-lg ${todoFilter === 'completed' ? 'bg-blue-500 text-white' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
                  >
                    Completed ({stats.completed})
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a new task..."
                    className={`flex-1 px-4 py-3 rounded-lg ${cardBg} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <button
                    onClick={addTodo}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95 hover:shadow-lg flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {filteredTodos.map(todo => (
                  <div key={todo.id} className={`${cardBg} p-4 rounded-lg border ${borderColor} flex items-center gap-3`}>
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="w-5 h-5"
                    />
                    <span className={`flex-1 ${todo.completed ? 'line-through opacity-50' : ''}`}>
                      {todo.text}
                    </span>
                    <select
                      value={todo.priority}
                      onChange={(e) => updateTodoPriority(todo.id, e.target.value)}
                      className={`px-3 py-1 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border ${borderColor}`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="px-3 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {filteredTodos.length === 0 && (
                  <div className={`${cardBg} p-8 rounded-lg border ${borderColor} text-center ${textSecondary}`}>
                    No tasks found
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Password Manager */}
          {activeView === 'passwords' && (
            <div>
              {!masterPasswordSet ? (
                <div className="max-w-md mx-auto mt-20">
                  <div className={`${cardBg} p-8 rounded-xl border ${borderColor}`}>
                    <Key size={48} className="mx-auto mb-4 text-blue-500" />
                    <h2 className="text-2xl font-bold mb-2 text-center">Setup Master Password</h2>
                    <p className={`${textSecondary} mb-6 text-center`}>
                      Create a master password to secure your password vault.
                    </p>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter master password (min 6 characters)"
                      className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4`}
                    />
                    
                    <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded-lg mb-4`}>
                      <p className="font-semibold mb-2">Recovery Setup</p>
                      <p className={`text-sm ${textSecondary} mb-3`}>Set up a recovery question</p>
                      <select
                        value={recoveryQuestion}
                        onChange={(e) => setRecoveryQuestion(e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg ${cardBg} border ${borderColor} mb-2`}
                      >
                        <option value="">Select a recovery question</option>
                        <option value="pet">What is your first pet's name?</option>
                        <option value="city">In which city were you born?</option>
                        <option value="teacher">What is your favorite teacher's name?</option>
                        <option value="food">What is your favorite food?</option>
                        <option value="book">What is your favorite book?</option>
                      </select>
                      <input
                        type="text"
                        value={recoveryAnswer}
                        onChange={(e) => setRecoveryAnswer(e.target.value)}
                        placeholder="Your answer"
                        className={`w-full px-4 py-2 rounded-lg ${cardBg} border ${borderColor}`}
                      />
                    </div>

                    <button
                      onClick={setupMasterPassword}
                      className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95"
                    >
                      Create Master Password
                    </button>
                  </div>
                </div>
              ) : !isUnlocked ? (
                <div className="max-w-md mx-auto mt-20">
                  <div className={`${cardBg} p-8 rounded-xl border ${borderColor}`}>
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Key size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-center">Unlock Password Vault</h2>
                    
                    {!showRecovery ? (
                      <div>
                        <input
                          type="password"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && unlockVault()}
                          placeholder="Enter master password"
                          className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor} mb-4`}
                        />
                        <button
                          onClick={unlockVault}
                          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95 mb-2"
                        >
                          Unlock Vault
                        </button>
                        <button
                          onClick={() => setShowRecovery(true)}
                          className={`w-full px-4 py-2 ${textSecondary} hover:${textColor} transition-all duration-200`}
                        >
                          Forgot password?
                        </button>
                      </div>
                    ) : (
                      <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-yellow-50'} p-4 rounded-lg`}>
                        <p className="font-semibold mb-2">Password Recovery</p>
                        <p className="mb-3">
                          {recoveryQuestion === 'pet' ? "What is your first pet's name?" :
                           recoveryQuestion === 'city' ? "In which city were you born?" :
                           recoveryQuestion === 'teacher' ? "What is your favorite teacher's name?" :
                           recoveryQuestion === 'food' ? "What is your favorite food?" :
                           "What is your favorite book?"}
                        </p>
                        <input
                          type="text"
                          placeholder="Your answer"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              recoverPassword(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className={`w-full px-4 py-2 rounded-lg ${cardBg} border ${borderColor} mb-2`}
                        />
                        <button
                          onClick={() => setShowRecovery(false)}
                          className={`w-full px-4 py-2 ${textSecondary} hover:${textColor}`}
                        >
                          Back to login
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold">Password Manager</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowGenerator(!showGenerator)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg transition-all duration-200 hover:bg-green-600 hover:scale-105 active:scale-95"
                      >
                        Generator
                      </button>
                      <button
                        onClick={() => setShowAddPassword(!showAddPassword)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95 flex items-center gap-2"
                      >
                        <Plus size={20} />
                        Add
                      </button>
                      <button
                        onClick={lockVault}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg transition-all duration-200 hover:bg-red-600 hover:scale-105 active:scale-95 flex items-center gap-2"
                      >
                        <Lock size={20} />
                        Lock
                      </button>
                    </div>
                  </div>

                  {showGenerator && (
                    <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mb-6`}>
                      <h3 className="text-xl font-semibold mb-4">Password Generator</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block mb-2">Length: {passwordLength}</label>
                          <input
                            type="range"
                            min="6"
                            max="32"
                            value={passwordLength}
                            onChange={(e) => setPasswordLength(parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={includeUppercase}
                              onChange={(e) => setIncludeUppercase(e.target.checked)}
                            />
                            Uppercase (A-Z)
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={includeLowercase}
                              onChange={(e) => setIncludeLowercase(e.target.checked)}
                            />
                            Lowercase (a-z)
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={includeNumbers}
                              onChange={(e) => setIncludeNumbers(e.target.checked)}
                            />
                            Numbers (0-9)
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={includeSymbols}
                              onChange={(e) => setIncludeSymbols(e.target.checked)}
                            />
                            Symbols (!@#$...)
                          </label>
                        </div>
                        <button
                          onClick={generatePassword}
                          className="w-full px-4 py-3 bg-green-500 text-white rounded-lg transition-all duration-200 hover:bg-green-600 hover:scale-105 active:scale-95"
                        >
                          Generate Password
                        </button>
                        {generatedPassword && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={generatedPassword}
                              readOnly
                              className={`flex-1 px-4 py-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border ${borderColor}`}
                            />
                            <button
                              onClick={() => copyToClipboard(generatedPassword)}
                              className="px-4 py-3 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95"
                            >
                              Copy
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {showAddPassword && (
                    <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mb-6`}>
                      <h3 className="text-xl font-semibold mb-4">Add New Password</h3>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Title *"
                          value={newPasswordEntry.title}
                          onChange={(e) => setNewPasswordEntry({...newPasswordEntry, title: e.target.value})}
                          className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
                        />
                        <input
                          type="text"
                          placeholder="Username / Email"
                          value={newPasswordEntry.username}
                          onChange={(e) => setNewPasswordEntry({...newPasswordEntry, username: e.target.value})}
                          className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Password *"
                            value={newPasswordEntry.password}
                            onChange={(e) => setNewPasswordEntry({...newPasswordEntry, password: e.target.value})}
                            className={`flex-1 px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
                          />
                          <button
                            onClick={() => {
                              if (generatedPassword) {
                                setNewPasswordEntry({...newPasswordEntry, password: generatedPassword});
                              }
                            }}
                            className="px-4 py-3 bg-gray-500 text-white rounded-lg transition-all duration-200 hover:bg-gray-600 hover:scale-105 active:scale-95"
                          >
                            Use Generated
                          </button>
                        </div>
                        <input
                          type="url"
                          placeholder="Website URL"
                          value={newPasswordEntry.url}
                          onChange={(e) => setNewPasswordEntry({...newPasswordEntry, url: e.target.value})}
                          className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
                        />
                        <select
                          value={newPasswordEntry.category}
                          onChange={(e) => setNewPasswordEntry({...newPasswordEntry, category: e.target.value})}
                          className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                          ))}
                        </select>
                        <textarea
                          placeholder="Notes (optional)"
                          value={newPasswordEntry.notes}
                          onChange={(e) => setNewPasswordEntry({...newPasswordEntry, notes: e.target.value})}
                          rows="3"
                          className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={addPasswordEntry}
                            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95"
                          >
                            Save Password
                          </button>
                          <button
                            onClick={() => setShowAddPassword(false)}
                            className="px-4 py-3 bg-gray-500 text-white rounded-lg transition-all duration-200 hover:bg-gray-600 hover:scale-105 active:scale-95"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mb-6">
                    <input
                      type="text"
                      placeholder="Search passwords..."
                      value={searchPassword}
                      onChange={(e) => setSearchPassword(e.target.value)}
                      className={`flex-1 px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
                    />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className={`px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
                    >
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    {filteredPasswords.length === 0 ? (
                      <div className={`${cardBg} p-8 rounded-xl border ${borderColor} text-center ${textSecondary}`}>
                        No passwords found. Add your first password!
                      </div>
                    ) : (
                      filteredPasswords.map(pwd => (
                        <div key={pwd.id} className={`${cardBg} p-4 rounded-xl border ${borderColor}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold">{pwd.title}</h4>
                              {pwd.username && <p className={textSecondary}>{pwd.username}</p>}
                              {pwd.url && (
                                <a href={pwd.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm hover:underline">
                                  {pwd.url}
                                </a>
                              )}
                              <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                {pwd.category}
                              </span>
                            </div>
                            <button
                              onClick={() => deletePasswordEntry(pwd.id)}
                              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1 rounded transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                              Delete
                            </button>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <input
                              type={showPasswordId === pwd.id ? 'text' : 'password'}
                              value={pwd.password}
                              readOnly
                              className={`flex-1 px-3 py-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border ${borderColor}`}
                            />
                            <button
                              onClick={() => setShowPasswordId(showPasswordId === pwd.id ? null : pwd.id)}
                              className={`px-3 py-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} transition-all duration-200 hover:scale-105 active:scale-95`}
                            >
                              {showPasswordId === pwd.id ? 'Hide' : 'Show'}
                            </button>
                            <button
                              onClick={() => copyToClipboard(pwd.password)}
                              className="px-3 py-2 bg-blue-500 text-white rounded transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95"
                            >
                              Copy
                            </button>
                          </div>
                          {pwd.notes && (
                            <p className={`${textSecondary} text-sm mt-3 p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              {pwd.notes}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes View */}
          {activeView === 'notes' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">Notes</h2>
                <button
                  onClick={() => {
                    setShowAddNote(!showAddNote);
                    if (!showAddNote) {
                      setCurrentNote({ title: '', content: '', category: 'personal' });
                      setEditingNote(null);
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Plus size={20} />
                  {showAddNote ? 'Cancel' : 'New Note'}
                </button>
              </div>

              {showAddNote && (
                <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mb-6`}>
                  <h3 className="text-xl font-semibold mb-4">{editingNote ? 'Edit Note' : 'Create New Note'}</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Note title *"
                      value={currentNote.title}
                      onChange={(e) => setCurrentNote({...currentNote, title: e.target.value})}
                      className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
                    />
                    <select
                      value={currentNote.category}
                      onChange={(e) => setCurrentNote({...currentNote, category: e.target.value})}
                      className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
                    >
                      {noteCategories.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                    <textarea
                      placeholder="Write your note here..."
                      value={currentNote.content}
                      onChange={(e) => setCurrentNote({...currentNote, content: e.target.value})}
                      rows="10"
                      className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor} font-mono`}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={addOrUpdateNote}
                        className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95"
                      >
                        {editingNote ? 'Update Note' : 'Save Note'}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddNote(false);
                          setCurrentNote({ title: '', content: '', category: 'personal' });
                          setEditingNote(null);
                        }}
                        className="px-4 py-3 bg-gray-500 text-white rounded-lg transition-all duration-200 hover:bg-gray-600 hover:scale-105 active:scale-95"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchNote}
                  onChange={(e) => setSearchNote(e.target.value)}
                  className={`flex-1 px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
                />
                <select
                  value={noteCategoryFilter}
                  onChange={(e) => setNoteCategoryFilter(e.target.value)}
                  className={`px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
                >
                  <option value="all">All Categories</option>
                  {noteCategories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotes.length === 0 ? (
                  <div className={`${cardBg} p-8 rounded-xl border ${borderColor} text-center ${textSecondary} col-span-full`}>
                    <StickyNote size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No notes found. Create your first note!</p>
                  </div>
                ) : (
                  filteredNotes.map(note => (
                    <div key={note.id} className={`${cardBg} p-4 rounded-xl border ${borderColor} flex flex-col transition-all duration-200 hover:shadow-lg hover:scale-105`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-lg font-semibold flex-1">{note.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          {note.category}
                        </span>
                      </div>
                      <p className={`${textSecondary} text-sm mb-4 flex-1 line-clamp-4`}>
                        {note.content || 'No content'}
                      </p>
                      <div className={`text-xs ${textSecondary} mb-3`}>
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editNote(note)}
                          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="px-3 py-2 text-red-500 border border-red-500 rounded transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-105 active:scale-95 text-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Placeholder views */}
          {activeView === 'links' && (
            <div className={`${cardBg} p-8 rounded-xl border ${borderColor} text-center`}>
              <Link2 size={48} className="mx-auto mb-4 text-purple-500" />
              <h2 className="text-2xl font-bold mb-2">Quick Links</h2>
              <p className={textSecondary}>Coming soon!</p>
            </div>
          )}

          {activeView === 'calculator' && (
            <div className={`${cardBg} p-8 rounded-xl border ${borderColor} text-center`}>
              <Calculator size={48} className="mx-auto mb-4 text-orange-500" />
              <h2 className="text-2xl font-bold mb-2">Calculator</h2>
              <p className={textSecondary}>Coming soon!</p>
            </div>
          )}

          {activeView === 'converter' && (
            <div className={`${cardBg} p-8 rounded-xl border ${borderColor} text-center`}>
              <Gauge size={48} className="mx-auto mb-4 text-cyan-500" />
              <h2 className="text-2xl font-bold mb-2">Unit Converter</h2>
              <p className={textSecondary}>Coming soon!</p>
            </div>
          )}

          {/* Settings View */}
          {activeView === 'settings' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Settings</h2>
              
              <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mb-4`}>
                <h3 className="text-xl font-semibold mb-4">Appearance</h3>
                <div className="flex items-center justify-between">
                  <span>Theme</span>
                  <button
                    onClick={toggleTheme}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95"
                  >
                    {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                  </button>
                </div>
              </div>

              <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mb-4`}>
                <h3 className="text-xl font-semibold mb-4">Security</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-lock Vault</p>
                    <p className={`text-sm ${textSecondary}`}>Lock password vault after inactivity</p>
                  </div>
                  <select
                    value={autoLockTimeout}
                    onChange={(e) => {
                      setAutoLockTimeout(parseInt(e.target.value));
                      localStorage.setItem('autoLockTimeout', e.target.value);
                      showToast('Auto-lock timeout updated');
                    }}
                    className={`px-4 py-2 rounded-lg ${cardBg} border ${borderColor}`}
                  >
                    <option value="1">1 minute</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                  </select>
                </div>
              </div>

              <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mb-4`}>
                <h3 className="text-xl font-semibold mb-4">Data Management</h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                    <Download size={20} />
                    Export Data
                  </button>
                  <button className="w-full px-4 py-3 bg-gray-500 text-white rounded-lg transition-all duration-200 hover:bg-gray-600 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                    <Upload size={20} />
                    Import Data
                  </button>
                </div>
              </div>

              <div className={`${cardBg} p-6 rounded-xl border border-red-500`}>
                <h3 className="text-xl font-semibold mb-4 text-red-500">Danger Zone</h3>
                <button 
                  onClick={clearAllData}
                  className="w-full px-4 py-3 bg-red-500 text-white rounded-lg transition-all duration-200 hover:bg-red-600 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Trash2 size={20} />
                  Clear All Data
                </button>
                <p className={`text-sm ${textSecondary} mt-2`}>
                  ⚠️ This will delete all data. Requires master password.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DailyHub;