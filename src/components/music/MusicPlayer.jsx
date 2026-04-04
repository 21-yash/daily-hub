import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Repeat, Shuffle, Heart, Users, Plus, Copy,
  LogOut, Music, ListMusic, Radio, Send, X,
  ChevronUp, Crown, Disc3, Headphones, Mic2, Search, Loader2, TrendingUp
} from 'lucide-react';
import { io } from 'socket.io-client';
import './MusicPlayer.css';

const BACKEND_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = BACKEND_URL?.replace('/api', '') || 'http://localhost:3001';

// Build a proxied stream URL from a song's encryptedMediaUrl (preferred) or mediaPreviewUrl (fallback)
const getStreamUrl = (song) => {
  if (!song) return null;
  if (song.encryptedMediaUrl) {
    return `${BACKEND_URL}/music/stream?encrypted=${encodeURIComponent(song.encryptedMediaUrl)}`;
  }
  if (song.mediaPreviewUrl) {
    return `${BACKEND_URL}/music/stream?url=${encodeURIComponent(song.mediaPreviewUrl)}`;
  }
  return null;
};

const AVATAR_COLORS = [
  'from-violet-500 to-fuchsia-500',
  'from-cyan-500 to-blue-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-indigo-500 to-purple-500',
];

const generateUsername = () => {
  const adj = ['Cosmic', 'Neon', 'Chill', 'Funky', 'Dreamy', 'Sonic', 'Vibe', 'Groovy', 'Electric', 'Stellar'];
  const noun = ['Fox', 'Wave', 'Beat', 'Star', 'Moon', 'Echo', 'Pulse', 'Flow', 'Drift', 'Nova'];
  return `${adj[Math.floor(Math.random() * adj.length)]}${noun[Math.floor(Math.random() * noun.length)]}${Math.floor(Math.random() * 99)}`;
};

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Default accent color when no song is playing
const DEFAULT_COLOR = '#8b5cf6';

// Generate a hex color from a string (hex so we can append alpha like 'cc', '80')
function stringToColor(str) {
  if (!str) return DEFAULT_COLOR;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  // Convert HSL(h, 70%, 45%) to hex — slightly darker to ensure white icons contrast
  const s = 0.7, l = 0.45;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const MusicPlayer = ({ theme, showToast }) => {
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const hoverBg = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
  const subtleBg = theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100';
  const inputBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100';

  // ─── Player State ───
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');
  const [likedSongs, setLikedSongs] = useState(new Set());
  const [queue, setQueue] = useState([]);
  const [showQueue, setShowQueue] = useState(false);
  const [playHistory, setPlayHistory] = useState([]); // for prev button

  // ─── Search State ───
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // ─── Jam State ───
  const [socket, setSocket] = useState(null);
  const [jamMode, setJamMode] = useState(false);
  const [jamRoom, setJamRoom] = useState(null);
  const [jamUsers, setJamUsers] = useState([]);
  const [jamChat, setJamChat] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [showJamPanel, setShowJamPanel] = useState(false);
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [userName, setUserName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [showCreateJam, setShowCreateJam] = useState(false);
  const [showJoinJam, setShowJoinJam] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // ─── Refs ───
  const audioRef = useRef(null);
  const chatEndRef = useRef(null);
  const progressRef = useRef(null);
  const ignoreSocketPlayback = useRef(false); // prevents feedback loops

  const songColor = currentSong ? stringToColor(currentSong.id || currentSong.title) : DEFAULT_COLOR;

  // ─── Load Trending on Mount ───
  useEffect(() => {
    fetchTrending();
    // Load liked songs from localStorage
    const saved = localStorage.getItem('music_liked_songs');
    if (saved) {
      try { setLikedSongs(new Set(JSON.parse(saved))); } catch {}
    }
  }, []);

  // Persist liked songs
  useEffect(() => {
    if (likedSongs.size > 0) {
      localStorage.setItem('music_liked_songs', JSON.stringify([...likedSongs]));
    }
  }, [likedSongs]);

  // ─── Audio Event Handlers ───
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else if (queue.length > 0) {
        playFromQueue();
      } else if (repeatMode === 'all' && playHistory.length > 0) {
        // replay from beginning of history
        const first = playHistory[0];
        if (first) playSongDirect(first);
      } else {
        setIsPlaying(false);
      }
    };
    const onError = (e) => {
      console.error('Audio error:', e);
      // Try next song if current fails
      if (queue.length > 0) {
        setTimeout(() => playFromQueue(), 500);
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onDurationChange);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onDurationChange);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [repeatMode, queue, playHistory]);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Chat auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [jamChat]);

  // ─── Search with Debounce ───
  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const tid = setTimeout(() => searchSongs(searchQuery), 400);
    setSearchTimeout(tid);
    return () => clearTimeout(tid);
  }, [searchQuery]);

  // ─── Socket.IO Setup & Listeners ───
  useEffect(() => {
    if (!jamMode || !socket) return;

    // Song changed by another user
    const handleSongChanged = ({ song, isPlaying: playing, currentTime: time, chatMessage: sysMsg }) => {
      ignoreSocketPlayback.current = true;
      setCurrentSong(song);
      setIsPlaying(playing);
      loadAndPlaySong(song, time, playing);
      if (sysMsg) setJamChat(prev => [...prev, sysMsg]);
      setTimeout(() => { ignoreSocketPlayback.current = false; }, 500);
    };

    // Playback toggled by another user
    const handlePlaybackToggled = ({ isPlaying: playing, currentTime: time, chatMessage: sysMsg }) => {
      ignoreSocketPlayback.current = true;
      const audio = audioRef.current;
      if (audio) {
        if (playing) {
          audio.currentTime = time;
          audio.play().catch(() => {});
        } else {
          audio.pause();
        }
      }
      setIsPlaying(playing);
      setCurrentTime(time);
      if (sysMsg) setJamChat(prev => [...prev, sysMsg]);
      setTimeout(() => { ignoreSocketPlayback.current = false; }, 500);
    };

    // Seek by another user
    const handleSeeked = ({ currentTime: time }) => {
      ignoreSocketPlayback.current = true;
      if (audioRef.current) audioRef.current.currentTime = time;
      setCurrentTime(time);
      setTimeout(() => { ignoreSocketPlayback.current = false; }, 300);
    };

    // User joined
    const handleUserJoined = ({ user, users, message }) => {
      setJamUsers(users);
      setJamChat(prev => [...prev, {
        id: Date.now(), user: 'system', message: `🎉 ${message}`,
        time: Date.now(), isSystem: true
      }]);
    };

    // User left
    const handleUserLeft = ({ userName: name, users, chatMessage: sysMsg }) => {
      setJamUsers(users);
      if (sysMsg) setJamChat(prev => [...prev, sysMsg]);
    };

    // Chat message
    const handleChat = (msg) => {
      setJamChat(prev => [...prev, msg]);
    };

    // Queue updated
    const handleQueueUpdated = ({ song, addedBy, chatMessage: sysMsg }) => {
      setQueue(prev => [...prev, song]);
      if (sysMsg) setJamChat(prev => [...prev, sysMsg]);
    };

    socket.on('song-changed', handleSongChanged);
    socket.on('playback-toggled', handlePlaybackToggled);
    socket.on('seeked', handleSeeked);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('chat-message', handleChat);
    socket.on('queue-updated', handleQueueUpdated);

    return () => {
      socket.off('song-changed', handleSongChanged);
      socket.off('playback-toggled', handlePlaybackToggled);
      socket.off('seeked', handleSeeked);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('chat-message', handleChat);
      socket.off('queue-updated', handleQueueUpdated);
    };
  }, [jamMode, socket]);

  // ─── API Calls ───
  const fetchTrending = async () => {
    setIsTrendingLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/music/trending`);
      const data = await res.json();
      if (data.success && data.songs?.length > 0) {
        setTrendingSongs(data.songs);
      }
    } catch (e) {
      console.error('Trending fetch error:', e);
    } finally {
      setIsTrendingLoading(false);
    }
  };

  const searchSongs = async (query) => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`${BACKEND_URL}/music/search?query=${encodeURIComponent(query)}&limit=20`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results || []);
      }
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  // ─── Playback Helpers ───
  const loadAndPlaySong = (song, startTime = 0, shouldPlay = true) => {
    const audio = audioRef.current;
    const streamUrl = getStreamUrl(song);
    if (!audio || !streamUrl) return;
    audio.src = streamUrl;
    audio.volume = isMuted ? 0 : volume;
    audio.currentTime = startTime;
    if (shouldPlay) {
      audio.play().catch(() => {});
    }
  };

  const playSongDirect = (song) => {
    if (!song?.encryptedMediaUrl && !song?.mediaPreviewUrl) {
      showToast('This song cannot be played', 'error');
      return;
    }
    // Save current to history
    if (currentSong) {
      setPlayHistory(prev => [...prev.slice(-50), currentSong]);
    }
    setCurrentSong(song);
    setIsPlaying(true);
    setCurrentTime(0);
    loadAndPlaySong(song, 0, true);

    // Broadcast to jam room
    if (jamMode && socket && !ignoreSocketPlayback.current) {
      socket.emit('play-song', { song });
    }
  };

  const playFromQueue = () => {
    if (queue.length === 0) return;
    const next = queue[0];
    setQueue(prev => prev.slice(1));
    playSongDirect(next);
  };

  // ─── Player Controls ───
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const newPlaying = !isPlaying;
    if (newPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
    setIsPlaying(newPlaying);

    if (jamMode && socket && !ignoreSocketPlayback.current) {
      socket.emit('toggle-playback', { isPlaying: newPlaying });
    }
  }, [isPlaying, currentSong, jamMode, socket]);

  const handleNext = useCallback(() => {
    if (queue.length > 0) {
      playFromQueue();
      return;
    }
    // Play from search results or trending
    const list = searchResults.length > 0 ? searchResults : trendingSongs;
    if (list.length === 0) return;

    const currentIdx = currentSong ? list.findIndex(s => s.id === currentSong.id) : -1;
    let nextIdx;
    if (isShuffled) {
      do { nextIdx = Math.floor(Math.random() * list.length); }
      while (nextIdx === currentIdx && list.length > 1);
    } else {
      nextIdx = currentIdx >= 0 ? (currentIdx + 1) % list.length : 0;
    }

    const nextSong = list[nextIdx];
    if (nextSong) {
      playSongDirect(nextSong);
      if (jamMode && socket && !ignoreSocketPlayback.current) {
        socket.emit('next-song', { song: nextSong });
      }
    }
  }, [queue, searchResults, trendingSongs, currentSong, isShuffled, jamMode, socket]);

  const handlePrev = useCallback(() => {
    const audio = audioRef.current;
    // If past 3 seconds, restart current song
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    // Otherwise go back in history
    if (playHistory.length > 0) {
      const prev = playHistory[playHistory.length - 1];
      setPlayHistory(h => h.slice(0, -1));
      if (currentSong) {
        setQueue(q => [currentSong, ...q]);
      }
      setCurrentSong(prev);
      setIsPlaying(true);
      loadAndPlaySong(prev, 0, true);
    }
  }, [playHistory, currentSong]);

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = pct * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);

    if (jamMode && socket && !ignoreSocketPlayback.current) {
      socket.emit('seek', { currentTime: newTime });
    }
  };

  const toggleLike = (songId) => {
    setLikedSongs(prev => {
      const next = new Set(prev);
      if (next.has(songId)) { next.delete(songId); }
      else { next.add(songId); showToast('Added to favorites ❤️', 'info'); }
      return next;
    });
  };

  const toggleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const next = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
    setRepeatMode(next);
    showToast(`Repeat: ${next === 'off' ? 'Off' : next === 'all' ? 'All' : 'One'}`, 'info');
  };

  const addToQueue = (song) => {
    setQueue(prev => [...prev, song]);
    showToast(`"${song.title}" added to queue`, 'info');
    if (jamMode && socket) {
      socket.emit('add-to-queue', { song });
    }
    // If nothing playing, start playing
    if (!currentSong) {
      playSongDirect(song);
    }
  };

  // ─── Jam Session Functions ───
  const connectSocket = () => {
    return new Promise((resolve) => {
      const s = io(`${SOCKET_URL}/jam`, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        timeout: 10000,
      });
      s.on('connect', () => {
        console.log('🎵 Connected to jam server');
        setSocket(s);
        resolve(s);
      });
      s.on('connect_error', (err) => {
        console.error('Jam connection error:', err.message);
        showToast('Failed to connect to jam server', 'error');
        resolve(null);
      });
      s.on('disconnect', (reason) => {
        console.log('Jam disconnected:', reason);
        if (reason === 'io server disconnect') {
          setJamMode(false);
          setJamRoom(null);
          showToast('Disconnected from jam', 'error');
        }
      });
    });
  };

  const createJamRoom = async () => {
    setIsConnecting(true);
    const name = userName || generateUsername();
    setUserName(name);

    let s = socket;
    if (!s?.connected) {
      s = await connectSocket();
    }
    if (!s) {
      setIsConnecting(false);
      return;
    }

    s.emit('create-room', { userName: name }, (response) => {
      if (response.success) {
        setJamRoom(response.room);
        setJamUsers(response.room.users);
        setIsHost(response.isHost);
        setJamMode(true);
        setJamChat([]);
        setShowCreateJam(false);
        setShowJamPanel(true);
        showToast(`Jam room created: ${response.room.code}`, 'info');
      } else {
        showToast('Failed to create room', 'error');
      }
      setIsConnecting(false);
    });
  };

  const joinJamRoom = async () => {
    if (!joinRoomCode.trim()) {
      showToast('Enter a room code', 'error');
      return;
    }
    setIsConnecting(true);
    const name = userName || generateUsername();
    setUserName(name);

    let s = socket;
    if (!s?.connected) {
      s = await connectSocket();
    }
    if (!s) {
      setIsConnecting(false);
      return;
    }

    s.emit('join-room', { roomCode: joinRoomCode, userName: name }, (response) => {
      if (response.success) {
        setUserName(response.userName);
        setJamRoom(response.room);
        setJamUsers(response.room.users);
        setIsHost(response.isHost);
        setJamMode(true);
        setJamChat(response.room.chat || []);
        setShowJoinJam(false);
        setShowJamPanel(true);
        showToast(`Joined room: ${response.room.code}`, 'info');

        // Sync playback state
        if (response.room.currentSong) {
          setCurrentSong(response.room.currentSong);
          loadAndPlaySong(response.room.currentSong, response.room.currentTime || 0, response.room.isPlaying);
          setIsPlaying(response.room.isPlaying);
        }
      } else {
        showToast(response.error || 'Failed to join room', 'error');
      }
      setIsConnecting(false);
    });
  };

  const leaveJamRoom = () => {
    if (socket) {
      socket.emit('leave-room');
      socket.disconnect();
    }
    setJamMode(false);
    setJamRoom(null);
    setJamUsers([]);
    setJamChat([]);
    setIsHost(false);
    setShowJamPanel(false);
    setSocket(null);
    showToast('Left the jam session', 'info');
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim() || !socket) return;
    socket.emit('chat-message', { message: chatMessage });
    setChatMessage('');
  };

  const copyRoomCode = () => {
    if (jamRoom?.code) {
      navigator.clipboard.writeText(jamRoom.code).then(() => {
        showToast('Room code copied!', 'info');
      }).catch(() => {
        showToast(`Room code: ${jamRoom.code}`, 'info');
      });
    }
  };

  // ─── Display list ───
  const displaySongs = searchQuery.trim()
    ? searchResults
    : trendingSongs;

  const listTitle = searchQuery.trim()
    ? `Search Results (${searchResults.length})`
    : 'Trending';

  // ─── Album Art Component ───
  const AlbumArt = ({ song, size = 'lg', spinning = false }) => {
    const sizes = { sm: 'w-10 h-10', md: 'w-14 h-14', lg: 'w-48 h-48 sm:w-56 sm:h-56' };
    const hasImage = song?.image && !song.image.includes('default');

    if (hasImage) {
      return (
        <div className={`${sizes[size]} rounded-full relative overflow-hidden flex-shrink-0 ${spinning && isPlaying ? 'album-spinning' : spinning ? 'album-spinning album-paused' : ''}`}>
          <img
            src={song.image}
            alt={song.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          {/* Vinyl center hole overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`${size === 'lg' ? 'w-14 h-14' : 'w-3 h-3'} rounded-full bg-gray-900/80 flex items-center justify-center`}>
              {size === 'lg' && <div className="w-3 h-3 rounded-full bg-gray-700" />}
            </div>
          </div>
          <div className="absolute inset-0 vinyl-grooves rounded-full opacity-30" />
        </div>
      );
    }

    // Fallback: gradient vinyl
    const hue1 = song ? (song.title?.charCodeAt(0) || 0) * 7 % 360 : 260;
    const hue2 = (hue1 + 60) % 360;

    return (
      <div
        className={`${sizes[size]} rounded-full relative overflow-hidden flex-shrink-0 ${spinning && isPlaying ? 'album-spinning' : spinning ? 'album-spinning album-paused' : ''}`}
        style={{ background: `conic-gradient(from ${hue1}deg, hsl(${hue1}, 80%, 50%), hsl(${hue2}, 70%, 40%), hsl(${hue1}, 90%, 30%), hsl(${hue2}, 80%, 50%), hsl(${hue1}, 80%, 50%))` }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${size === 'lg' ? 'w-14 h-14' : 'w-3 h-3'} rounded-full bg-gray-900 flex items-center justify-center shadow-inner`}>
            {size === 'lg' && <div className="w-3 h-3 rounded-full bg-gray-700" />}
          </div>
        </div>
        <div className="absolute inset-0 vinyl-grooves rounded-full" />
        {size === 'lg' && (
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Music size={60} className="text-white" />
          </div>
        )}
      </div>
    );
  };

  // ─── Visualizer ───
  const Visualizer = ({ compact = false }) => (
    <div className={`flex items-end gap-[2px] ${compact ? 'h-4' : 'h-8'} ${!isPlaying ? 'visualizer-paused' : ''}`}>
      {Array.from({ length: compact ? 4 : 8 }).map((_, i) => (
        <div key={i} className="visualizer-bar" style={{ background: `linear-gradient(to top, ${songColor}, ${songColor}80)` }} />
      ))}
    </div>
  );

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════
  return (
    <div className="pb-20 max-w-4xl mx-auto">
      <audio ref={audioRef} preload="metadata" />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Music</span>
            </h2>
            <p className={`text-xs sm:text-sm ${textSecondary} mt-1`}>
              {jamMode ? `🎧 Jamming with ${jamUsers.length} ${jamUsers.length === 1 ? 'person' : 'people'}` : 'Search & play any song'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {jamMode && (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30">
                <Radio size={14} className="text-violet-500 animate-pulse" />
                <span className="text-xs font-medium text-violet-500">LIVE</span>
              </div>
            )}
            <Visualizer compact />
          </div>
        </div>
      </div>

      {/* ═══════════ MAIN PLAYER ═══════════ */}
      {currentSong && (
        <div className={`${cardBg} rounded-3xl border ${borderColor} overflow-hidden mb-6 shadow-lg relative`}>
          <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(ellipse at 30% 20%, ${songColor}, transparent 70%)` }} />
          <div className="relative p-6 sm:p-8">
            {/* Album Art + Info */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-6">
                <AlbumArt song={currentSong} size="lg" spinning />
                {isPlaying && <div className="absolute -inset-2 rounded-full opacity-20 blur-xl" style={{ background: songColor }} />}
              </div>
              <div className="text-center w-full max-w-xs">
                <h3 className="font-bold text-xl sm:text-2xl truncate">{currentSong.title}</h3>
                <p className={`${textSecondary} text-sm mt-1 truncate`}>{currentSong.artist}</p>
                {currentSong.album && <p className={`${textSecondary} text-xs mt-0.5 opacity-60 truncate`}>{currentSong.album}</p>}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div ref={progressRef} className="relative h-1.5 rounded-full cursor-pointer group" style={{ background: theme === 'dark' ? '#374151' : '#e5e7eb' }} onClick={handleSeek}>
                <div className="absolute left-0 top-0 h-full rounded-full progress-bar-fill" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%`, background: `linear-gradient(90deg, ${songColor}, ${songColor}cc)` }} />
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%`, transform: 'translate(-50%, -50%)', background: songColor, boxShadow: `0 0 8px ${songColor}80` }} />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className={`text-xs ${textSecondary}`}>{formatTime(currentTime)}</span>
                <span className={`text-xs ${textSecondary}`}>{formatTime(duration || currentSong.duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4">
              <button onClick={() => setIsShuffled(!isShuffled)} className={`p-2 rounded-full transition-all ${isShuffled ? 'text-violet-500' : textSecondary} ${hoverBg}`}><Shuffle size={18} /></button>
              <button onClick={handlePrev} className={`p-2 rounded-full transition-all ${hoverBg} active:scale-90`}><SkipBack size={22} fill="currentColor" /></button>
              <button onClick={togglePlay} className="relative w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg" style={{ background: `linear-gradient(135deg, ${songColor}, ${songColor}cc)` }}>
                {isPlaying ? <Pause size={28} className="text-white" fill="white" /> : <Play size={28} className="text-white ml-1" fill="white" />}
                {isPlaying && <div className="absolute inset-0 rounded-full play-btn-ripple" />}
              </button>
              <button onClick={handleNext} className={`p-2 rounded-full transition-all ${hoverBg} active:scale-90`}><SkipForward size={22} fill="currentColor" /></button>
              <button onClick={toggleRepeat} className={`p-2 rounded-full transition-all relative ${repeatMode !== 'off' ? 'text-violet-500' : textSecondary} ${hoverBg}`}>
                <Repeat size={18} />
                {repeatMode === 'one' && <span className="absolute -top-0.5 -right-0.5 text-[9px] font-bold text-violet-500 bg-violet-500/20 rounded-full w-3.5 h-3.5 flex items-center justify-center">1</span>}
              </button>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => toggleLike(currentSong.id)} className={`p-2 rounded-full transition-all ${hoverBg} active:scale-90`}>
                  <Heart size={18} className={likedSongs.has(currentSong.id) ? 'text-red-500' : textSecondary} fill={likedSongs.has(currentSong.id) ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => setShowQueue(!showQueue)} className={`p-2 rounded-full transition-all ${showQueue ? 'text-violet-500' : textSecondary} ${hoverBg}`}>
                  <ListMusic size={18} />
                  {queue.length > 0 && <span className="absolute -top-0.5 -right-0.5 text-[8px] bg-violet-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center">{queue.length}</span>}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMuted(!isMuted)} className={`p-1.5 rounded-full transition-all ${hoverBg}`}>
                  {isMuted || volume === 0 ? <VolumeX size={16} className={textSecondary} /> : <Volume2 size={16} className={textSecondary} />}
                </button>
                <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume}
                  onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
                  className="volume-slider" style={{ background: `linear-gradient(to right, ${songColor} ${(isMuted ? 0 : volume) * 100}%, ${theme === 'dark' ? '#374151' : '#d1d5db'} ${(isMuted ? 0 : volume) * 100}%)` }} />
              </div>
              <button onClick={() => { if (jamMode) setShowJamPanel(!showJamPanel); else setShowCreateJam(true); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-sm font-medium ${jamMode ? 'bg-violet-500 text-white jam-active shadow-lg shadow-violet-500/30' : `${subtleBg} ${hoverBg}`}`}>
                <Headphones size={16} />
                <span className="hidden sm:inline">Jam</span>
                {jamMode && jamUsers.length > 1 && <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{jamUsers.length}</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No song playing placeholder */}
      {!currentSong && (
        <div className={`${cardBg} rounded-3xl border ${borderColor} p-8 mb-6 text-center shadow-lg`}>
          <Disc3 size={64} className={`mx-auto mb-4 ${textSecondary} opacity-30`} />
          <h3 className="font-bold text-lg mb-1">No song playing</h3>
          <p className={`text-sm ${textSecondary}`}>Search for a song below or browse trending tracks</p>
        </div>
      )}

      {/* ═══════════ JAM PANEL ═══════════ */}
      {jamMode && showJamPanel && (
        <div className={`${cardBg} rounded-3xl border ${borderColor} overflow-hidden mb-6 shadow-lg`}>
          <div className="p-4 border-b border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <Radio size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{jamRoom?.name || 'Jam Session'}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${textSecondary}`}>Code:</span>
                    <button onClick={copyRoomCode} className="flex items-center gap-1 text-xs font-mono font-bold text-violet-500 hover:text-violet-400 transition-colors">
                      {jamRoom?.code}<Copy size={10} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowJamPanel(false)} className={`p-2 rounded-full ${hoverBg}`}><ChevronUp size={18} className={textSecondary} /></button>
                <button onClick={leaveJamRoom} className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-all"><LogOut size={18} /></button>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="p-4 border-b border-violet-500/10">
            <p className={`text-xs font-semibold ${textSecondary} mb-3 uppercase tracking-wider`}>Listeners ({jamUsers.length})</p>
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {jamUsers.map((user) => (
                <div key={user.id} className="flex flex-col items-center gap-1 jam-avatar flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${user.color} flex items-center justify-center text-white text-xs font-bold relative`}>
                    {user.name.charAt(0).toUpperCase()}
                    {user.isHost && <Crown size={10} className="absolute -top-1 -right-1 text-amber-400" />}
                  </div>
                  <span className={`text-[10px] ${textSecondary} max-w-[60px] truncate`}>{user.name}</span>
                </div>
              ))}
              <button onClick={copyRoomCode} className={`w-10 h-10 rounded-full border-2 border-dashed ${borderColor} flex items-center justify-center flex-shrink-0 ${hoverBg} transition-all`}>
                <Plus size={16} className={textSecondary} />
              </button>
            </div>
          </div>

          {/* Chat */}
          <div className="p-4">
            <p className={`text-xs font-semibold ${textSecondary} mb-3 uppercase tracking-wider`}>Chat</p>
            <div className="h-48 overflow-y-auto mb-3 space-y-2 song-list-scroll">
              {jamChat.length === 0 ? (
                <div className={`text-center py-8 ${textSecondary}`}>
                  <Mic2 size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No messages yet. Say hi! 👋</p>
                </div>
              ) : (
                jamChat.map((msg, idx) => (
                  <div key={msg.id || idx} className={`flex gap-2 ${msg.isSystem ? 'justify-center' : ''}`}>
                    {msg.isSystem ? (
                      <p className={`text-xs ${textSecondary} italic`}>{msg.message}</p>
                    ) : (
                      <>
                        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${msg.color || 'from-gray-400 to-gray-500'} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                          {msg.user.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-semibold">{msg.user}</span>
                            <span className={`text-[10px] ${textSecondary}`}>{new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-sm break-words">{msg.message}</p>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2">
              <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()} placeholder="Type a message..."
                className={`flex-1 px-4 py-2.5 rounded-xl ${inputBg} border ${borderColor} text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all`} />
              <button onClick={sendChatMessage} disabled={!chatMessage.trim()}
                className="p-2.5 rounded-xl bg-violet-500 text-white disabled:opacity-40 transition-all active:scale-90 hover:bg-violet-600">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ QUEUE ═══════════ */}
      {showQueue && queue.length > 0 && (
        <div className={`${cardBg} rounded-2xl border ${borderColor} overflow-hidden mb-6 shadow-md`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-sm flex items-center gap-2"><ListMusic size={16} className="text-violet-500" /> Queue ({queue.length})</h3>
            <button onClick={() => setQueue([])} className={`text-xs ${textSecondary} ${hoverBg} px-2 py-1 rounded-lg`}>Clear</button>
          </div>
          <div className="p-2 max-h-48 overflow-y-auto song-list-scroll">
            {queue.map((song, i) => (
              <div key={`q-${song.id}-${i}`} className={`flex items-center gap-3 p-2 rounded-xl ${hoverBg} cursor-pointer transition-all`}
                onClick={() => { setQueue(prev => prev.filter((_, idx) => idx !== i)); playSongDirect(song); }}>
                <span className={`text-xs font-mono ${textSecondary} w-5`}>{i + 1}</span>
                <AlbumArt song={song} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{song.title}</p>
                  <p className={`text-xs ${textSecondary} truncate`}>{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ SEARCH ═══════════ */}
      <div className="mb-4">
        <div className="relative">
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any song, artist, album..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl ${inputBg} border ${borderColor} text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all`} />
          {isSearching && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-violet-500" />}
        </div>
      </div>

      {/* ═══════════ SONG LIST ═══════════ */}
      <div className={`${cardBg} rounded-2xl border ${borderColor} overflow-hidden shadow-md`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-sm flex items-center gap-2">
            {searchQuery.trim()
              ? <><Disc3 size={16} className="text-violet-500" /> {listTitle}</>
              : <><TrendingUp size={16} className="text-violet-500" /> {listTitle} {isTrendingLoading && <Loader2 size={14} className="animate-spin text-violet-500" />}</>
            }
          </h3>
        </div>
        <div className="max-h-[400px] overflow-y-auto song-list-scroll">
          {(isSearching || isTrendingLoading) && displaySongs.length === 0 ? (
            <div className={`p-10 text-center ${textSecondary}`}>
              <Loader2 size={32} className="mx-auto mb-3 animate-spin text-violet-500" />
              <p className="text-sm">{isSearching ? 'Searching...' : 'Loading trending...'}</p>
            </div>
          ) : displaySongs.length === 0 ? (
            <div className={`p-10 text-center ${textSecondary}`}>
              <Music size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{searchQuery ? 'No songs found — try a different query' : 'No trending songs available'}</p>
            </div>
          ) : (
            displaySongs.map((song, idx) => {
              const isCurrent = currentSong && currentSong.id === song.id;
              return (
                <div key={`${song.id}-${idx}`}
                  className={`song-card flex items-center gap-3 p-3 mx-2 my-1 rounded-xl cursor-pointer transition-all ${isCurrent ? `active-song ${subtleBg}` : hoverBg}`}
                  onClick={() => playSongDirect(song)}>
                  <div className="w-7 text-center flex-shrink-0">
                    {isCurrent && isPlaying ? <Visualizer compact /> : <span className={`text-xs font-mono ${textSecondary}`}>{idx + 1}</span>}
                  </div>
                  <AlbumArt song={song} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isCurrent ? 'text-violet-500' : ''}`}>{song.title}</p>
                    <p className={`text-xs ${textSecondary} truncate`}>{song.artist}</p>
                  </div>
                  <span className={`text-xs ${textSecondary} font-mono flex-shrink-0`}>{formatTime(song.duration)}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }} className="p-1.5 rounded-full transition-all hover:scale-110">
                      <Heart size={14} className={likedSongs.has(song.id) ? 'text-red-500' : textSecondary} fill={likedSongs.has(song.id) ? 'currentColor' : 'none'} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); addToQueue(song); }} className={`p-1.5 rounded-full transition-all hover:scale-110 ${textSecondary}`}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ═══════════ CREATE / JOIN JAM MODAL ═══════════ */}
      {(showCreateJam || showJoinJam) && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setShowCreateJam(false); setShowJoinJam(false); }}
            style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
          <div className={`fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto z-50 ${cardBg} rounded-3xl border ${borderColor} shadow-2xl overflow-hidden`}>
            <div className="p-5 border-b border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                    <Headphones size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">{showCreateJam ? 'Create a Jam' : 'Join a Jam'}</h3>
                    <p className={`text-xs ${textSecondary}`}>{showCreateJam ? 'Start a real-time session with friends' : 'Enter a room code to join'}</p>
                  </div>
                </div>
                <button onClick={() => { setShowCreateJam(false); setShowJoinJam(false); }} className={`p-2 rounded-full ${hoverBg}`}>
                  <X size={18} className={textSecondary} />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className={`text-xs font-semibold ${textSecondary} mb-1.5 block uppercase tracking-wider`}>Your Name</label>
                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder={generateUsername()}
                  className={`w-full px-4 py-2.5 rounded-xl ${inputBg} border ${borderColor} text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all`} />
              </div>
              {showJoinJam && (
                <div>
                  <label className={`text-xs font-semibold ${textSecondary} mb-1.5 block uppercase tracking-wider`}>Room Code</label>
                  <input type="text" value={joinRoomCode} onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())} placeholder="ABCDEF" maxLength={6}
                    className={`w-full px-4 py-2.5 rounded-xl ${inputBg} border ${borderColor} text-sm font-mono text-center tracking-[0.3em] uppercase focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all`} />
                </div>
              )}
              <button onClick={showCreateJam ? createJamRoom : joinJamRoom} disabled={isConnecting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold text-sm transition-all active:scale-[0.98] hover:shadow-lg hover:shadow-violet-500/30 disabled:opacity-50 flex items-center justify-center gap-2">
                {isConnecting ? <><Loader2 size={18} className="animate-spin" /> Connecting...</> : showCreateJam ? '🎵 Create Jam Room' : '🎧 Join Jam'}
              </button>
              {showCreateJam && (
                <button onClick={() => { setShowCreateJam(false); setShowJoinJam(true); }}
                  className={`w-full py-2.5 rounded-xl border ${borderColor} text-sm font-medium ${textSecondary} ${hoverBg} transition-all`}>
                  Or join an existing room →
                </button>
              )}
              {showJoinJam && (
                <button onClick={() => { setShowJoinJam(false); setShowCreateJam(true); }}
                  className={`w-full py-2.5 rounded-xl border ${borderColor} text-sm font-medium ${textSecondary} ${hoverBg} transition-all`}>
                  ← Or create a new room
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MusicPlayer;
