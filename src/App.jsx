import React, { useState, useEffect } from 'react';
import { Plus, CheckSquare, Key, StickyNote, Link2, Calculator as CalculatorIcon, Gauge, Moon, Sun, Menu, X, Search, Home, Settings, Download, Upload, Trash2, Eye, EyeOff, Copy, Lock, Bot, Clapperboard, Gamepad2, Cake, LogIn, LogOut, User  } from 'lucide-react';
import QuickLinks from './components/links/QuickLinks';
import Calculator from './components/calculator/Calculator';
import Watchlist from './components/watchlist/Watchlist';
import { getSpecialDaysForDate, getUpcomingHolidays } from './utils/indianHolidays';
import AiChat from './components/aichat/AiChat';
import AuthModal from './components/auth/AuthModal';
import { authService } from './services/authService';
import { getOnThisDay } from './utils/onThisDay';
import GamesMenu from './components/games/GamesMenu';
import MemoryMatch from './components/games/MemoryMatch';
import NumberGuessing from './components/games/NumberGuessing';
import ReactionTime from './components/games/ReactionTime';

const DailyHub = () => {
  const [theme, setTheme] = useState('light');
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [syncTimeout, setSyncTimeout] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Todo state a
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

  // Links state
  const [links, setLinks] = useState([]);

  // Dashboard state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('Mumbai');
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Birthday state
  const [birthdays, setBirthdays] = useState([]);
  const [showAddBirthday, setShowAddBirthday] = useState(false);
  const [newBirthday, setNewBirthday] = useState({ name: '', date: '', category: 'family' });

  // Converter state
  const [converterType, setConverterType] = useState('length');
  const [fromUnit, setFromUnit] = useState('meter');
  const [toUnit, setToUnit] = useState('kilometer');
  const [inputValue, setInputValue] = useState('');
  const [outputValue, setOutputValue] = useState('');

  // Games state
  const [activeGame, setActiveGame] = useState(null);
  const [memoryCards, setMemoryCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [guessNumber, setGuessNumber] = useState('');
  const [targetNumber, setTargetNumber] = useState(Math.floor(Math.random() * 100) + 1);
  const [guessAttempts, setGuessAttempts] = useState(0);
  const [guessHistory, setGuessHistory] = useState([]);
  const [reactionStartTime, setReactionStartTime] = useState(null);
  const [reactionWaiting, setReactionWaiting] = useState(false);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [gameWon, setGameWon] = useState(false);

  // Load data from memory on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        setIsAuthenticated(true);
        try {
          const userInfo = await authService.getUserInfo();
          setCurrentUser(userInfo);
          
          const userData = await authService.getData();
          console.log('📥 Loaded data from server:', userData);
          
          // Load all data from server
          if (userData.todos && userData.todos.length > 0) {
            setTodos(userData.todos);
            localStorage.setItem('todos', JSON.stringify(userData.todos));
          }
          if (userData.passwords && userData.passwords.length > 0) {
            setPasswords(userData.passwords);
            localStorage.setItem('passwords', JSON.stringify(userData.passwords));
          }
          if (userData.notes && userData.notes.length > 0) {
            setNotes(userData.notes);
            localStorage.setItem('notes', JSON.stringify(userData.notes));
          }
          if (userData.birthdays && userData.birthdays.length > 0) {
            setBirthdays(userData.birthdays);
            localStorage.setItem('birthdays', JSON.stringify(userData.birthdays));
          }
          if (userData.links && userData.links.length > 0) {
            setLinks(userData.links);
            localStorage.setItem('links', JSON.stringify(userData.links));
          }
          if (userData.watchlist && userData.watchlist.length > 0) {
            localStorage.setItem('watchlist', JSON.stringify(userData.watchlist));
          }
          if (userData.theme) {
            setTheme(userData.theme);
            localStorage.setItem('theme', userData.theme);
          }
          
          console.log('✅ All data loaded successfully');
        } catch (error) {
          console.error('Failed to load user data:', error);
          showToast('Failed to load data. Please try logging in again.', 'error');
        }
      } else {
        // Load from localStorage if not authenticated
        const savedTheme = localStorage.getItem('theme') || 'light';
        const savedTodos = localStorage.getItem('todos');
        const savedMasterPassword = localStorage.getItem('masterPassword');
        const savedPasswords = localStorage.getItem('passwords');
        const savedRecovery = localStorage.getItem('recoveryData');
        const savedAutoLock = localStorage.getItem('autoLockTimeout');
        const savedNotes = localStorage.getItem('notes');
        const savedBirthdays = localStorage.getItem('birthdays');
        const savedLinks = localStorage.getItem('links');
        
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
        if (savedBirthdays) setBirthdays(JSON.parse(savedBirthdays));
        if (savedLinks) setLinks(JSON.parse(savedLinks));
      }
    };
    checkAuth();
  }, []);

  // Debounced sync function
  const syncToServer = async () => {
    if (!isAuthenticated) return;
    
    try {
      const watchlistData = localStorage.getItem('watchlist');
      const dataToSync = {
        todos: todos || [],
        passwords: passwords || [],
        notes: notes || [],
        birthdays: birthdays || [],
        links: links || [],
        watchlist: watchlistData ? JSON.parse(watchlistData) : [],
        theme: theme || 'light'
      };
      
      console.log('📤 Syncing data to server:', {
        todos: dataToSync.todos.length,
        passwords: dataToSync.passwords.length,
        notes: dataToSync.notes.length,
        birthdays: dataToSync.birthdays.length,
        links: dataToSync.links.length
      });
      
      const response = await authService.syncData(dataToSync);
      console.log('✅ Data synced successfully:', response);
    } catch (error) {
      console.error('❌ Failed to sync data:', error);
      showToast('Failed to sync data to server', 'error');
    }
  };

  // Debounce data sync to prevent too many API calls
  useEffect(() => {
    if (!isAuthenticated) return;
    
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }
    
    const timeout = setTimeout(() => {
      syncToServer();
    }, 2000); // Wait 2 seconds after last change before syncing
    
    setSyncTimeout(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [todos, passwords, notes, birthdays, links, theme, isAuthenticated]);

  // Save data to localStorage
  useEffect(() => {
    // Only save if we have data or if user is not authenticated
    if (!isAuthenticated) {
      if (todos.length > 0 || localStorage.getItem('todos')) {
        localStorage.setItem('todos', JSON.stringify(todos));
      }
    }
  }, [todos, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('theme', theme);
    }
  }, [theme, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (passwords.length > 0 || localStorage.getItem('passwords')) {
        localStorage.setItem('passwords', JSON.stringify(passwords));
      }
    }
  }, [passwords, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (notes.length > 0 || localStorage.getItem('notes')) {
        localStorage.setItem('notes', JSON.stringify(notes));
      }
    }
  }, [notes, isAuthenticated]);

  // Save birthdays to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      if (birthdays.length > 0 || localStorage.getItem('birthdays')) {
        localStorage.setItem('birthdays', JSON.stringify(birthdays));
      }
    }
  }, [birthdays, isAuthenticated]);

  // Save links to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      if (links.length > 0 || localStorage.getItem('links')) {
        localStorage.setItem('links', JSON.stringify(links));
      }
    }
  }, [links, isAuthenticated]);

  // Sync watchlist changes to server
  useEffect(() => {
    if (isAuthenticated) {
      const handleWatchlistChange = () => {
        syncToServer();
      };
      
      // Listen for watchlist changes
      window.addEventListener('watchlistChange', handleWatchlistChange);
      
      return () => window.removeEventListener('watchlistChange', handleWatchlistChange);
    }
  }, [isAuthenticated, todos, passwords, notes, birthdays, links, theme]);

  // Check for birthdays and send notifications
  useEffect(() => {
    const checkBirthdays = () => {
      const today = new Date();
      const todayStr = `${today.getMonth() + 1}-${today.getDate()}`;
      
      birthdays.forEach(birthday => {
        const birthdayDate = new Date(birthday.date);
        const birthdayStr = `${birthdayDate.getMonth() + 1}-${birthdayDate.getDate()}`;
        
        if (birthdayStr === todayStr) {
          showToast(`🎉 Today is ${birthday.name}'s birthday!`, 'info');
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Birthday Reminder', {
              body: `Today is ${birthday.name}'s birthday! 🎂`,
              icon: '🎉'
            });
          }
        }
      });
    };

    checkBirthdays();
    const interval = setInterval(checkBirthdays, 3600000); // Check every hour
    return () => clearInterval(interval);
  }, [birthdays]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

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

  // Birthday Functions
  const addBirthday = () => {
    if (!newBirthday.name || !newBirthday.date) {
      showToast('Name and date are required', 'error');
      return;
    }
    
    const birthday = {
      id: Date.now(),
      ...newBirthday,
      createdAt: new Date().toISOString()
    };
    
    setBirthdays([birthday, ...birthdays]);
    setNewBirthday({ name: '', date: '', category: 'family' });
    setShowAddBirthday(false);
    showToast('Birthday added successfully!');
  };

  const deleteBirthday = (id) => {
    setBirthdays(birthdays.filter(b => b.id !== id));
    showToast('Birthday deleted', 'info');
  };

  const getUpcomingBirthdays = () => {
    const today = new Date();
    return birthdays
      .map(b => {
        const bDate = new Date(b.date);
        const thisYearBirthday = new Date(today.getFullYear(), bDate.getMonth(), bDate.getDate());
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }
        const daysUntil = Math.ceil((thisYearBirthday - today) / (1000 * 60 * 60 * 24));
        return { ...b, daysUntil, date: thisYearBirthday };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);
  };

  // Unit Converter Functions
  const conversionRates = {
    length: {
      meter: 1,
      kilometer: 0.001,
      centimeter: 100,
      millimeter: 1000,
      mile: 0.000621371,
      yard: 1.09361,
      foot: 3.28084,
      inch: 39.3701
    },
    weight: {
      kilogram: 1,
      gram: 1000,
      milligram: 1000000,
      pound: 2.20462,
      ounce: 35.274
    },
    temperature: {
      celsius: (v) => v,
      fahrenheit: (v) => (v * 9/5) + 32,
      kelvin: (v) => v + 273.15
    },
    volume: {
      liter: 1,
      milliliter: 1000,
      gallon: 0.264172,
      quart: 1.05669,
      pint: 2.11338,
      cup: 4.22675,
      fluid_ounce: 33.814
    },
    area: {
      square_meter: 1,
      square_kilometer: 0.000001,
      square_mile: 3.861e-7,
      square_yard: 1.19599,
      square_foot: 10.7639,
      acre: 0.000247105,
      hectare: 0.0001
    },
    speed: {
      meter_per_second: 1,
      kilometer_per_hour: 3.6,
      mile_per_hour: 2.23694,
      knot: 1.94384
    }
  };

  const unitOptions = {
    length: ['meter', 'kilometer', 'centimeter', 'millimeter', 'mile', 'yard', 'foot', 'inch'],
    weight: ['kilogram', 'gram', 'milligram', 'pound', 'ounce'],
    temperature: ['celsius', 'fahrenheit', 'kelvin'],
    volume: ['liter', 'milliliter', 'gallon', 'quart', 'pint', 'cup', 'fluid_ounce'],
    area: ['square_meter', 'square_kilometer', 'square_mile', 'square_yard', 'square_foot', 'acre', 'hectare'],
    speed: ['meter_per_second', 'kilometer_per_hour', 'mile_per_hour', 'knot']
  };

  const convertUnit = (value, from, to, type) => {
    if (!value || isNaN(value)) return '';
    
    const num = parseFloat(value);
    
    if (type === 'temperature') {
      let celsius;
      if (from === 'celsius') celsius = num;
      else if (from === 'fahrenheit') celsius = (num - 32) * 5/9;
      else celsius = num - 273.15;
      
      if (to === 'celsius') return celsius.toFixed(2);
      else if (to === 'fahrenheit') return ((celsius * 9/5) + 32).toFixed(2);
      else return (celsius + 273.15).toFixed(2);
    } else {
      const rates = conversionRates[type];
      const baseValue = num / rates[from];
      return (baseValue * rates[to]).toFixed(6);
    }
  };

  const handleConvert = (val) => {
    setInputValue(val);
    if (val) {
      const result = convertUnit(val, fromUnit, toUnit, converterType);
      setOutputValue(result);
    } else {
      setOutputValue('');
    }
  };

  const handleAuthSuccess = async (userData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
    setShowAuthModal(false);
    
    showToast('Loading your data...', 'info');
    
    // Load user data from server
    try {
      const data = await authService.getData();
      console.log('📥 Login - Data from server:', data);
      
      // Set all data from server - DON'T save to localStorage yet
      setTodos(data.todos || []);
      setPasswords(data.passwords || []);
      setNotes(data.notes || []);
      setBirthdays(data.birthdays || []);
      setLinks(data.links || []);
      
      if (data.watchlist && data.watchlist.length > 0) {
        localStorage.setItem('watchlist', JSON.stringify(data.watchlist));
        window.dispatchEvent(new Event('storage'));
      }
      
      if (data.theme) {
        setTheme(data.theme);
      }
      
      showToast('Login successful! Data loaded.', 'success');
      
      // NO PAGE REFRESH - let React handle the state update
      console.log('✅ Data loaded, no refresh needed');
    } catch (error) {
      console.error('Failed to load user data:', error);
      showToast('Login successful but failed to load data. Please refresh.', 'warning');
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    // Sync data one final time before logout
    showToast('Syncing data before logout...', 'info');
    
    try {
      await syncToServer();
      console.log('✅ Final sync completed');
    } catch (error) {
      console.error('Failed final sync:', error);
    }
    
    // Small delay to ensure sync completes
    setTimeout(() => {
      authService.logout();
      setIsAuthenticated(false);
      setCurrentUser(null);
      
      // Clear all data on logout
      setTodos([]);
      setPasswords([]);
      setNotes([]);
      setBirthdays([]);
      setLinks([]);
      localStorage.removeItem('watchlist');
      localStorage.removeItem('todos');
      localStorage.removeItem('passwords');
      localStorage.removeItem('notes');
      localStorage.removeItem('birthdays');
      localStorage.removeItem('links');
      
      showToast('Logged out successfully', 'info');
      setShowLogoutConfirm(false);
      
      // Refresh page after logout
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }, 1000);
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    if (inputValue) {
      const result = convertUnit(inputValue, toUnit, temp, converterType);
      setOutputValue(result);
    }
  };

  const handleConverterTypeChange = (type) => {
    setConverterType(type);
    setFromUnit(unitOptions[type][0]);
    setToUnit(unitOptions[type][1]);
    setInputValue('');
    setOutputValue('');
  };

  // Memory Match Game Functions
  const initMemoryGame = () => {
    const emojis = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎹'];
    const cards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji, flipped: false }));
    setMemoryCards(cards);
    setFlippedCards([]);
    setMatchedCards([]);
    setMemoryMoves(0);
    setGameWon(false);
  };

  const handleCardClick = (cardId) => {
    if (flippedCards.length === 2 || flippedCards.includes(cardId) || matchedCards.includes(cardId)) return;
    
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves(memoryMoves + 1);
      const card1 = memoryCards.find(c => c.id === newFlipped[0]);
      const card2 = memoryCards.find(c => c.id === newFlipped[1]);
      
      if (card1.emoji === card2.emoji) {
        setMatchedCards([...matchedCards, ...newFlipped]);
        setFlippedCards([]);
        if (matchedCards.length + 2 === memoryCards.length) {
          setGameWon(true);
          showToast('🎉 You won! Great memory!');
        }
      } else {
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  // Number Guessing Game Functions
  const initGuessingGame = () => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setGuessNumber('');
    setGuessAttempts(0);
    setGuessHistory([]);
    setGameWon(false);
  };

  const handleGuess = () => {
    const guess = parseInt(guessNumber);
    if (isNaN(guess) || guess < 1 || guess > 100) {
      showToast('Please enter a number between 1 and 100', 'error');
      return;
    }

    const newAttempts = guessAttempts + 1;
    setGuessAttempts(newAttempts);
    
    let hint = '';
    if (guess === targetNumber) {
      setGameWon(true);
      hint = `🎉 Correct! You won in ${newAttempts} attempts!`;
      showToast(hint);
    } else if (guess < targetNumber) {
      hint = '📈 Too low! Try higher';
    } else {
      hint = '📉 Too high! Try lower';
    }
    
    setGuessHistory([{ guess, hint }, ...guessHistory]);
    setGuessNumber('');
  };

  // Reaction Time Game Functions
  const startReactionTest = () => {
    setReactionWaiting(true);
    const delay = Math.random() * 3000 + 2000;
    setTimeout(() => {
      setReactionStartTime(Date.now());
      setReactionWaiting(false);
    }, delay);
  };

  const handleReactionClick = () => {
    if (reactionWaiting) {
      showToast('Too early! Wait for green.', 'error');
      setReactionWaiting(false);
      return;
    }
    
    if (reactionStartTime) {
      const reactionTime = Date.now() - reactionStartTime;
      setReactionTimes([reactionTime, ...reactionTimes.slice(0, 4)]);
      showToast(`${reactionTime}ms - Great reaction!`);
      setReactionStartTime(null);
    }
  };

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
    { id: 'aichat', label: 'Chat with AI', icon: Bot },
    { id: 'birthdays', label: 'Birthdays', icon: Cake },
    { id: 'passwords', label: 'Passwords', icon: Key },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'watchlist', label: 'Watchlist', icon: Clapperboard },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'links', label: 'Quick Links', icon: Link2 },
    { id: 'calculator', label: 'Calculator', icon: CalculatorIcon },
    { id: 'converter', label: 'Unit Converter', icon: Gauge },
  ];

  // Add account view if authenticated
  if (isAuthenticated) {
    navItems.splice(1, 0, { id: 'account', label: 'Account', icon: User });
  }

  const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} transition-colors duration-200`}>
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          theme={theme} 
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} p-8 rounded-xl border ${borderColor} max-w-md w-full mx-4`}>
            <h3 className="text-2xl font-bold mb-4">Confirm Logout</h3>
            <p className={`${textSecondary} mb-6`}>
              Are you sure you want to logout? Your data will be saved to the server.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg transition-all duration-200 hover:bg-red-600 hover:scale-105 active:scale-95"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg transition-all duration-200 hover:bg-gray-600 hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
            {isAuthenticated ? (
              <button 
                onClick={handleLogout}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} flex items-center gap-2`}
              >
                <LogOut size={20} />
                <span className="hidden md:inline">Logout</span>
              </button>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} flex items-center gap-2`}
              >
                <LogIn size={20} />
                <span className="hidden md:inline">Login</span>
              </button>
            )}
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
                const Icon = typeof item.icon === 'string' ? null : item.icon;
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
                    {Icon ? <Icon size={20} /> : <span className="text-lg">{item.icon}</span>}
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
          {/* Account View */}
          {activeView === 'account' && isAuthenticated && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Account Details</h2>
              
              <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mb-4`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {currentUser?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{currentUser?.username || 'User'}</h3>
                    <p className={textSecondary}>{currentUser?.email || 'No email'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${textSecondary} mb-1`}>Username</p>
                    <p className="font-semibold">{currentUser?.username || 'N/A'}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${textSecondary} mb-1`}>Email</p>
                    <p className="font-semibold">{currentUser?.email || 'N/A'}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${textSecondary} mb-1`}>Account Created</p>
                    <p className="font-semibold">
                      {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${textSecondary} mb-1`}>Last Sync</p>
                    <p className="font-semibold">
                      {currentUser?.lastSync ? new Date(currentUser.lastSync).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mb-4`}>
                <h3 className="text-xl font-semibold mb-4">Data Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500">{todos.length}</div>
                    <p className={`text-sm ${textSecondary}`}>Tasks</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">{passwords.length}</div>
                    <p className={`text-sm ${textSecondary}`}>Passwords</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-500">{notes.length}</div>
                    <p className={`text-sm ${textSecondary}`}>Notes</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-500">{birthdays.length}</div>
                    <p className={`text-sm ${textSecondary}`}>Birthdays</p>
                  </div>
                </div>
              </div>

              <div className={`${cardBg} p-6 rounded-xl border border-red-500`}>
                <h3 className="text-xl font-semibold mb-4 text-red-500">Account Actions</h3>
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-3 bg-red-500 text-white rounded-lg transition-all duration-200 hover:bg-red-600 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <LogOut size={20} />
                  Logout from Account
                </button>
              </div>
            </div>
          )}

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
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <div className={`px-3 py-1 rounded-lg ${theme === 'dark' ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                      Week {Math.ceil((currentTime.getDate() + new Date(currentTime.getFullYear(), currentTime.getMonth(), 1).getDay()) / 7)}
                    </div>
                    <div className={`px-3 py-1 rounded-lg ${theme === 'dark' ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                      Day {Math.floor((currentTime - new Date(currentTime.getFullYear(), 0, 0)) / 86400000)}
                    </div>
                    {getSpecialDaysForDate(currentTime).map((holiday, idx) => (
                      <div key={idx} className={`px-3 py-1 rounded-lg ${theme === 'dark' ? 'bg-pink-600/20 text-pink-400' : 'bg-pink-100 text-pink-600'} flex items-center gap-1`}>
                        <span>{holiday.emoji}</span>
                        <span>{holiday.name}</span>
                      </div>
                    ))}
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
                    <h3 className={textSecondary}>Birthdays</h3>
                    <span className="text-2xl">🎂</span>
                  </div>
                  <p className="text-3xl font-bold">{birthdays.length}</p>
                  <p className={`text-sm ${textSecondary} mt-1`}>
                    {getUpcomingBirthdays()[0] ? `${getUpcomingBirthdays()[0].daysUntil} days next` : 'None upcoming'}
                  </p>
                </div>
              </div>

              {/* Upcoming Birthdays Widget */}
              {birthdays.length > 0 && (
                <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mb-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <span>🎉</span>
                      Upcoming Birthdays
                    </h3>
                    <button
                      onClick={() => setActiveView('birthdays')}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      View all
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {getUpcomingBirthdays().map(birthday => (
                      <div key={birthday.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-600/20' : 'bg-purple-50'} ${birthday.daysUntil === 0 ? 'ring-2 ring-purple-500' : ''}`}>
                        <p className="font-semibold">{birthday.name}</p>
                        <p className={`text-sm ${textSecondary}`}>
                          {birthday.daysUntil === 0 ? '🎂 Today!' : 
                           birthday.daysUntil === 1 ? '📅 Tomorrow' : 
                           `📅 In ${birthday.daysUntil} days`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* On This Day Widget */}
              {getOnThisDay().length > 0 && (
                <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mb-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <span>📅</span>
                      On This Day
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {getOnThisDay().map((event, idx) => (
                      <div key={idx} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-indigo-600/20' : 'bg-indigo-50'}`}>
                        <p className="font-medium">{event.event}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Holidays Widget */}
              <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mb-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <span>🎊</span>
                    Upcoming Holidays
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {getUpcomingHolidays().map((holiday, idx) => (
                    <div key={idx} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-orange-600/20' : 'bg-orange-50'} ${holiday.daysUntil === 0 ? 'ring-2 ring-orange-500' : ''}`}>
                      <div className="text-2xl mb-1">{holiday.emoji}</div>
                      <p className="font-semibold text-sm">{holiday.name}</p>
                      <p className={`text-xs ${textSecondary}`}>
                        {holiday.daysUntil === 0 ? 'Today!' : 
                         holiday.daysUntil === 1 ? 'Tomorrow' : 
                         `In ${holiday.daysUntil} days`}
                      </p>
                    </div>
                  ))}
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
                    <CalculatorIcon className="mx-auto mb-2 text-purple-500" size={24} />
                    <p className="text-sm font-medium">Calculator</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Birthdays View */}
          {activeView === 'birthdays' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <span>🎂</span>
                  Birthday Reminders
                </h2>
                <button
                  onClick={() => setShowAddBirthday(!showAddBirthday)}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg transition-all duration-200 hover:bg-purple-600 hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Plus size={20} />
                  {showAddBirthday ? 'Cancel' : 'Add Birthday'}
                </button>
              </div>

              {showAddBirthday && (
                <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mb-6`}>
                  <h3 className="text-xl font-semibold mb-4">Add New Birthday</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Name *"
                      value={newBirthday.name}
                      onChange={(e) => setNewBirthday({...newBirthday, name: e.target.value})}
                      className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
                    />
                    <input
                      type="date"
                      value={newBirthday.date}
                      onChange={(e) => setNewBirthday({...newBirthday, date: e.target.value})}
                      className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
                    />
                    <select
                      value={newBirthday.category}
                      onChange={(e) => setNewBirthday({...newBirthday, category: e.target.value})}
                      className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
                    >
                      <option value="family">Family</option>
                      <option value="friend">Friend</option>
                      <option value="colleague">Colleague</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={addBirthday}
                        className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-lg transition-all duration-200 hover:bg-purple-600 hover:scale-105 active:scale-95"
                      >
                        Save Birthday
                      </button>
                      <button
                        onClick={() => setShowAddBirthday(false)}
                        className="px-4 py-3 bg-gray-500 text-white rounded-lg transition-all duration-200 hover:bg-gray-600 hover:scale-105 active:scale-95"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getUpcomingBirthdays().map(birthday => (
                  <div key={birthday.id} className={`${cardBg} p-6 rounded-xl border ${borderColor} transition-all duration-200 hover:shadow-lg hover:scale-105 ${birthday.daysUntil === 0 ? 'ring-2 ring-purple-500' : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-xl font-semibold">{birthday.name}</h4>
                        <span className={`inline-block mt-1 px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          {birthday.category}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteBirthday(birthday.id)}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded transition-all duration-200"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="text-3xl mb-2">
                      {birthday.daysUntil === 0 ? '🎉' : 
                       birthday.daysUntil <= 7 ? '🎂' : '📅'}
                    </div>
                    <p className="text-lg font-semibold">
                      {birthday.daysUntil === 0 ? 'Today!' : 
                       birthday.daysUntil === 1 ? 'Tomorrow' : 
                       `In ${birthday.daysUntil} days`}
                    </p>
                    <p className={`text-sm ${textSecondary} mt-1`}>
                      {new Date(birthday.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                ))}
                {birthdays.length === 0 && (
                  <div className={`${cardBg} p-8 rounded-xl border ${borderColor} text-center ${textSecondary} col-span-full`}>
                    <span className="text-6xl mb-4 block">🎂</span>
                    <p>No birthdays added yet. Add your first birthday reminder!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Unit Converter View */}
          {activeView === 'converter' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Unit Converter</h2>
              
              <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mb-6`}>
                <h3 className="text-xl font-semibold mb-4">Select Conversion Type</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {Object.keys(unitOptions).map(type => (
                    <button
                      key={type}
                      onClick={() => handleConverterTypeChange(type)}
                      className={`px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                        converterType === type 
                          ? 'bg-blue-500 text-white shadow-lg' 
                          : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`${cardBg} p-8 rounded-xl border ${borderColor}`}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* From Unit */}
                  <div>
                    <label className={`block mb-2 font-medium ${textSecondary}`}>From</label>
                    <select
                      value={fromUnit}
                      onChange={(e) => {
                        setFromUnit(e.target.value);
                        if (inputValue) {
                          const result = convertUnit(inputValue, e.target.value, toUnit, converterType);
                          setOutputValue(result);
                        }
                      }}
                      className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor} mb-3`}
                    >
                      {unitOptions[converterType].map(unit => (
                        <option key={unit} value={unit}>
                          {unit.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={inputValue}
                      onChange={(e) => handleConvert(e.target.value)}
                      placeholder="Enter value"
                      className={`w-full px-4 py-4 rounded-lg ${cardBg} border ${borderColor} text-2xl`}
                    />
                  </div>

                  {/* Swap Button */}
                  <div className="hidden lg:flex items-center justify-center">
                    <button
                      onClick={swapUnits}
                      className={`p-4 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </button>
                  </div>

                  {/* To Unit */}
                  <div>
                    <label className={`block mb-2 font-medium ${textSecondary}`}>To</label>
                    <select
                      value={toUnit}
                      onChange={(e) => {
                        setToUnit(e.target.value);
                        if (inputValue) {
                          const result = convertUnit(inputValue, fromUnit, e.target.value, converterType);
                          setOutputValue(result);
                        }
                      }}
                      className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor} mb-3`}
                    >
                      {unitOptions[converterType].map(unit => (
                        <option key={unit} value={unit}>
                          {unit.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                    <div className={`w-full px-4 py-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'} border ${borderColor} text-2xl font-semibold ${outputValue ? 'text-blue-500' : textSecondary}`}>
                      {outputValue || '0'}
                    </div>
                  </div>
                </div>

                {/* Mobile Swap Button */}
                <div className="lg:hidden mt-4">
                  <button
                    onClick={swapUnits}
                    className={`w-full px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Swap Units
                  </button>
                </div>

                {/* Quick Conversions */}
                {inputValue && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold mb-3">Quick Conversions from {inputValue} {fromUnit.replace(/_/g, ' ')}:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {unitOptions[converterType].filter(unit => unit !== fromUnit).slice(0, 8).map(unit => (
                        <div key={unit} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <p className={`text-xs ${textSecondary} mb-1`}>
                            {unit.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <p className="font-semibold">
                            {convertUnit(inputValue, fromUnit, unit, converterType)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Common Conversions Reference */}
              <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mt-6`}>
                <h3 className="text-xl font-semibold mb-4">Common Conversions Reference</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-blue-500">Length</h4>
                    <ul className={`text-sm ${textSecondary} space-y-1`}>
                      <li>1 km = 1000 m</li>
                      <li>1 mile = 1.609 km</li>
                      <li>1 foot = 30.48 cm</li>
                      <li>1 inch = 2.54 cm</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-green-500">Weight</h4>
                    <ul className={`text-sm ${textSecondary} space-y-1`}>
                      <li>1 kg = 1000 g</li>
                      <li>1 kg = 2.205 lb</li>
                      <li>1 lb = 16 oz</li>
                      <li>1 ton = 1000 kg</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-orange-500">Temperature</h4>
                    <ul className={`text-sm ${textSecondary} space-y-1`}>
                      <li>0°C = 32°F</li>
                      <li>100°C = 212°F</li>
                      <li>0 K = -273.15°C</li>
                      <li>°F = (°C × 9/5) + 32</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-purple-500">Volume</h4>
                    <ul className={`text-sm ${textSecondary} space-y-1`}>
                      <li>1 L = 1000 mL</li>
                      <li>1 gallon = 3.785 L</li>
                      <li>1 cup = 236.6 mL</li>
                      <li>1 fl oz = 29.57 mL</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-pink-500">Area</h4>
                    <ul className={`text-sm ${textSecondary} space-y-1`}>
                      <li>1 km² = 100 hectares</li>
                      <li>1 acre = 4047 m²</li>
                      <li>1 hectare = 10000 m²</li>
                      <li>1 m² = 10.76 ft²</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-cyan-500">Speed</h4>
                    <ul className={`text-sm ${textSecondary} space-y-1`}>
                      <li>1 m/s = 3.6 km/h</li>
                      <li>1 mph = 1.609 km/h</li>
                      <li>1 knot = 1.852 km/h</li>
                      <li>1 km/h = 0.621 mph</li>
                    </ul>
                  </div>
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

          {/* Games View */}
          {activeView === 'games' && (
            <div>
              {!activeGame ? (
                <GamesMenu 
                  onSelectGame={(gameId) => {
                    setActiveGame(gameId);
                    if (gameId === 'memory') initMemoryGame();
                    if (gameId === 'guess') initGuessingGame();
                  }}
                  theme={theme}
                  cardBg={cardBg}
                  borderColor={borderColor}
                  textSecondary={textSecondary}
                />
              ) : (
                <div>
                  <button
                    onClick={() => setActiveGame(null)}
                    className="mb-6 px-4 py-2 bg-gray-500 text-white rounded-lg transition-all duration-200 hover:bg-gray-600 hover:scale-105 active:scale-95"
                  >
                    ← Back to Games
                  </button>

                  {activeGame === 'memory' && (
                    <MemoryMatch
                      memoryCards={memoryCards}
                      flippedCards={flippedCards}
                      matchedCards={matchedCards}
                      memoryMoves={memoryMoves}
                      gameWon={gameWon}
                      onCardClick={handleCardClick}
                      onNewGame={initMemoryGame}
                      theme={theme}
                      cardBg={cardBg}
                      borderColor={borderColor}
                      textSecondary={textSecondary}
                    />
                  )}

                  {activeGame === 'guess' && (
                    <NumberGuessing
                      guessNumber={guessNumber}
                      guessAttempts={guessAttempts}
                      guessHistory={guessHistory}
                      gameWon={gameWon}
                      onGuess={handleGuess}
                      onNewGame={initGuessingGame}
                      onInputChange={setGuessNumber}
                      theme={theme}
                      cardBg={cardBg}
                      borderColor={borderColor}
                      textSecondary={textSecondary}
                    />
                  )}

                  {activeGame === 'reaction' && (
                    <ReactionTime
                      reactionStartTime={reactionStartTime}
                      reactionWaiting={reactionWaiting}
                      reactionTimes={reactionTimes}
                      onStart={startReactionTest}
                      onClick={handleReactionClick}
                      theme={theme}
                      cardBg={cardBg}
                      borderColor={borderColor}
                      textSecondary={textSecondary}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Watchlist View */}
          {activeView === 'watchlist' && <Watchlist theme={theme} />}

          {/* Quick Links View */}
          {activeView === 'links' && <QuickLinks theme={theme} links={links} setLinks={setLinks} />}

          {/* Calculator View */}
          {activeView === 'calculator' && <Calculator theme={theme} />}

          {/* Ai Chat View */}
          {activeView === 'aichat' && <AiChat theme={theme} />}

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