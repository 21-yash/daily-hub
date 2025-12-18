import React, { useState, useEffect, useRef } from 'react';
import { Plus, CheckSquare, Key, StickyNote, Link2, Calculator as CalculatorIcon, Gauge, Moon, Sun, Menu, X, Search, Home, Settings, Download, Upload, Trash2, Eye, EyeOff, Copy, Lock, Bot, Clapperboard, Gamepad2, Cake, LogIn, LogOut, User, Newspaper, Goal, HandCoins, ScanText, CalendarClock, Music, FileText, ChevronRight, Filter, Calendar, Clock, Droplet, TextSearch, CalendarSearch } from 'lucide-react';
import QuickLinks from './components/links/QuickLinks';
import Calculator from './components/calculator/Calculator';
import Watchlist from './components/watchlist/Watchlist';
import { getSpecialDaysForDate, getUpcomingHolidays } from './utils/indianHolidays';
import AuthModal from './components/auth/AuthModal';
import { authService } from './services/authService';
import { getOnThisDay } from './utils/onThisDay';
import GamesMenu from './components/games/GamesMenu';
import MemoryMatch from './components/games/MemoryMatch';
import NumberGuessing from './components/games/NumberGuessing';
import ReactionTime from './components/games/ReactionTime';
import { encryptionService } from './utils/encryption';
import { greetingService } from './utils/greetings';
import DynamicCalendarIcon from './utils/calendarIcon.jsx';
import TicTacToe from './components/games/TicTacToe';
import WordGuess from './components/games/WordGuess';
import TypingTest from './components/games/TypingTest';
import WhacAMole from './components/games/WhacAMole';
import SimonSays from './components/games/SimonSays';
import ConnectFour from './components/games/ConnectFour';
import Chess from './components/games/Chess';
import HabitTracker from './components/habits/HabitTracker';
import ExpenseTracker from './components/expenses/ExpenseTracker';
import TextCounter from './components/tools/TextCounter';
import NewsFeed from './components/news/NewsFeed';
import TimeZoneConverter from './components/tools/TimeZoneConverter';
import CricketScoreboard from './components/cricket/CricketScoreboard';
import PdfTools from './components/tools/PdfTools';
import FindReplace from './components/tools/FindReplace';
import AgeCalculator from './components/tools/AgeCalculator';
import cricketIcon from './assets/icons/cricketIcon.svg?react';
import { 
  todoService, 
  noteService, 
  passwordService, 
  birthdayService, 
  linkService, 
  expenseService, 
  habitService, 
  migrationService
} from './services/api';
import { syncQueue } from './services/syncQueue';

const DailyHub = () => {
  const [theme, setTheme] = useState('light');
  const [activeView, setActiveView] = useState('dashboard');
  const [showDrawer, setShowDrawer] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [syncTimeout, setSyncTimeout] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showFABMenu, setShowFABMenu] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
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
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
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
  const [city, setCity] = useState('Nashik');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [greetingData, setGreetingData] = useState(null);
  const [showWeatherDetail, setShowWeatherDetail] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showWeekOfMonth, setShowWeekOfMonth] = useState(false);

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

  // Habits state
  const [habits, setHabits] = useState([]);

  // Expenses state
  const [expenses, setExpenses] = useState([]);

  // Game states
  const [ticTacToeBoard, setTicTacToeBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [ticTacToeWinner, setTicTacToeWinner] = useState(null);
  const [wordGuessSolution, setWordGuessSolution] = useState('');
  const [wordGuesses, setWordGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [wordGuessStatus, setWordGuessStatus] = useState('playing');
  const [typingText] = useState("The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet. Practice makes perfect.");
  const [userInput, setUserInput] = useState('');
  const [typingStatus, setTypingStatus] = useState('waiting');
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [moles, setMoles] = useState(Array(9).fill(false));
  const [whacScore, setWhacScore] = useState(0);
  const [whacTimeLeft, setWhacTimeLeft] = useState(0);
  const [isWhacActive, setIsWhacActive] = useState(false);
  const [simonSequence, setSimonSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [simonStatus, setSimonStatus] = useState('waiting');
  const [litButton, setLitButton] = useState(null);
  const [connectFourBoard, setConnectFourBoard] = useState(Array(6).fill(Array(7).fill(null)));
  const [cfCurrentPlayer, setCfCurrentPlayer] = useState('player');
  const [connectFourWinner, setConnectFourWinner] = useState(null);

  const FIVE_LETTER_WORDS = ['REACT', 'HELLO', 'WORLD', 'GAMES', 'THEME', 'STYLE', 'QUERY'];

  const viewHistoryRef = useRef(['dashboard']);
  const lastBackPress = useRef(0);
  
  // Track view changes
  useEffect(() => {
    if (activeView && viewHistoryRef.current[viewHistoryRef.current.length - 1] !== activeView) {
      viewHistoryRef.current.push(activeView);
    }
  }, [activeView]);

  // Safely parse JSON with fallback
  const safeJSONParse = (data, fallback = null) => {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('JSON parse error:', error);
      return fallback;
    }
  };

  // Batch update localStorage
  const batchUpdateLocalStorage = (updates) => {
    Object.entries(updates).forEach(([key, value]) => {
      try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, stringValue);
      } catch (error) {
        console.error(`Failed to save ${key} to localStorage:`, error);
      }
    });
  };

  // Clear specific data
  const clearUserData = (keepTheme = true) => {
    const keysToKeep = keepTheme ? ['theme'] : [];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
  };

  const withErrorHandling = async (operation, errorMessage) => {
    try {
      return await operation();
    } catch (error) {
      console.error(errorMessage, error);
      showToast(errorMessage, 'error');
      return null;
    }
  };

  const loadLocalData = () => {
    console.log('📂 Loading data from localStorage...');
    const localTodos = safeJSONParse(localStorage.getItem('todos'), []);
    const localNotes = safeJSONParse(localStorage.getItem('notes'), []);
    const localPasswords = safeJSONParse(localStorage.getItem('passwords'), []);
    const localBirthdays = safeJSONParse(localStorage.getItem('birthdays'), []);
    const localLinks = safeJSONParse(localStorage.getItem('links'), []);
    const localHabits = safeJSONParse(localStorage.getItem('habits'), []);
    const localExpenses = safeJSONParse(localStorage.getItem('expenses'), []);
    const localTheme = localStorage.getItem('theme') || 'light';
    
    setTodos(localTodos || []);
    setNotes(localNotes || []);
    setPasswords(localPasswords || []);
    setBirthdays(localBirthdays || []);
    setLinks(localLinks || []);
    setHabits(localHabits || []);
    setExpenses(localExpenses || []);
    setTheme(localTheme);
    
    // Check for master password
    const savedMasterPass = localStorage.getItem('masterPassword');
    if (savedMasterPass) {
      setMasterPassword(savedMasterPass);
      setMasterPasswordSet(true);
    }
    
    const savedRecovery = safeJSONParse(localStorage.getItem('recoveryData'));
    if (savedRecovery) {
      setRecoveryQuestion(savedRecovery.question);
      setRecoveryAnswer(savedRecovery.answer);
    }
  };

  // Load data from API on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      try {
        const isAuth = authService.isAuthenticated();
        
        if (isAuth) {
          setIsAuthenticated(true);
          
          // Load user info
          const userInfo = await authService.getUserInfo();
          setCurrentUser(userInfo);
          const userId = localStorage.getItem('userId');
          
          // Load all data in parallel
          try {
            const [
              todosRes, 
              notesRes, 
              passwordsRes, 
              birthdaysRes, 
              linksRes, 
              expensesRes, 
              habitsRes
            ] = await Promise.all([
              todoService.getAll(),
              noteService.getAll(),
              passwordService.getAll(),
              birthdayService.getAll(),
              linkService.getAll(),
              expenseService.getAll(),
              habitService.getAll()
            ]);

            // Decrypt passwords
            let decryptedPasswords = [];
            if (passwordsRes.data && passwordsRes.data.length > 0) {
                try {
                    decryptedPasswords = encryptionService.decryptPasswordArray(passwordsRes.data, userId);
                } catch (e) {
                    console.error("Failed to decrypt passwords", e);
                }
            }

            setTodos((todosRes.data || []).map(t => ({ ...t, id: t._id || t.id })));
            setNotes((notesRes.data || []).map(n => ({ ...n, id: n._id || n.id })));
            setPasswords(decryptedPasswords.map(p => ({ ...p, id: p._id || p.id })));
            setBirthdays((birthdaysRes.data || []).map(b => ({ ...b, id: b._id || b.id })));
            setLinks((linksRes.data || []).map(l => ({ ...l, id: l._id || l.id })));
            setExpenses((expensesRes.data || []).map(e => ({ ...e, id: e._id || e.id })));
            setHabits((habitsRes.data || []).map(h => ({ ...h, id: h._id || h.id })));

            try {
              const settingsRes = await authService.getSettings();
              
              if (settingsRes.masterPassword) {
                try {
                  // Decrypt master password
                  const decryptedMasterPass = encryptionService.decrypt(settingsRes.masterPassword, userId);
                  setMasterPassword(decryptedMasterPass);
                  setMasterPasswordSet(true);
                  localStorage.setItem('masterPassword', decryptedMasterPass);
                  console.log('✅ Master password loaded from server');
                } catch (decryptErr) {
                  console.error('Failed to decrypt master password:', decryptErr);
                }
              }
              
              if (settingsRes.recoveryData) {
                try {
                  const recoveryData = settingsRes.recoveryData;
                  
                  if (recoveryData.question) {
                    setRecoveryQuestion(recoveryData.question); // Question is plain text
                  }
                  
                  if (recoveryData.answer) {
                    const decryptedAnswer = encryptionService.decrypt(recoveryData.answer, userId);
                    setRecoveryAnswer(decryptedAnswer);
                  }
                  
                  localStorage.setItem('recoveryData', JSON.stringify({
                    question: recoveryData.question,
                    answer: recoveryData.answer ? encryptionService.decrypt(recoveryData.answer, userId) : ''
                  }));
                  
                  console.log('✅ Recovery data loaded from server');
                } catch (decryptErr) {
                  console.error('Failed to decrypt recovery data:', decryptErr);
                }
              }
              
              if (settingsRes.theme) {
                setTheme(settingsRes.theme);
              }
            } catch (settingsError) {
              console.warn('Could not load settings from server:', settingsError);
            }
            
            console.log('✅ All granular data loaded successfully');

          } catch (err) {
            console.error('Partial load failure or network error:', err);
            // If network error, maybe load from localStorage?
            // For now, we fall back to loadLocalData() if everything fails
            if (!navigator.onLine) {
                 loadLocalData();
            }
          }
          
        } else {
          // Not authenticated - load from localStorage
          setIsAuthenticated(false);
          loadLocalData();
        }
      } catch (error) {
        console.error('❌ Failed to load user data:', error);
        showToast('Failed to load data. Please try logging in again.', 'error');
        loadLocalData();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const refreshData = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('❌ No auth token, skipping refresh');
      return;
    }
    console.log('🔄 Refreshing data from server...');
    try {
        const [
            todosRes, 
            notesRes, 
            passwordsRes, 
            birthdaysRes, 
            linksRes, 
            expensesRes, 
            habitsRes
        ] = await Promise.all([
            todoService.getAll(),
            noteService.getAll(),
            passwordService.getAll(),
            birthdayService.getAll(),
            linkService.getAll(),
            expenseService.getAll(),
            habitService.getAll()
        ]);

        const userId = localStorage.getItem('userId');
        let decryptedPasswords = [];
        if (passwordsRes.data && passwordsRes.data.length > 0) {
            try {
                decryptedPasswords = encryptionService.decryptPasswordArray(passwordsRes.data, userId);
            } catch (e) { console.error(e); }
        }

        setTodos((todosRes.data || []).map(t => ({ ...t, id: t._id || t.id })));
        setNotes((notesRes.data || []).map(n => ({ ...n, id: n._id || n.id })));
        setPasswords(decryptedPasswords.map(p => ({ ...p, id: p._id || p.id })));
        setBirthdays((birthdaysRes.data || []).map(b => ({ ...b, id: b._id || b.id })));
        setLinks((linksRes.data || []).map(l => ({ ...l, id: l._id || l.id })));
        setExpenses((expensesRes.data || []).map(e => ({ ...e, id: e._id || e.id })));
        setHabits((habitsRes.data || []).map(h => ({ ...h, id: h._id || h.id })));

        try {
          const settingsRes = await authService.getSettings();
              
          if (settingsRes.masterPassword) {
            try {
              // Decrypt master password
              const decryptedMasterPass = encryptionService.decrypt(settingsRes.masterPassword, userId);
              setMasterPassword(decryptedMasterPass);
              setMasterPasswordSet(true);
              localStorage.setItem('masterPassword', decryptedMasterPass);
              console.log('✅ Master password loaded from server');
            } catch (decryptErr) {
                console.error('Failed to decrypt master password:', decryptErr);
              }
          }
              
          if (settingsRes.recoveryData) {
            try {
              const recoveryData = settingsRes.recoveryData;
                  
              if (recoveryData.question) {
                setRecoveryQuestion(recoveryData.question); // Question is plain text
              }
                  
              if (recoveryData.answer) {
                const decryptedAnswer = encryptionService.decrypt(recoveryData.answer, userId);
                setRecoveryAnswer(decryptedAnswer);
              }
                  
              localStorage.setItem('recoveryData', JSON.stringify({
                question: recoveryData.question,
                answer: recoveryData.answer ? encryptionService.decrypt(recoveryData.answer, userId) : ''
              }));
                  
              console.log('✅ Recovery data loaded from server');
            } catch (decryptErr) {
              console.error('Failed to decrypt recovery data:', decryptErr);
            }
          }
              
          if (settingsRes.theme) {
            setTheme(settingsRes.theme);
          }
        } catch (settingsError) {
          console.warn('Could not load settings from server:', settingsError);
        }
        
        console.log('✅ Data refreshed');
        return true;
    } catch (error) {
        console.error('❌ Refresh failed:', error);
        return false;
    }
  };

  useEffect(() => {
    setGreetingData(getGreetingData());
  }, [currentUser]);

  // Add this new useEffect to handle sync results
  useEffect(() => {
    const handleSyncComplete = (e) => {
      const { results } = e.detail;
      
      // Replace temp IDs with real MongoDB IDs
      results.forEach(result => {
        if (result.tempId && result.data?._id) {
          const realId = result.data._id;
          
          switch(result.type) {
            case 'todo':
              setTodos(prev => prev.map(t => 
                t.id === result.tempId ? { ...result.data, id: realId } : t
              ));
              break;
              
            case 'note':
              setNotes(prev => prev.map(n => 
                n.id === result.tempId ? { ...result.data, id: realId } : n
              ));
              break;
              
            case 'password':
              setPasswords(prev => prev.map(p => 
                p.id === result.tempId ? { ...result.data, id: realId } : p
              ));
              break;
              
            case 'birthday':
              setBirthdays(prev => prev.map(b => 
                b.id === result.tempId ? { ...result.data, id: realId } : b
              ));
              break;
              
            case 'expense':
              setExpenses(prev => prev.map(e => 
                e.id === result.tempId ? { ...result.data, id: realId } : e
              ));
              break;
              
            case 'habit':
              setHabits(prev => prev.map(h => 
                h.id === result.tempId ? { ...result.data, id: realId } : h
              ));
              break;
              
            case 'link':
              setLinks(prev => prev.map(l => 
                l.id === result.tempId ? { ...result.data, id: realId } : l
              ));
              break;           
          }
        }
      });
    };
    
    window.addEventListener('syncComplete', handleSyncComplete);
    return () => window.removeEventListener('syncComplete', handleSyncComplete);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Handle visibility change (app going to background)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        console.log('📱 App going to background, processing queue...');
        await syncQueue.processQueue();
      } else {
        // App coming to foreground, refresh data
        console.log('📱 App coming to foreground, refreshing data...');
        await refreshData();
      }
    };

    // Handle before unload (app closing)
    const handleBeforeUnload = async (e) => {
      console.log('🚪 App closing, processing queue...');
      await syncQueue.processQueue();
    };

    // Handle page hide (more reliable than beforeunload on mobile)
    const handlePageHide = async () => {
      console.log('👋 Page hiding, processing queue...');
      await syncQueue.processQueue();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [isAuthenticated, todos, passwords, notes, birthdays, links, habits, expenses, theme, masterPasswordSet]);

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
    const interval = setInterval(checkBirthdays, 3600000);
    return () => clearInterval(interval);
  }, [birthdays]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedCity = localStorage.getItem('city') || 'Nashik';
    setCity(savedCity);
    fetchWeather(savedCity);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeGame !== 'word-guess' || wordGuessStatus !== 'playing') return;
      const key = e.key.toUpperCase();
      if (key === 'ENTER' && currentGuess.length === 5) {
        submitGuess();
      } else if (key === 'BACKSPACE') {
        setCurrentGuess(prev => prev.slice(0, -1));
      } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
        setCurrentGuess(prev => prev + key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    let gameInterval;
    if (isWhacActive && whacTimeLeft > 0) {
      gameInterval = setInterval(() => {
        setWhacTimeLeft(time => time - 1);
        const randomIndex = Math.floor(Math.random() * 9);
        setMoles(currentMoles => {
          const newMoles = Array(9).fill(false);
          newMoles[randomIndex] = true;
          return newMoles;
        });
      }, 1000);
    } else if (whacTimeLeft === 0 && isWhacActive) {
      setIsWhacActive(false);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(gameInterval);
    };
  }, [activeGame, currentGuess, wordGuessStatus, isWhacActive, whacTimeLeft]);

  const getWeatherDescription = (code, isDay = 1) => {
    const descriptions = {
      0:  { description: 'Clear sky', main: 'Clear', icon: isDay ? '☀️' : '🌙' },
      1:  { description: 'Mainly clear', main: 'Clear', icon: isDay ? '🌤️' : '☁️' },
      2:  { description: 'Partly cloudy', main: 'Clouds', icon: isDay ? '⛅️' : '☁️' },
      3:  { description: 'Overcast', main: 'Clouds', icon: '☁️' },
      45: { description: 'Fog', main: 'Fog', icon: '🌫️' },
      48: { description: 'Depositing rime fog', main: 'Fog', icon: '🌫️' },
      51: { description: 'Light drizzle', main: 'Drizzle', icon: '🌦️' },
      53: { description: 'Moderate drizzle', main: 'Drizzle', icon: '🌦️' },
      55: { description: 'Dense drizzle', main: 'Drizzle', icon: '🌧️' },
      56: { description: 'Light freezing drizzle', main: 'Drizzle', icon: '🌧️❄️' },
      57: { description: 'Dense freezing drizzle', main: 'Drizzle', icon: '🌧️❄️' },
      61: { description: 'Slight rain', main: 'Rain', icon: '🌧️' },
      63: { description: 'Moderate rain', main: 'Rain', icon: '🌧️' },
      65: { description: 'Heavy rain', main: 'Rain', icon: '🌧️' },
      66: { description: 'Light freezing rain', main: 'Rain', icon: '🌧️❄️' },
      67: { description: 'Heavy freezing rain', main: 'Rain', icon: '🌧️❄️' },
      71: { description: 'Slight snow fall', main: 'Snow', icon: '🌨️' },
      73: { description: 'Moderate snow fall', main: 'Snow', icon: '🌨️' },
      75: { description: 'Heavy snow fall', main: 'Snow', icon: '❄️' },
      77: { description: 'Snow grains', main: 'Snow', icon: '❄️' },
      80: { description: 'Slight rain showers', main: 'Rain', icon: '🌦️' },
      81: { description: 'Moderate rain showers', main: 'Rain', icon: '🌧️' },
      82: { description: 'Violent rain showers', main: 'Rain', icon: '🌧️🌊' },
      85: { description: 'Slight snow showers', main: 'Snow', icon: '🌨️' },
      86: { description: 'Heavy snow showers', main: 'Snow', icon: '❄️' },
      95: { description: 'Thunderstorm', main: 'Thunderstorm', icon: '⛈️' },
      96: { description: 'Thunderstorm with slight hail', main: 'Thunderstorm', icon: '⛈️❄️' },
      99: { description: 'Thunderstorm with heavy hail', main: 'Thunderstorm', icon: '⛈️❄️' },
    };

    const info = descriptions[Number(code)];
    return info || { description: 'Unknown weather', main: 'Clear', icon: '☀️' };
  };

  const fetchWeather = async (cityName) => {
    setWeatherLoading(true);
    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`
      );
      const geoData = await geoResponse.json();

      if (!geoData.results) {
        throw new Error('City not found');
      }

      const { latitude, longitude, name } = geoData.results[0];

      const weatherParams = [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'is_day',
        'precipitation',
        'weather_code',
        'wind_speed_10m'
      ];
      const dailyParams = [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'sunrise',
        'sunset',
        'precipitation_probability_max'
      ];
       const hourlyParams = [
        'temperature_2m',
        'weather_code',
        'precipitation_probability'
      ];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=${weatherParams.join(',')}&daily=${dailyParams.join(',')}&hourly=${hourlyParams.join(',')}&timezone=auto`
      );
      const weatherData = await weatherResponse.json();

      const { description, main, icon } = getWeatherDescription(weatherData.current.weather_code, weatherData.current.is_day);
      
      const dailyForecast = weatherData.daily.time.map((date, index) => ({
        date,
        code: weatherData.daily.weather_code[index],
        temp_max: Math.round(weatherData.daily.temperature_2m_max[index]),
        temp_min: Math.round(weatherData.daily.temperature_2m_min[index]),
        precipitation_probability: weatherData.daily.precipitation_probability_max[index],
        ...getWeatherDescription(weatherData.daily.weather_code[index])
      }));
      
      const now = new Date();
      const currentHour = now.getHours();
      const hourlyForecast = weatherData.hourly.time.filter(time => new Date(time).getHours() >= currentHour)
        .slice(0, 12)
        .map((time, index) => {
          const dataIndex = weatherData.hourly.time.findIndex(t => t === time);
          return {
            time: new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
            temp: Math.round(weatherData.hourly.temperature_2m[dataIndex]),
            code: weatherData.hourly.weather_code[dataIndex],
            precipitation_probability: weatherData.hourly.precipitation_probability[dataIndex],
            ...getWeatherDescription(weatherData.hourly.weather_code[dataIndex])
          }
      });

      setWeather({
        name: name,
        current: {
          code: weatherData.current.weather_code,
          is_day: weatherData.current.is_day,
          temp: Math.round(weatherData.current.temperature_2m),
          feels_like: Math.round(weatherData.current.apparent_temperature),
          humidity: weatherData.current.relative_humidity_2m,
          wind_speed: weatherData.current.wind_speed_10m,
          description: description,
          main: main,
          icon: icon,
        },
        today: {
            temp_max: Math.round(weatherData.daily.temperature_2m_max[0]),
            temp_min: Math.round(weatherData.daily.temperature_2m_min[0]),
            sunrise: weatherData.daily.sunrise[0],
            sunset: weatherData.daily.sunset[0],
        },
        daily: dailyForecast,
        hourly: hourlyForecast
      });

    } catch (error) {
      console.error("Failed to fetch weather:", error);
      showToast('Could not fetch weather data.', 'error');
      setWeather({ // Set a default error state
        name: cityName,
        current: { temp: '--', feels_like: '--', description: 'Weather unavailable', main: 'Clear', icon: '🤷' },
        today: { temp_max: '--', temp_min: '--' },
        daily: [],
        hourly: [],
      });
    } finally {
      setWeatherLoading(false);
    }
  };

  const getGreetingData = () => {
    const username = currentUser?.username || null;
    return greetingService.getGreetingPackage(username);
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

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (isAuthenticated) {
        try {
            await authService.updateSettings({ theme: newTheme });
        } catch (error) {
            console.error("Failed to sync theme", error);
        }
    }
  };

  const addTodo = async () => {
    if (newTodo.trim()) {
      const tempId = `temp_${Date.now()}`;
      const todo = {
        text: newTodo,
        completed: false,
        priority: 'medium',
        createdAt: new Date().toISOString(),
        category: 'general'
      };
      
      // Optimistic update
      const optimisticTodo = { ...todo, id: tempId };
      setTodos([optimisticTodo, ...todos]);
      setNewTodo('');
      
      // Add to sync queue (handles both online and offline)
      if (isAuthenticated) {
        syncQueue.add('todo', 'create', todo, tempId);
      }
      
      showToast('Task added successfully!');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    const updatedTodo = { ...todo, completed: !todo.completed, id };
    
    // Optimistic update
    setTodos(todos.map(t => t.id === id ? updatedTodo : t));
    
    // Add to sync queue
    if (isAuthenticated) {
      syncQueue.add('todo', 'update', updatedTodo, id);
    }
  };

  const deleteTodo = async (id) => {
    // Optimistic update
    setTodos(todos.filter(todo => todo.id !== id));
    
    // Add to sync queue
    if (isAuthenticated) {
      syncQueue.add('todo', 'delete', { _id: id }, id);
    }
    
    showToast('Task deleted', 'info');
  };

  const updateTodoPriority = (id, priority) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, priority } : todo
    ));
  };

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

  const setupMasterPassword = async () => {
    if (passwordInput.length < 6) {
      showToast('Master password must be at least 6 characters', 'error');
      return;
    }
    if (!recoveryQuestion || !recoveryAnswer) {
      showToast('Please set up recovery question and answer', 'error');
      return;
    }
    
    // Save to localStorage first
    localStorage.setItem('masterPassword', passwordInput);
    const recoveryData = {
      question: recoveryQuestion,
      answer: recoveryAnswer.toLowerCase()
    };
    localStorage.setItem('recoveryData', JSON.stringify(recoveryData));
    
    // Update state
    setMasterPassword(passwordInput);
    setMasterPasswordSet(true);
    setIsUnlocked(true);
    setPasswordInput('');
    setLastActivity(Date.now());
    
    console.log('✅ Master password set in localStorage and state');
    showToast('Master password created successfully!');
    
    // Immediately sync to server if authenticated
    if (isAuthenticated) {
      console.log('🔄 Syncing master password to server...');
      try {
        const userId = localStorage.getItem('userId');
        const encryptedMasterPass = encryptionService.encryptMasterPassword(passwordInput, userId);
        const encryptedRecovery = encryptionService.encryptRecoveryData(recoveryData, userId);
        
        await authService.updateSettings({
          masterPassword: encryptedMasterPass,
          recoveryData: encryptedRecovery
        });
      } catch (error) {
        console.error("Failed to sync master password", error);
        showToast('Failed to sync master password to server', 'warning');
      }
    }
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

  const addPasswordEntry = async () => {
    if (!newPasswordEntry.title || !newPasswordEntry.password) {
      showToast('Title and Password are required', 'error');
      return;
    }
    
    const tempId = `temp_${Date.now()}`;
    const entry = {
      ...newPasswordEntry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Optimistic update (unencrypted for local view)
    const optimisticEntry = { ...entry, id: tempId };
    setPasswords([optimisticEntry, ...passwords]);
    
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
    
    if (isAuthenticated) {
      const userId = localStorage.getItem('userId');
      const encryptedEntry = encryptionService.encryptPasswordEntry(entry, userId);
      syncQueue.add('password', 'create', encryptedEntry, tempId);
    }
    
    showToast('Password saved successfully!');
  };

  const deletePasswordEntry = async (id) => {
    setPasswords(passwords.filter(p => p.id !== id));
    setLastActivity(Date.now());
    
    if (isAuthenticated) {
      syncQueue.add('password', 'delete', { id }, id);
    }
    
    showToast('Password deleted', 'info');
  };

  const filteredPasswords = passwords.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchPassword.toLowerCase()) ||
                         p.username.toLowerCase().includes(searchPassword.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['general', 'social', 'banking', 'work', 'email', 'shopping', 'other'];

  const addOrUpdateNote = async () => {
    if (!currentNote.title.trim()) {
      showToast('Note title is required', 'error');
      return;
    }

    if (editingNote) {
      // Update existing
      const updatedNote = { 
        ...editingNote, 
        ...currentNote, 
        updatedAt: new Date().toISOString() 
      };
      
      setNotes(notes.map(note => note.id === editingNote.id ? updatedNote : note));
      
      if (isAuthenticated) {
        syncQueue.add('note', 'update', updatedNote, editingNote.id);
      }
      
      showToast('Note updated successfully!');
    } else {
      // Create new
      const tempId = `temp_${Date.now()}`;
      const newNote = {
        ...currentNote,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const optimisticNote = { ...newNote, id: tempId };
      setNotes([optimisticNote, ...notes]);
      
      if (isAuthenticated) {
        syncQueue.add('note', 'create', newNote, tempId);
      }
      
      showToast('Note added successfully!');
    }

    setCurrentNote({ title: '', content: '', category: 'personal' });
    setShowAddNote(false);
    setEditingNote(null);
  };

  const deleteNote = async (id) => {
    setNotes(notes.filter(note => note.id !== id));
    
    if (isAuthenticated) {
      syncQueue.add('note', 'delete', { id }, id);
    }
    
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

  const addBirthday = async () => {
    if (newBirthday.name && newBirthday.date) {
      const tempId = `temp_${Date.now()}`;
      const birthday = {
        ...newBirthday,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const optimisticBirthday = { ...birthday, id: tempId };
      setBirthdays([...birthdays, optimisticBirthday]);
      
      setNewBirthday({ name: '', date: '' });
      setShowAddBirthday(false);
      
      if (isAuthenticated) {
        syncQueue.add('birthday', 'create', birthday, tempId);
      }
      
      showToast('Birthday added successfully!');
    } else {
      showToast('Name and date are required', 'error');
    }
  };

  const deleteBirthday = async (id) => {
    setBirthdays(birthdays.filter(b => b.id !== id));
    
    if (isAuthenticated) {
      syncQueue.add('birthday', 'delete', { id }, id);
    }
    
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
    
    showToast(`Welcome back, ${userData.username}!`, 'success');
    
    try {
      // Load granular data
      await refreshData();   
      showToast('Login successful! Data loaded.', 'success');

    } catch (error) {
      console.error('Failed to load user data:', error);
      showToast('Login successful but failed to load data.', 'warning');
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    showToast('Syncing data before logout...', 'info');
    
    try {
      // Final sync with timeout
      await Promise.race([
        syncQueue.processQueue(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Sync timeout')), 5000)
        )
      ]);
    } catch (error) {
      console.error('Failed final sync:', error);
      showToast('Sync timeout - logging out anyway', 'warning');
    }
    
    // Clear all state
    const clearState = () => {
      setTodos([]);
      setPasswords([]);
      setNotes([]);
      setBirthdays([]);
      setLinks([]);
      setHabits([]);
      setExpenses([]);
      setMasterPasswordSet(false);
      setIsUnlocked(false);
    };

    // Clear localStorage
    const clearStorage = () => {
      const keysToKeep = ['theme']; // Keep theme preference
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
    };

    clearState();
    clearStorage();
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    
    showToast('Logged out successfully', 'info');
    setShowLogoutConfirm(false);
    
    // Navigate to dashboard
    setActiveView('dashboard');
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

  const initTicTacToe = () => {
    setTicTacToeBoard(Array(9).fill(null));
    setTicTacToeWinner(null);
    setCurrentPlayer('X');
  };

  const checkTicTacToeWinner = (board) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    if (board.every(cell => cell !== null)) return 'Draw';
    return null;
  };

  const handleCellClick = (index) => {
    if (ticTacToeBoard[index] || ticTacToeWinner) return;
    const newBoard = [...ticTacToeBoard];
    newBoard[index] = currentPlayer;
    setTicTacToeBoard(newBoard);

    const winner = checkTicTacToeWinner(newBoard);
    if (winner) {
      setTicTacToeWinner(winner);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const initWordGuess = () => {
    const newSolution = FIVE_LETTER_WORDS[Math.floor(Math.random() * FIVE_LETTER_WORDS.length)];
    setWordGuessSolution(newSolution);
    setWordGuesses([]);
    setCurrentGuess('');
    setWordGuessStatus('playing');
  };

  const submitGuess = () => {
    const evaluation = currentGuess.split('').map((letter, index) => {
      if (letter === wordGuessSolution[index]) return 'correct';
      if (wordGuessSolution.includes(letter)) return 'present';
      return 'absent';
    });

    const newGuesses = [...wordGuesses, { word: currentGuess, evaluation }];
    setWordGuesses(newGuesses);
    setCurrentGuess('');

    if (currentGuess === wordGuessSolution) {
      setWordGuessStatus('won');
    } else if (newGuesses.length === 6) {
      setWordGuessStatus('lost');
    }
  };

  const initTypingTest = () => {
    setUserInput('');
    setTypingStatus('waiting');
    setStartTime(null);
    setWpm(0);
    setAccuracy(0);
  };

  const handleTypingInputChange = (e) => {
    const value = e.target.value;
    if (typingStatus === 'waiting') {
      setTypingStatus('typing');
      setStartTime(Date.now());
    }
    
    if (value.length >= typingText.length) {
      setUserInput(typingText);
      setTypingStatus('finished');
      const endTime = Date.now();
      const durationInMinutes = (endTime - startTime) / 60000;
      const wordsTyped = typingText.split(' ').length;
      setWpm(Math.round(wordsTyped / durationInMinutes));
      
      let correctChars = 0;
      for (let i = 0; i < typingText.length; i++) {
        if (typingText[i] === value[i]) {
          correctChars++;
        }
      }
      setAccuracy(Math.round((correctChars / typingText.length) * 100));

    } else {
      setUserInput(value);
    }
  };

  const initWhacAMole = () => {
    setIsWhacActive(true);
    setWhacScore(0);
    setWhacTimeLeft(30);
    setMoles(Array(9).fill(false));
  };

  const handleMoleWhack = (index) => {
    if (moles[index]) {
      setWhacScore(score => score + 1);
      setMoles(Array(9).fill(false));
    }
  };

  const initSimonGame = () => {
    setSimonSequence([]);
    setPlayerSequence([]);
    setIsPlayerTurn(false);
    setSimonStatus('playing');
    setTimeout(addSimonStep, 500);
  };

  const playSequence = (sequence) => {
    setIsPlayerTurn(false);
    let i = 0;
    const interval = setInterval(() => {
      setLitButton(sequence[i]);
      setTimeout(() => setLitButton(null), 400);
      i++;
      if (i >= sequence.length) {
        clearInterval(interval);
        setIsPlayerTurn(true);
        setPlayerSequence([]);
      }
    }, 800);
  };

  const addSimonStep = () => {
    const colors = ['green', 'red', 'yellow', 'blue'];
    const nextColor = colors[Math.floor(Math.random() * 4)];
    setSimonSequence(currentSequence => {
      const newSequence = [...currentSequence, nextColor];
      playSequence(newSequence);
      return newSequence;
    });
  };

  const handleSimonClick = (color) => {
    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);

    if (newPlayerSequence[newPlayerSequence.length - 1] !== simonSequence[newPlayerSequence.length - 1]) {
      setSimonStatus('lost');
      showToast(`Game Over! You reached level ${simonSequence.length}`, 'error');
      return;
    }

    if (newPlayerSequence.length === simonSequence.length) {
      setTimeout(addSimonStep, 1000);
    }
  };

  const initConnectFour = () => {
    setConnectFourBoard(Array(6).fill(Array(7).fill(null)));
    setConnectFourWinner(null);
    setCfCurrentPlayer('player');
  };

  const checkForWinner = (board) => {
    const ROWS = 6;
    const COLS = 7;
    const checkLine = (a, b, c, d) => a !== null && a === b && a === c && a === d;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (c + 3 < COLS && checkLine(board[r][c], board[r][c+1], board[r][c+2], board[r][c+3])) return board[r][c];
        if (r + 3 < ROWS && checkLine(board[r][c], board[r+1][c], board[r+2][c], board[r+3][c])) return board[r][c];
        if (r + 3 < ROWS && c + 3 < COLS && checkLine(board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3])) return board[r][c];
        if (r - 3 >= 0 && c + 3 < COLS && checkLine(board[r][c], board[r-1][c+1], board[r-2][c+2], board[r-3][c+3])) return board[r][c];
      }
    }
    if (board.every(row => row.every(cell => cell !== null))) return 'draw';
    return null;
  };

  const handleColumnClick = (colIndex) => {
    if (connectFourWinner || cfCurrentPlayer !== 'player') return;

    let newBoard = connectFourBoard.map(row => [...row]);
    let rowPlaced = false;

    for (let r = 5; r >= 0; r--) {
      if (newBoard[r][colIndex] === null) {
        newBoard[r][colIndex] = 'player';
        rowPlaced = true;
        break;
      }
    }

    if (!rowPlaced) {
      showToast('This column is full!', 'warning');
      return;
    }

    setConnectFourBoard(newBoard);
    const winner = checkForWinner(newBoard);
    if (winner) {
      setConnectFourWinner(winner);
    } else {
      setCfCurrentPlayer('ai');
      setTimeout(() => handleAiMove(newBoard), 500);
    }
  };

  const handleAiMove = (currentBoard) => {
    let newBoard = currentBoard.map(row => [...row]);
    let availableCols = [];
    for (let c = 0; c < 7; c++) {
      if (newBoard[0][c] === null) {
        availableCols.push(c);
      }
    }

    if(availableCols.length === 0) return;

    const randomCol = availableCols[Math.floor(Math.random() * availableCols.length)];
    
    for (let r = 5; r >= 0; r--) {
      if (newBoard[r][randomCol] === null) {
        newBoard[r][randomCol] = 'ai';
        break;
      }
    }

    setConnectFourBoard(newBoard);
    const winner = checkForWinner(newBoard);
    if (winner) {
      setConnectFourWinner(winner);
    } else {
      setCfCurrentPlayer('player');
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

  // Quick action items for FAB menu - Enhanced
  const fabActions = [
    { id: 'add-todo', label: 'Task', icon: CheckSquare, action: () => { setActiveView('todos'); setShowFABMenu(false); } },
    { id: 'add-note', label: 'Note', icon: StickyNote, action: () => { setActiveView('notes'); setShowAddNote(true); setShowFABMenu(false); } },
    { id: 'add-birthday', label: 'Birthday', icon: Cake, action: () => { setActiveView('birthdays'); setShowAddBirthday(true); setShowFABMenu(false); } },
    { id: 'add-link', label: 'Link', icon: Link2, action: () => { setActiveView('links'); setShowFABMenu(false); } },
    { id: 'add-habit', label: 'Habit', icon: Goal, action: () => { setActiveView('habits'); setShowFABMenu(false); } },
    { id: 'add-expense', label: 'Expense', icon: HandCoins, action: () => { setActiveView('expenses'); setShowFABMenu(false); } },
  ];

  const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`app-container ${bgColor} ${textColor}`}>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} p-6 rounded-2xl border ${borderColor} max-w-sm w-full`}>
            <h3 className="text-xl font-bold mb-3">Confirm Logout</h3>
            <p className={`${textSecondary} mb-6 text-sm`}>
              Are you sure you want to logout? Your data will be saved to the server.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium"
              >
                Logout
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications - Android Style */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2 w-full max-w-sm px-4">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-sm ${
              toast.type === 'success' ? 'bg-green-500/90 text-white' :
              toast.type === 'error' ? 'bg-red-500/90 text-white' :
              toast.type === 'warning' ? 'bg-orange-500/90 text-white' :
              'bg-blue-500/90 text-white'
            } animate-pop-up`}
          >
            <p className="text-sm font-medium text-center">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* Desktop Sidebar - visible on lg+ screens */}
      <aside className={`desktop-sidebar ${cardBg} ${borderColor}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-blue-500">Daily Hub</h1>
          <p className={`text-xs ${textSecondary} mt-1`}>Productivity Dashboard</p>
        </div>
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'todos', label: 'Tasks', icon: CheckSquare },
            { id: 'notes', label: 'Notes', icon: StickyNote },
            { id: 'passwords', label: 'Passwords', icon: Key },
            { id: 'habits', label: 'Habits', icon: Goal },
            { id: 'expenses', label: 'Expenses', icon: HandCoins },
            { id: 'birthdays', label: 'Birthdays', icon: Cake },
            { id: 'news', label: 'News', icon: Newspaper },
            { id: 'watchlist', label: 'Watchlist', icon: Clapperboard },
            { id: 'cricket', label: 'Cricket', icon: cricketIcon },
            { id: 'games', label: 'Games', icon: Gamepad2 },
            { id: 'links', label: 'Quick Links', icon: Link2 },
            { id: 'calculator', label: 'Calculator', icon: CalculatorIcon },
            { id: 'converter', label: 'Converter', icon: Gauge },
            { id: 'textcounter', label: 'Text Counter', icon: ScanText },
            { id: 'timezone', label: 'Timezones', icon: CalendarClock },
            { id: 'pdftools', label: 'PDF Tools', icon: FileText },
            { id: 'findreplace', label: 'Find & Replace', icon: TextSearch },
            { id: 'agecalculator', label: 'Age Calculator', icon: CalendarSearch },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`sidebar-nav-item w-full ${activeView === item.id ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className={`p-4 border-t border-gray-200 dark:border-gray-700`}>
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {isAuthenticated ? (
              <button 
                onClick={() => setActiveView('account')}
                className={`flex-1 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} flex items-center gap-2`}
              >
                <User size={18} />
                <span className="text-sm truncate">{currentUser?.username || 'Account'}</span>
              </button>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="flex-1 p-2 bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600"
              >
                <LogIn size={18} />
                <span className="text-sm">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content min-h-screen pb-20 lg:pb-4">
        {/* Top App Bar - Android Style */}
        <header className={`${cardBg} border-b ${borderColor} sticky top-0 z-40 backdrop-blur-md bg-opacity-95`}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowDrawer(true)}
              className={`mobile-menu-btn p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold">Daily Hub</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowGlobalSearch(!showGlobalSearch)}
              className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <Search size={20} />
            </button>
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {isAuthenticated ? (
              <button 
                onClick={() => setActiveView('account')}
                className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <User size={20} />
              </button>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <LogIn size={20} />
              </button>
            )}
          </div>
        </div>
        {/* Global Search Bar */}
        {showGlobalSearch && (
          <div className="px-4 pb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tools (Tasks, Notes, Calculator, etc.)"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                className={`w-full px-4 py-2 rounded-xl ${cardBg} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {globalSearchQuery && (
                <div className={`absolute top-full left-0 right-0 mt-2 ${cardBg} border ${borderColor} rounded-xl shadow-xl max-h-64 overflow-y-auto z-50`}>
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: Home, keywords: ['home', 'main'] },
                    { id: 'todos', label: 'Tasks', icon: CheckSquare, keywords: ['todo', 'task', 'checklist'] },
                    { id: 'notes', label: 'Notes', icon: StickyNote, keywords: ['note', 'memo'] },
                    { id: 'passwords', label: 'Passwords', icon: Key, keywords: ['password', 'vault', 'security'] },
                    { id: 'watchlist', label: 'Watchlist', icon: Clapperboard, keywords: ['movie', 'tv', 'show', 'watch'] },
                    { id: 'cricket', label: 'Cricket', icon: 'cricketIcon', keywords: ['cricket', 'score', 'sports'] },
                    { id: 'news', label: 'News', icon: Newspaper, keywords: ['news', 'article'] },
                    { id: 'birthdays', label: 'Birthdays', icon: Cake, keywords: ['birthday', 'celebration'] },
                    { id: 'habits', label: 'Habits', icon: Goal, keywords: ['habit', 'track', 'goal'] },
                    { id: 'expenses', label: 'Expenses', icon: HandCoins, keywords: ['expense', 'money', 'budget'] },
                    { id: 'games', label: 'Games', icon: Gamepad2, keywords: ['game', 'play'] },
                    { id: 'links', label: 'Quick Links', icon: Link2, keywords: ['link', 'bookmark'] },
                    { id: 'calculator', label: 'Calculator', icon: CalculatorIcon, keywords: ['calc', 'math'] },
                    { id: 'converter', label: 'Converter', icon: Gauge, keywords: ['convert', 'unit'] },
                    { id: 'textcounter', label: 'Text Counter', icon: ScanText, keywords: ['text', 'count', 'word'] },
                    { id: 'timezone', label: 'Timezone', icon: CalendarClock, keywords: ['time', 'zone', 'clock'] },
                    { id: 'pdftools', label: 'PDF Tools', icon: FileText, keywords: ['pdf', 'document'] },
                    { id: 'settings', label: 'Settings', icon: Settings, keywords: ['settings', 'preferences'] },
                    { id: 'findreplace', label: 'Find & Replace', icon: TextSearch, keywords: ['find', 'replace', 'text'] },
                    { id: 'agecalculator', label: 'Age Calculator', icon: CalendarSearch, keywords: ['age', 'calculator', 'birthdate'] },
                  ]
                    .filter(item => {
                      const query = globalSearchQuery.toLowerCase();
                      return item.label.toLowerCase().includes(query) || 
                             item.keywords.some(k => k.includes(query));
                    })
                    .map(item => {
                      const Icon = typeof item.icon === 'string' ? null : item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveView(item.id);
                            setShowGlobalSearch(false);
                            setGlobalSearchQuery('');
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                        >
                          {Icon ? <Icon size={20} /> : <span className="text-xl">{item.icon}</span>}
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Side Drawer - Android Style */}
      {showDrawer && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowDrawer(false)}
            style={{
              backdropFilter: 'blur(1px)',
              WebkitBackdropFilter: 'blur(1px)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
          />
          <div className={`fixed top-0 left-0 h-full w-72 ${cardBg} z-50 shadow-2xl transform transition-transform duration-300`}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Menu</h2>
                <button onClick={() => setShowDrawer(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-1">
                {[
                  { id: 'news', label: 'News', icon: Newspaper },
                  { id: 'birthdays', label: 'Birthdays', icon: Cake },
                  { id: 'passwords', label: 'Passwords', icon: Key },
                  { id: 'habits', label: 'Habits', icon: Goal },
                  { id: 'expenses', label: 'Expenses', icon: HandCoins },
                  { id: 'watchlist', label: 'Watchlist', icon: Clapperboard },
                  { id: 'cricket', label: 'Cricket', icon: cricketIcon },
                  { id: 'games', label: 'Games', icon: Gamepad2 },
                  { id: 'links', label: 'Quick Links', icon: Link2 },
                  { id: 'calculator', label: 'Calculator', icon: CalculatorIcon },
                  { id: 'agecalculator', label: 'Age Calculator', icon: CalendarSearch },
                  { id: 'converter', label: 'Converter', icon: Gauge },
                  { id: 'textcounter', label: 'Text Counter', icon: ScanText },
                  { id: 'timezone', label: 'Timezones', icon: CalendarClock },
                  { id: 'pdftools', label: 'PDF Tools', icon: FileText },
                  { id: 'findreplace', label: 'Find & Replace', icon: TextSearch },
                  { id: 'settings', label: 'Settings', icon: Settings },
                ].map(item => {
                  const Icon = typeof item.icon === 'string' ? null : item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id);
                        setShowDrawer(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                        activeView === item.id 
                          ? 'bg-blue-500 text-white' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {Icon ? <Icon size={20} /> : <span className="text-lg">{item.icon}</span>}
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {showWeatherDetail && weather && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setShowWeatherDetail(false)}
        >
          <div
            className={`${cardBg} relative p-6 rounded-3xl border ${borderColor} max-w-md w-full max-h-[90vh] overflow-visible shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-2xl rounded-3xl pointer-events-none"></div>
            <div className="relative z-10 overflow-y-auto max-h-[80vh]">

              {/* Header */}
              <div className="relative z-10 flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{weather.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className={`capitalize flex items-center gap-2 ${textSecondary}`}>
                      <span className="text-xl animate-pulse-soft">
                        {getWeatherDescription(weather.current.code, weather.current.is_day).icon}
                      </span>
                      {getWeatherDescription(weather.current.code, weather.current.is_day).description}
                    </p>
                  </div>

                  {/* Temperature + range */}
                  <div className="mt-2">
                    <span className="text-5xl font-semibold">
                      {weather.current.temp}
                      <span className="text-2xl font-bold opacity-50">°C</span>
                    </span>
                    <p className="flex items-center gap-1 text-sm text-gray-400 mt-0.5">
                      <span className="text-red-400">🌡️</span>
                      Feels like {weather.current.feels_like}°C
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                      <span className="text-blue-400 font-semibold">{weather.today.temp_min}°</span>
                      <div className="w-12 h-1 bg-gradient-to-r from-blue-400 via-yellow-400 to-red-500 rounded-full"></div>
                      <span className="text-red-500 font-semibold">{weather.today.temp_max}°</span>
                      <span className="text-[11px] opacity-70 ml-1">Low → High</span>
                    </div>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setShowWeatherDetail(false)}
                  className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/70'} transition`}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Hourly Forecast */}
              <div className={`relative z-10 my-4 p-4 rounded-xl border ${borderColor} bg-black/5`}>
                <h3 className="font-semibold mb-2">Hourly Forecast</h3>
                <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-thin scrollbar-thumb-gray-500/30">
                  {weather.hourly.map((hour, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 flex flex-col items-center gap-1 w-20 bg-white/5 p-2 rounded-lg hover:bg-white/10 transition"
                    >
                      <p className={`text-xs ${textSecondary}`}>{hour.time}</p>
                      <p className="text-2xl">{hour.icon}</p>
                      <p className="font-semibold">{hour.temp}°</p>
                      <div className="flex items-center gap-1 text-xs text-blue-400">
                        <Droplet size={12} />
                        <span>{hour.precipitation_probability}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7-Day Forecast */}
              <div className={`relative z-10 my-4 p-4 rounded-xl border ${borderColor} bg-black/5`}>
                <h3 className="font-semibold mb-2">7-Day Forecast</h3>
                <div className="space-y-2">
                  {weather.daily.map((day, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between hover:bg-white/5 rounded-lg p-2 transition"
                    >
                      <p className="font-medium w-1/4">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <div className="flex items-center gap-2 w-1/4 justify-center">
                        <span className="text-xl">{day.icon}</span>
                        <span className="text-xs text-blue-400">{day.precipitation_probability}%</span>
                      </div>
                      <div className="flex items-center justify-end gap-2 w-1/2 text-sm">
                        <span className=" font-medium">{day.temp_min}° /</span>
                        <span className=" font-medium">{day.temp_max}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                {[
                  { label: "Feels Like", value: `${weather.current.feels_like}°C`, icon: "🌡️" },
                  { label: "Humidity", value: `${weather.current.humidity}%`, icon: "💧" },
                  { label: "Wind Speed", value: `${weather.current.wind_speed} km/h`, icon: "🌬️" },
                  {
                    label: "Sunrise / Sunset",
                    value: `${new Date(weather.today.sunrise).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} / ${new Date(weather.today.sunset).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
                    icon: "🌅",
                  },
                ].map((metric, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-2xl border ${borderColor} bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 shadow-inner backdrop-blur-md flex flex-col items-start transition-all hover:shadow-lg hover:scale-[1.02]`}
                  >
                    <p className={`text-xs ${textSecondary}`}>
                      {metric.label}
                    </p>
                    <p className="text-lg font-bold">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4 max-w-7xl mx-auto">
        {/* Account View */}
        {activeView === 'account' && isAuthenticated && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Account</h2>
            
            <div className={`${cardBg} p-6 rounded-2xl border ${borderColor}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {currentUser?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{currentUser?.username || 'User'}</h3>
                  <p className={`text-sm ${textSecondary}`}>{currentUser?.email || 'No email'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-xs ${textSecondary} mb-1`}>Tasks</p>
                  <p className="text-2xl font-bold text-blue-500">{todos.length}</p>
                </div>
                <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-xs ${textSecondary} mb-1`}>Notes</p>
                  <p className="text-2xl font-bold text-green-500">{notes.length}</p>
                </div>
                <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-xs ${textSecondary} mb-1`}>Passwords</p>
                  <p className="text-2xl font-bold text-yellow-500">{passwords.length}</p>
                </div>
                <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-xs ${textSecondary} mb-1`}>Birthdays</p>
                  <p className="text-2xl font-bold text-purple-500">{birthdays.length}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full px-4 py-3 bg-red-500 text-white rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        )}

        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="space-y-4">
            {/* Greeting Card */}
            <div className={`relative overflow-hidden ${cardBg} p-6 rounded-2xl border ${borderColor} shadow-lg`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 rounded-t-2xl"></div>
              
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/10 rounded-full blur-lg"></div>
              <div className="absolute -bottom-8 -left-2 w-32 h-32 bg-purple-500/10 rounded-full blur-xl"></div>
              
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{greetingData?.greeting || 'Welcome!'}</h2>
                  {greetingData?.quote && (
                    <p className={`text-sm ${textSecondary} italic mt-1`}>
                      "{greetingData.quote}"
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Time Card */}
            <div className={`${cardBg} p-6 rounded-2xl border ${borderColor} shadow-lg`}>
              {/* Main Date and Time */}
              <p className={`text-sm ${textSecondary} mb-2`}>{formatDate()}</p>
              <div className="text-4xl font-bold mb-4">{formatTime()}</div>

              {/* Info Tags Section */}
              <div className="flex gap-2 flex-wrap">
                {(() => {
                  // Helper calculations for day and week of year
                  const startOfYear = new Date(currentTime.getFullYear(), 0, 1);
                  const dayOfYear = Math.floor((currentTime - startOfYear) / (24 * 60 * 60 * 1000)) + 1;
                  const weekOfYear = Math.ceil(dayOfYear / 7);
                  const dayOfMonth = currentTime.getDate();
                  const weekOfMonth = Math.ceil(dayOfMonth / 7);
                  const nextNewYear = new Date(currentTime.getFullYear() + 1, 0, 1);
                  const diffMs = nextNewYear.getTime() - currentTime.getTime();
                  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

                  return (
                    <>
                      {/* Week of the Year Tag */}
                      <button
                        onClick={() => setShowWeekOfMonth(!showWeekOfMonth)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                          theme === 'dark' 
                            ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/40' 
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        {showWeekOfMonth
                          ? `Week ${weekOfMonth} (Month)`
                          : `Week ${weekOfYear} (Year)`
                        }
                      </button>

                      {/* Day of the Year Tag */}
                      <button
                        onClick={() => setShowCountdown(!showCountdown)} // Toggle state on click
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                          theme === 'dark' 
                            ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/40' 
                            : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                        }`}
                      >
                        {/* Conditionally show text based on state */}
                        {showCountdown
                          ? (
                              daysRemaining === 1
                                ? "New Year's Eve!"
                                : `${daysRemaining} Days Left`
                            )
                          : `Day ${dayOfYear}`
                        }
                      </button>
                    </>
                  );
                })()}
                
                {/* Special Day Tags (e.g., Diwali) */}
                {getSpecialDaysForDate(currentTime).map((holiday, idx) => (
                  <div key={idx} className={`px-3 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-pink-600/20 text-pink-400' : 'bg-pink-100 text-pink-600'}`}>
                    {holiday.emoji} {holiday.name} 
                  </div>
                ))}
              </div>
            </div>

            {/* "On This Day" Section */}
            {(() => {
              const onThisDayEvent = getOnThisDay()[0];
              if (!onThisDayEvent) return null;

              return (
                <div className={`${cardBg} p-4 rounded-2xl border ${borderColor} shadow-lg`}>
                  <div className="flex items-center gap-3">
                    <DynamicCalendarIcon
                      className="w-6 h-6 text-gray-400 flex-shrink-0"
                      dateObject={currentTime}
                    />
                    <span className="text-sm font-medium text-indigo-500 dark:text-indigo-400 ">
                      On This Day
                    </span>
                  </div>
                  <div className="flex items-start gap-3 mt-2 pt-3.5 border-t border-gray-200 dark:border-gray-700/50">                           
                    <p className={`font-medium text-sm leading-relaxed`}>
                      {onThisDayEvent.event}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Weather Widget */}
            <button
              onClick={() => weather && setShowWeatherDetail(true)}
              className={`relative overflow-hidden ${cardBg} p-5 rounded-3xl border ${borderColor} shadow-xl w-full text-left backdrop-blur-md transition-all hover:scale-[1.03] hover:shadow-2xl group`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold tracking-wide">
                    {weather ? weather.name : city}
                  </h3>
                  <p className={`text-sm ${textSecondary} capitalize flex items-center gap-2`}>
                    {weatherLoading ? 'Loading...' : (
                      <>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {weather?.current.description}
                      </>
                    )}
                  </p>
                </div>
                <div className="text-5xl">
                  {weatherLoading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  ) : (
                    <div className="text-5xl drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                    {weather?.current.icon}
                    </div>
                  )}
                </div>
              </div>
              <div className="relative z-10 flex items-end justify-between mt-2">
                <div>
                  <span className="text-5xl font-semibold">
                    {weatherLoading ? '--' : weather?.current.temp}
                    <span className="text-2xl font-bold opacity-50">°C</span>
                  </span>
                  <p className="flex items-center gap-1 text-sm text-gray-400 mt-0.5">
                    <span className="text-red-400">🌡️</span>
                    Feels like {weatherLoading ? '--' : weather?.current.feels_like}°C
                  </p>
                </div>
                <div className="flex flex-col items-end text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <span className="text-blue-400 font-semibold">
                      {weatherLoading ? '--' : weather?.today.temp_min}°
                    </span>
                    <div className="w-10 h-1 bg-gradient-to-r from-blue-400 via-yellow-400 to-red-500 rounded-full"></div>
                    <span className="text-red-500 font-semibold">
                      {weatherLoading ? '--' : weather?.today.temp_max}°
                    </span>
                  </div>
                  <span className="text-[11px] mt-1 opacity-70">Low → High</span>
                </div>
              </div>
              <div className="relative z-10 mt-4 flex justify-between text-xs text-gray-400 border-t border-white/10 pt-2">
                <span>Humidity: {weatherLoading ? '--' : weather?.current.humidity}%</span>
                <span>Wind: {weatherLoading ? '--' : weather?.current.wind_speed} km/h</span>
              </div>
            </button>
            
            {/* Enhanced Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Tasks', count: stats.total, icon: CheckSquare, color: 'blue', view: 'todos' },
                { label: 'Notes', count: notes.length, icon: StickyNote, color: 'yellow', view: 'notes' },
                { label: 'Passwords', count: passwords.length, icon: Key, color: 'green', view: 'passwords' },
                { label: 'Habits', count: habits.length, icon: Goal, color: 'purple', view: 'habits' },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => setActiveView(item.view)}
                  className={`${cardBg} p-4 rounded-2xl border ${borderColor} text-center shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95`}
                >
                  <item.icon className={`mx-auto mb-2 text-${item.color}-500`} size={24} />
                  <p className="text-2xl font-bold">{item.count}</p>
                  <p className={`text-xs ${textSecondary}`}>{item.label}</p>
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className={`${cardBg} p-4 rounded-2xl border ${borderColor} shadow-lg`}>
              <h3 className="font-bold mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: 'News', icon: Newspaper, view: 'news', color: 'purple' },
                  { label: 'Expenses', icon: HandCoins, view: 'expenses', color: 'yellow' },
                  { label: 'Games', icon: Gamepad2, view: 'games', color: 'pink' },
                  { label: 'Watchlist', icon: Clapperboard, view: 'watchlist', color: 'blue' }
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => setActiveView(item.view)}
                    className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all hover:scale-105`}
                  >
                    <item.icon className={`mx-auto mb-1 text-${item.color}-500`} size={20} />
                    <p className="text-xs font-medium">{item.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className={`${cardBg} p-4 rounded-2xl border ${borderColor} shadow-lg`}>
              <h3 className="font-bold mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {todos.slice(0, 3).map(todo => (
                  <div key={todo.id} className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} flex items-center gap-3`}>
                    <CheckSquare size={16} className="text-blue-500" />
                    <span className="text-sm flex-1 truncate">{todo.text}</span>
                  </div>
                ))}
                {todos.length === 0 && (
                  <p className={`text-sm ${textSecondary} text-center py-4`}>No recent tasks</p>
                )}
              </div>
            </div>

            {/* Upcoming Birthdays */}
            {birthdays.length > 0 && (
              <div className={`${cardBg} p-4 rounded-2xl border ${borderColor} shadow-lg`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold flex items-center gap-2">
                    <Cake size={20} className="text-pink-500" />
                    Upcoming Birthdays
                  </h3>
                  <button onClick={() => setActiveView('birthdays')}>
                    <ChevronRight size={20} className={textSecondary} />
                  </button>
                </div>
                <div className="space-y-2">
                  {getUpcomingBirthdays().slice(0, 3).map(birthday => (
                    <div key={birthday.id} className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-purple-600/20' : 'bg-purple-50'}`}>
                      <p className="font-semibold">{birthday.name}</p>
                      <p className={`text-xs ${textSecondary}`}>
                        {birthday.daysUntil === 0 ? '🎂 Today!' : `In ${birthday.daysUntil} days`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Holidays */}
            <div className={`${cardBg} p-4 rounded-2xl border ${borderColor} shadow-lg`}>
              <h3 className="font-bold mb-3">Upcoming Holidays</h3>
              <div className="space-y-2">
                {getUpcomingHolidays().slice(0, 3).map((holiday, idx) => (
                  <div key={idx} className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-orange-600/20' : 'bg-orange-50'}`}>
                    <p className="font-semibold">{holiday.emoji} {holiday.name}</p>                
                      <p className={`text-xs ${textSecondary}`}>
                        {holiday.daysUntil === 0 ? 'Today!' : 
                        holiday.daysUntil === 1 ? 'Tomorrow' : 
                        `In ${holiday.daysUntil} days`}
                      </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tasks View */}
        {activeView === 'todos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">🎯 Tasks</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setTodoFilter('all')}
                  className={`px-3 py-1 rounded-full text-sm ${todoFilter === 'all' ? 'bg-blue-500 text-white' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setTodoFilter('active')}
                  className={`px-3 py-1 rounded-full text-sm ${todoFilter === 'active' ? 'bg-blue-500 text-white' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
                >
                  Active
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a new task..."
                className={`flex-1 px-4 py-3 rounded-2xl ${cardBg} border ${borderColor}`}
              />
              <button
                onClick={addTodo}
                className="px-6 py-3 bg-blue-500 text-white rounded-2xl"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-2">
              {filteredTodos.map(todo => (
                <div key={todo.id} className={`${cardBg} p-4 rounded-2xl border ${borderColor} flex items-center gap-3`}>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-5 h-5 rounded-full"
                  />
                  <span className={`flex-1 ${todo.completed ? 'line-through opacity-50' : ''}`}>
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-500 p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {todos.length === 0 && (
                <div className={`text-center py-8 ${textSecondary}`}>
                  <CheckSquare size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No tasks yet. Create your first task!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes View */}
        {activeView === 'notes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">📃 Notes</h2>
              <button
                onClick={() => setShowAddNote(!showAddNote)}
                className="p-2 bg-blue-500 text-white rounded-full"
              >
                {showAddNote ? <X size={20} /> : <Plus size={20} />}
              </button>
            </div>

            {showAddNote && (
              <div className={`${cardBg} p-4 rounded-2xl border ${borderColor}`}>
                <input
                  type="text"
                  placeholder="Title"
                  value={currentNote.title}
                  onChange={(e) => setCurrentNote({...currentNote, title: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl ${cardBg} border ${borderColor} mb-3`}
                />
                <textarea
                  placeholder="Content..."
                  value={currentNote.content}
                  onChange={(e) => setCurrentNote({...currentNote, content: e.target.value})}
                  rows="6"
                  className={`w-full px-4 py-3 rounded-xl ${cardBg} border ${borderColor} mb-3`}
                />
                <button
                  onClick={addOrUpdateNote}
                  className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl font-medium"
                >
                  Save Note
                </button>
              </div>
            )}
            {notes.length === 0 && (
                    <div className={`text-center py-8 ${textSecondary}`}>
                      <StickyNote size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No notes yet. Create your first note!</p>
                    </div>
                  )}

            <div className="space-y-3">
              {filteredNotes.map(note => (
                <div key={note.id} className={`${cardBg} p-4 rounded-2xl border ${borderColor}`}>
                  <h4 className="font-bold mb-2">{note.title}</h4>
                  <p className={`text-sm ${textSecondary} mb-3 line-clamp-3`}>{note.content}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editNote(note)}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-xl text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="px-3 py-2 text-red-500 border border-red-500 rounded-xl text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Birthdays View */}
        {activeView === 'birthdays' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">🎂 Birthdays</h2>
              <button
                onClick={() => setShowAddBirthday(!showAddBirthday)}
                className="p-2 bg-purple-500 text-white rounded-full"
              >
                {showAddBirthday ? <X size={20} /> : <Plus size={20} />}
              </button>
            </div>

            {showAddBirthday && (
              <div className={`${cardBg} p-4 rounded-2xl border ${borderColor} space-y-3`}>
                <input
                  type="text"
                  placeholder="Name"
                  value={newBirthday.name}
                  onChange={(e) => setNewBirthday({...newBirthday, name: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl ${cardBg} border ${borderColor}`}
                />
                <input
                  type="date"
                  value={newBirthday.date}
                  onChange={(e) => setNewBirthday({...newBirthday, date: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl ${cardBg} border ${borderColor}`}
                />
                <button
                  onClick={addBirthday}
                  className="w-full px-4 py-3 bg-purple-500 text-white rounded-xl font-medium"
                >
                  Save Birthday
                </button>
              </div>
            )}
            {birthdays.length === 0 && (
              <div className={`text-center py-8 ${textSecondary}`}>
                <Cake size={48} className="mx-auto mb-2 opacity-50" />
                <p>No birthdays yet. Create your first birthday reminder!</p>
              </div>
            )}

            <div className="space-y-3">
              {getUpcomingBirthdays().map(birthday => (
                <div key={birthday.id} className={`${cardBg} p-4 rounded-2xl border ${borderColor}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold">{birthday.name}</h4>
                      <p className={`text-sm ${textSecondary}`}>
                        {birthday.daysUntil === 0 ? '🎂 Today!' : `In ${birthday.daysUntil} days`}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteBirthday(birthday.id)}
                      className="text-red-500 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Password Manager */}
        {activeView === 'passwords' && (
          <div>
            {!masterPasswordSet ? (
              <div className="max-w-md mx-auto mt-8">
                <div className={`${cardBg} p-6 rounded-2xl border ${borderColor}`}>
                  <Key size={48} className="mx-auto mb-4 text-blue-500" />
                  <h2 className="text-xl font-bold mb-4 text-center">Setup Master Password</h2>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Master password (min 6 chars)"
                    className={`w-full px-4 py-3 rounded-xl ${cardBg} border ${borderColor} mb-3`}
                  />
                  
                  <select
                    value={recoveryQuestion}
                    onChange={(e) => setRecoveryQuestion(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl ${cardBg} border ${borderColor} mb-2`}
                  >
                    <option value="">Select recovery question</option>
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
                    placeholder="Answer"
                    className={`w-full px-4 py-3 rounded-xl ${cardBg} border ${borderColor} mb-4`}
                  />

                  <button
                    onClick={setupMasterPassword}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl font-medium"
                  >
                    Create Password
                  </button>
                </div>
              </div>
            ) : !isUnlocked ? (
              <div className="max-w-md mx-auto px-4 py-8">
                <div className={`${cardBg} p-6 rounded-3xl border ${borderColor} shadow-xl`}>
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock size={40} className="text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Unlock Vault</h2>
                    <p className={`text-sm ${textSecondary}`}>Enter your master password</p>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && unlockVault()}
                      placeholder="Master password"
                      className={`w-full px-4 py-3 rounded-xl ${cardBg} border ${borderColor} text-base focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                    />
                    <button
                      onClick={unlockVault}
                      className="w-full px-4 py-3.5 bg-blue-500 text-white rounded-xl font-semibold text-base active:scale-95 transition-transform"
                    >
                      Unlock
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <h2 className="text-2xl font-bold">🔑 Password Manager</h2> 
                  </div> 
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowGenerator(!showGenerator)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg transition-all duration-200 hover:bg-green-600 hover:scale-105 active:scale-95"
                    >
                      Generator
                    </button>
                    <button
                      onClick={() => setShowAddPassword(!showAddPassword)}
                      className="p-2 bg-green-500 text-white rounded-full transition-all duration-200 hover:bg-green-600 active:scale-95"
                    >
                      <Plus size={20} />
                    </button>
                  </div>  
                </div>
                {passwords.length === 0 && (
                    <div className={`text-center py-8 ${textSecondary}`}>
                      <Key size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No passwords yet. Add your first password!</p>
                    </div>
                  )}

                {showGenerator && (
                  <div className={`${cardBg} p-4 rounded-2xl border ${borderColor} shadow-lg`}>
                    <h3 className="text-lg font-bold mb-4">Password Generator</h3>
                    
                    <div className="space-y-4">
                      {/* Length Slider */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium">Length</label>
                          <span className="text-sm font-bold text-blue-500">{passwordLength}</span>
                        </div>
                        <input
                          type="range"
                          min="6"
                          max="32"
                          value={passwordLength}
                          onChange={(e) => setPasswordLength(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'A-Z', checked: includeUppercase, setter: setIncludeUppercase },
                          { label: 'a-z', checked: includeLowercase, setter: setIncludeLowercase },
                          { label: '0-9', checked: includeNumbers, setter: setIncludeNumbers },
                          { label: '!@#', checked: includeSymbols, setter: setIncludeSymbols },
                        ].map((option, idx) => (
                          <label key={idx} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={option.checked}
                              onChange={(e) => option.setter(e.target.checked)}
                              className="w-4 h-4 accent-blue-500"
                            />
                            <span className="text-sm font-medium">{option.label}</span>
                          </label>
                        ))}
                      </div>

                      {/* Generate Button */}
                      <button
                        onClick={generatePassword}
                        className="w-full px-4 py-3 bg-green-500 text-white rounded-xl font-semibold active:scale-95 transition-all"
                      >
                        Generate Password
                      </button>

                      {/* Generated Password Display */}
                      {generatedPassword && (
                        <div className={`flex gap-2 p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <input
                            type="text"
                            value={generatedPassword}
                            readOnly
                            className="flex-1 bg-transparent text-sm focus:outline-none"
                          />
                          <button
                            onClick={() => copyToClipboard(generatedPassword)}
                            className="p-2 bg-blue-500 text-white rounded-lg active:scale-95 transition-all"
                          >
                            <Copy size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {showAddPassword && (
                  <div className={`${cardBg} p-4 rounded-2xl border ${borderColor} space-y-3`}>
                    <input
                      type="text"
                      placeholder="Title"
                      value={newPasswordEntry.title}
                      onChange={(e) => setNewPasswordEntry({...newPasswordEntry, title: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl ${cardBg} border ${borderColor}`}
                    />
                    <input
                      type="text"
                      placeholder="Password"
                      value={newPasswordEntry.password}
                      onChange={(e) => setNewPasswordEntry({...newPasswordEntry, password: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl ${cardBg} border ${borderColor}`}
                    />
                    <button
                      onClick={addPasswordEntry}
                      className="w-full px-4 py-3 bg-green-500 text-white rounded-xl font-medium"
                    >
                      Save
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {filteredPasswords.map(pwd => (
                    <div key={pwd.id} className={`${cardBg} p-4 rounded-2xl border ${borderColor}`}>
                      {/* Delete Confirmation */}
                      {deleteConfirmId === pwd.id && (
                        <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                          <p className="text-sm font-medium text-red-500 mb-3">
                            Delete "{pwd.title}"? This cannot be undone.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium active:scale-95 transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                deletePasswordEntry(pwd.id);
                                setDeleteConfirmId(null);
                              }}
                              className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium active:scale-95 transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-base truncate">{pwd.title}</h4>
                          {pwd.username && (
                            <p className={`text-sm ${textSecondary} truncate`}>{pwd.username}</p>
                          )}
                        </div>
                        <button
                          onClick={() => setDeleteConfirmId(pwd.id)}
                          className="p-2 text-red-500 rounded-lg active:bg-red-500/10 transition-colors ml-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input
                          type={showPasswordId === pwd.id ? 'text' : 'password'}
                          value={pwd.password}
                          readOnly
                          className={`flex-1 px-3 py-2 rounded-xl text-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} w-[65%] sm:w-[70%]`}
                        />
                        <button
                          onClick={() => setShowPasswordId(showPasswordId === pwd.id ? null : pwd.id)}
                          className={`p-2 rounded-xl flex-shrink-0 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
                        >
                          {showPasswordId === pwd.id ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(pwd.password)}
                          className="p-2 bg-blue-500 text-white rounded-xl flex-shrink-0"
                        >
                          <Copy size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Converter View */}
        {activeView === 'converter' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">🔁 Unit Converter</h2>
            
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(unitOptions).map(type => (
                <button
                  key={type}
                  onClick={() => handleConverterTypeChange(type)}
                  className={`px-4 py-3 rounded-xl text-md ${
                    converterType === type 
                      ? 'bg-blue-500 text-white' 
                      : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className={`${cardBg} p-4 rounded-2xl border ${borderColor} space-y-3`}>
              <select
                value={fromUnit}
                onChange={(e) => {
                  setFromUnit(e.target.value);
                  if (inputValue) {
                    const result = convertUnit(inputValue, e.target.value, toUnit, converterType);
                    setOutputValue(result);
                  }
                }}
                className={`w-full px-4 py-3 rounded-xl ${cardBg} border ${borderColor}`}
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
                className={`w-full px-4 py-3 rounded-xl ${cardBg} border ${borderColor} text-xl`}
              />
              
              <select
                value={toUnit}
                onChange={(e) => {
                  setToUnit(e.target.value);
                  if (inputValue) {
                    const result = convertUnit(inputValue, fromUnit, e.target.value, converterType);
                    setOutputValue(result);
                  }
                }}
                className={`w-full px-4 py-3 rounded-xl ${cardBg} border ${borderColor}`}
              >
                {unitOptions[converterType].map(unit => (
                  <option key={unit} value={unit}>
                    {unit.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
              <div className={`w-full px-4 py-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'} text-xl font-bold ${outputValue ? 'text-blue-500' : textSecondary}`}>
                {outputValue || '0'}
              </div>
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
                  

        {/* Habits View */}
        {activeView === 'habits' && (
          <HabitTracker 
            theme={theme} 
            habits={habits}
            setHabits={setHabits}
            showToast={showToast}
          />
        )}

        {/* Expenses View */}
        {activeView === 'expenses' && (
          <ExpenseTracker 
            theme={theme}
            expenses={expenses}
            setExpenses={setExpenses}
            showToast={showToast}
          />
        )}

        {/* Text Counter View */}
        {activeView === 'textcounter' && (
          <TextCounter 
            theme={theme}
            showToast={showToast}
          />
        )}

        {/* Cricket View */}
        {activeView === 'cricket' && (
          <CricketScoreboard 
            theme={theme}
            showToast={showToast}
          />
        )}

        {/* News View */}
        {activeView === 'news' && (
          <NewsFeed 
            theme={theme}
            showToast={showToast}
          />
        )}

        {/* Timezone View */}
        {activeView === 'timezone' && (
          <TimeZoneConverter 
            theme={theme}
            showToast={showToast}
          />
        )}



        {/* Water Intake View */}
        {activeView === 'water' && (
          <WaterIntake 
            theme={theme}
            showToast={showToast}
          />
        )}

        {/* Watchlist View */}
        {activeView === 'watchlist' && <Watchlist theme={theme} showToast={showToast} />}

        {/* Quick Links View */}
        {activeView === 'links' && <QuickLinks theme={theme} links={links} setLinks={setLinks} />}

        {/* Calculator View */}
        {activeView === 'calculator' && <Calculator theme={theme} />}

        {/* AgeCalculator View */}
        {activeView === 'agecalculator' && (
          <AgeCalculator theme={theme} showToast={showToast} />
        )}

        {/* PDF Tools View */}
        {activeView === 'pdftools' && (
          <PdfTools theme={theme} showToast={showToast} />
        )}

        {/* Find & Replace View */}
        {activeView === 'findreplace' && (
          <FindReplace theme={theme} showToast={showToast} />
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
                  if (gameId === 'tic-tac-toe') initTicTacToe();
                  if (gameId === 'word-guess') initWordGuess();
                  if (gameId === 'typing-test') initTypingTest();
                  if (gameId === 'whac-a-mole') initWhacAMole();
                  if (gameId === 'simon-says') initSimonGame();
                  if (gameId === 'connect-four') initConnectFour();
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
                  className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-xl"
                >
                  ← Back
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

                {activeGame === 'tic-tac-toe' && (
                  <TicTacToe
                    board={ticTacToeBoard}
                    winner={ticTacToeWinner}
                    currentPlayer={currentPlayer}
                    onCellClick={handleCellClick}
                    onNewGame={initTicTacToe}
                    theme={theme}
                    cardBg={cardBg}
                    borderColor={borderColor}
                    textSecondary={textSecondary}
                  />
                )}

                {activeGame === 'word-guess' && (
                  <WordGuess
                    guesses={wordGuesses}
                    currentGuess={currentGuess}
                    gameStatus={wordGuessStatus}
                    onNewGame={initWordGuess}
                    cardBg={cardBg}
                    borderColor={borderColor}
                    textSecondary={textSecondary}
                  />
                )}

                {activeGame === 'typing-test' && (
                  <TypingTest
                    textToType={typingText}
                    userInput={userInput}
                    gameStatus={typingStatus}
                    wpm={wpm}
                    accuracy={accuracy}
                    onInputChange={handleTypingInputChange}
                    onNewGame={initTypingTest}
                    cardBg={cardBg}
                    borderColor={borderColor}
                    textSecondary={textSecondary}
                  />
                )}

                {activeGame === 'whac-a-mole' && (
                  <WhacAMole
                    moles={moles}
                    score={whacScore}
                    timeLeft={whacTimeLeft}
                    gameActive={isWhacActive}
                    onMoleWhack={handleMoleWhack}
                    onNewGame={initWhacAMole}
                    cardBg={cardBg}
                    borderColor={borderColor}
                  />
                )}

                {activeGame === 'simon-says' && (
                  <SimonSays
                    sequence={simonSequence}
                    playerTurn={isPlayerTurn}
                    gameStatus={simonStatus}
                    litButton={litButton}
                    onButtonClick={handleSimonClick}
                    onNewGame={initSimonGame}
                    cardBg={cardBg}
                    borderColor={borderColor}
                    textSecondary={textSecondary}
                  />
                )}

                {activeGame === 'connect-four' && (
                  <ConnectFour
                    board={connectFourBoard}
                    winner={connectFourWinner}
                    currentPlayer={cfCurrentPlayer}
                    onColumnClick={handleColumnClick}
                    onNewGame={initConnectFour}
                    cardBg={cardBg}
                    borderColor={borderColor}
                  />
                )}

                {activeGame === 'chess' && (
                  <Chess
                    theme={theme}
                    cardBg={cardBg}
                    borderColor={borderColor}
                    textSecondary={textSecondary}
                    showToast={showToast}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Settings View */}
        {activeView === 'settings' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Settings</h2>
            
            <div className={`${cardBg} p-4 rounded-2xl border ${borderColor}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Theme</p>
                  <p className={`text-sm ${textSecondary}`}>Switch appearance</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl"
                >
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
              </div>
            </div>

            <div className={`${cardBg} p-4 rounded-2xl border ${borderColor}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-lock Vault</p>
                  <p className={`text-sm ${textSecondary}`}>After inactivity</p>
                </div>
                <select
                  value={autoLockTimeout}
                  onChange={(e) => {
                    setAutoLockTimeout(parseInt(e.target.value));
                    localStorage.setItem('autoLockTimeout', e.target.value);
                    showToast('Updated');
                  }}
                  className={`px-4 py-2 rounded-xl ${cardBg} border ${borderColor}`}
                >
                  <option value="1">1 min</option>
                  <option value="5">5 min</option>
                  <option value="10">10 min</option>
                </select>
              </div>
            </div>

            <button 
              onClick={clearAllData}
              className="w-full px-4 py-3 bg-red-500 text-white rounded-xl font-medium"
            >
              Clear All Data
            </button>
          </div>
        )}

        {/* More Menu - Scrollable */}
        {activeView === 'more' && (
          <div className="space-y-4 pb-6">
            <h2 className="text-2xl font-bold">More Apps</h2>
            
            <div className="grid grid-cols-3 gap-3 max-h-[calc(100vh-200px)] overflow-y-auto pb-4">
              {[
                { id: 'todos', label: 'Tasks', icon: CheckSquare },
                { id: 'notes', label: 'Notes', icon: StickyNote },
                { id: 'news', label: 'News', icon: Newspaper },
                { id: 'passwords', label: 'Passwords', icon: Key },
                { id: 'habits', label: 'Habits', icon: Goal },
                { id: 'expenses', label: 'Expenses', icon: HandCoins },
                { id: 'watchlist', label: 'Watchlist', icon: Clapperboard },
                { id: 'birthdays', label: 'Birthdays', icon: Cake },
                { id: 'games', label: 'Games', icon: Gamepad2 },
                { id: 'links', label: 'Links', icon: Link2 },
                { id: 'timers', label: 'Timers', icon: Clock },
                { id: 'water', label: 'Water', icon: Droplet },
                { id: 'calculator', label: 'Calculator', icon: CalculatorIcon },
                { id: 'agecalculator', label: 'Age Calc', icon: CalendarSearch },
                { id: 'converter', label: 'Converter', icon: Gauge },
                { id: 'textcounter', label: 'Text', icon: ScanText },
                { id: 'timezone', label: 'Timezone', icon: CalendarClock },
                { id: 'pdftools', label: 'PDF', icon: FileText },
                { id: 'findreplace', label: 'Find & Replace', icon: TextSearch },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map(item => {
                const Icon = typeof item.icon === 'string' ? null : item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`${cardBg} p-4 rounded-2xl border ${borderColor} text-center shadow-md hover:shadow-lg transition-all hover:scale-105`}
                  >
                    {Icon ? <Icon className="mx-auto mb-2" size={24} /> : <span className="text-2xl mb-2 block">{item.icon}</span>}
                    <p className="text-xs font-medium">{item.label}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button (FAB) with Menu */}
      {!showFABMenu && ['dashboard', 'todos', 'notes'].includes(activeView) && (
        <button
          onClick={() => setShowFABMenu(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center z-30"
        >
          <Plus size={24} />
        </button>
      )}

      {/* FAB Menu */}
      {showFABMenu && (
        <>
          <div 
            className="fixed inset-0 z-30"
            onClick={() => setShowFABMenu(false)}
            style={{
              backdropFilter: 'blur(1px)',
              WebkitBackdropFilter: 'blur(1px)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
          />
          <div className="fixed bottom-24 right-6 z-40 space-y-3">
            {fabActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.action}
                  className={`flex items-center gap-3 ${cardBg} px-4 py-3 rounded-full shadow-2xl border ${borderColor} animate-pop-up hover:scale-105 transition-all`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <Icon size={20} className="text-blue-500" />
                  <span className="font-medium">{action.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => setShowFABMenu(false)}
              className="w-14 h-14 bg-red-500 text-white rounded-full shadow-2xl flex items-center justify-center ml-auto hover:bg-red-600 transition-all hover:scale-110"
            >
              <X size={24} />
            </button>
          </div>
        </>
      )}
      </div>{/* End main-content */}
    </div>
  );
};

export default DailyHub;
