import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Plus, Trash2, Music, Search, Loader, X, Repeat, Repeat1, Shuffle } from 'lucide-react';

const MusicPlayer = ({ theme, showToast }) => {
  const [queue, setQueue] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [loopMode, setLoopMode] = useState('none'); // 'none', 'all', 'one'
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [playedTracks, setPlayedTracks] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(true);

  const playerRef = useRef(null);
  const progressInterval = useRef(null);
  const isLoadingTrack = useRef(false);
  const latestQueue = useRef(queue);
  const latestIndex = useRef(currentTrackIndex);
  const latestLoopMode = useRef(loopMode);
  const latestShuffleEnabled = useRef(shuffleEnabled);
  const latestPlayedTracks = useRef(playedTracks);
  const draggedItem = useRef(null);
  const draggedOverItem = useRef(null);

  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  useEffect(() => {
    latestQueue.current = queue;
  }, [queue]);

  useEffect(() => {
    latestIndex.current = currentTrackIndex;
  }, [currentTrackIndex]);

  useEffect(() => {
    latestLoopMode.current = loopMode;
  }, [loopMode]);

  useEffect(() => {
    latestShuffleEnabled.current = shuffleEnabled;
  }, [shuffleEnabled]);

  useEffect(() => {
    latestPlayedTracks.current = playedTracks;
  }, [playedTracks]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API Ready');
        initPlayer();
      };
    } else if (window.YT && window.YT.Player) {
      initPlayer();
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, []);

  const initPlayer = () => {
    if (playerRef.current && playerRef.current.destroy) {
      playerRef.current.destroy();
    }

    playerRef.current = new window.YT.Player('youtube-player', {
      height: '1',
      width: '1',
      playerVars: {
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError,
      },
    });
  };

  const onPlayerReady = () => {
    console.log('Player ready');
    setPlayerReady(true);
    if (queue.length > 0 && !isLoadingTrack.current) {
      loadTrack(currentTrackIndex);
    }
  };

  const onPlayerStateChange = (event) => {
    console.log('Player state changed:', event.data);
    
    if (event.data === window.YT.PlayerState.PLAYING) {
      console.log('Now playing');
      setIsPlaying(true);
      isLoadingTrack.current = false;
      startProgressTracking();
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      console.log('Paused');
      setIsPlaying(false);
      stopProgressTracking();
    } else if (event.data === window.YT.PlayerState.ENDED) {
      console.log('Track ended');
      stopProgressTracking();
      setIsPlaying(false);
      setCurrentTime(0);
      
      const currentQueue = latestQueue.current;
      const currentIndex = latestIndex.current;
      const currentLoopMode = latestLoopMode.current;
      const isShuffleOn = latestShuffleEnabled.current;
      const alreadyPlayed = latestPlayedTracks.current;
      
      console.log('Loop mode:', currentLoopMode);
      console.log('Shuffle enabled:', isShuffleOn);
      
      if (currentQueue.length === 0) return;
      
      // Handle loop one - replay the same track
      if (currentLoopMode === 'one') {
        console.log('Loop one - replaying current track');
        setTimeout(() => {
          if (playerRef.current && playerRef.current.playVideo) {
            playerRef.current.seekTo(0, true);
            playerRef.current.playVideo();
            setIsPlaying(true);
          }
        }, 100);
        return;
      }
      
      // Handle shuffle mode
      if (isShuffleOn) {
        const unplayedTracks = currentQueue
          .map((track, idx) => idx)
          .filter(idx => !alreadyPlayed.includes(idx));
        
        console.log('Unplayed tracks:', unplayedTracks);
        
        if (unplayedTracks.length > 0) {
          // Pick random from unplayed tracks
          const randomIndex = unplayedTracks[Math.floor(Math.random() * unplayedTracks.length)];
          console.log('Playing random unplayed track:', randomIndex);
          setPlayedTracks(prev => [...prev, randomIndex]);
          setCurrentTrackIndex(randomIndex);
        } else if (currentLoopMode === 'all') {
          // All tracks played, reset and start again
          console.log('All tracks played, resetting shuffle');
          setPlayedTracks([0]);
          setCurrentTrackIndex(0);
        } else {
          // No loop, shuffle exhausted
          console.log('Shuffle complete, stopping');
          setIsPlaying(false);
        }
        return;
      }
      
      // Normal sequential playback
      const nextIndex = (currentIndex + 1) % currentQueue.length;
      console.log('Next index:', nextIndex, 'Current index:', currentIndex);
      
      if (nextIndex === 0 && currentLoopMode !== 'all') {
        // Reached the end and not looping all
        console.log('Queue ended, stopping playback');
        setIsPlaying(false);
      } else {
        // Continue to next track
        console.log('Moving to next track:', nextIndex);
        setCurrentTrackIndex(nextIndex);
      }
    } else if (event.data === window.YT.PlayerState.BUFFERING) {
      console.log('Buffering...');
    }
  };

  const onPlayerError = (event) => {
    console.error('Player error:', event.data);
    showToast('Failed to play track. Skipping...', 'error');
    isLoadingTrack.current = false;
    setTimeout(() => {
      if (queue.length > 1) {
        const nextIndex = (currentTrackIndex + 1) % queue.length;
        setCurrentTrackIndex(nextIndex);
      }
    }, 1000);
  };

  const startProgressTracking = () => {
    stopProgressTracking();
    progressInterval.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const current = playerRef.current.getCurrentTime();
        const total = playerRef.current.getDuration();
        setCurrentTime(current);
        setDuration(total);
      }
    }, 500);
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const loadTrack = (index) => {
    if (!playerRef.current || !queue[index] || isLoadingTrack.current) return;
    
    const videoId = queue[index].id;
    console.log('Loading track:', queue[index].title, 'ID:', videoId);
    
    isLoadingTrack.current = true;
    stopProgressTracking();
    setCurrentTime(0);
    setDuration(0);
    
    try {
      if (playerRef.current.loadVideoById) {
        playerRef.current.loadVideoById({
          videoId: videoId,
          startSeconds: 0
        });
        playerRef.current.setVolume(volume);
      }
    } catch (error) {
      console.error('Error loading track:', error);
      isLoadingTrack.current = false;
    }
  };

  useEffect(() => {
    const savedQueue = localStorage.getItem('musicQueue');
    if (savedQueue) {
      try {
        setQueue(JSON.parse(savedQueue));
      } catch (error) {
        console.error('Failed to load queue:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (queue.length > 0) {
      localStorage.setItem('musicQueue', JSON.stringify(queue));
    } else {
      localStorage.removeItem('musicQueue');
    }
  }, [queue]);

  useEffect(() => {
    if (playerReady && queue.length > 0 && currentTrackIndex >= 0 && currentTrackIndex < queue.length) {
      loadTrack(currentTrackIndex);
    }
  }, [currentTrackIndex, playerReady]);

  // Effect for Media Session API
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        artwork: [
          { src: currentTrack.thumbnail, sizes: '96x96', type: 'image/jpeg' },
          { src: currentTrack.thumbnail, sizes: '128x128', type: 'image/jpeg' },
          { src: currentTrack.thumbnail, sizes: '192x192', type: 'image/jpeg' },
          { src: currentTrack.thumbnail, sizes: '256x256', type: 'image/jpeg' },
          { src: currentTrack.thumbnail, sizes: '384x384', type: 'image/jpeg' },
          { src: currentTrack.thumbnail, sizes: '512x512', type: 'image/jpeg' },
        ]
      });

      // Set up action handlers
      navigator.mediaSession.setActionHandler('play', playPause);
      navigator.mediaSession.setActionHandler('pause', playPause);
      navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
      navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
    }
  }, [currentTrack, playPause, prevTrack, nextTrack]);


  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      showToast('Please enter a song name to search', 'warning');
      return;
    }
    setIsSearching(true);
    setSearchResults([]);
    try {
      const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (!API_KEY) {
        throw new Error("YouTube API key is missing! Add VITE_YOUTUBE_API_KEY to your .env file");
      }
      
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery + ' audio')}&key=${API_KEY}&type=video&videoCategoryId=10&maxResults=10`
      );
      
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const formattedResults = data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
        artist: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      }));
      
      setSearchResults(formattedResults);
      if (formattedResults.length === 0) showToast('No results found', 'info');
    } catch (error) {
      console.error('YouTube Search Error:', error);
      showToast(`Search failed: ${error.message}`, 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const addTrackToQueue = (track) => {
    if (queue.some(p => p.id === track.id)) {
      showToast('This track is already in the queue', 'info');
      return;
    }
    setQueue(prev => {
      const newQueue = [...prev, track];
      if (prev.length === 0) setCurrentTrackIndex(0);
      return newQueue;
    });
    showToast('Track added to queue!', 'success');
  };

  const deleteTrack = (id) => {
    const trackIndex = queue.findIndex(track => track.id === id);
    setQueue(prev => {
      const newQueue = prev.filter(track => track.id !== id);
      if (newQueue.length === 0) {
        setCurrentTrackIndex(0);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        stopProgressTracking();
      } else if (trackIndex === currentTrackIndex) {
        setCurrentTrackIndex(Math.min(currentTrackIndex, newQueue.length - 1));
      } else if (trackIndex < currentTrackIndex) {
        setCurrentTrackIndex(prev => prev - 1);
      }
      return newQueue;
    });
    showToast('Track removed', 'info');
  };

  const playPause = React.useCallback(() => {
    if (!playerRef.current || queue.length === 0) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [queue, isPlaying]);

  const nextTrack = React.useCallback(() => {
    if (queue.length === 0) return;
    
    if (shuffleEnabled) {
      const unplayedTracks = queue
        .map((track, idx) => idx)
        .filter(idx => !playedTracks.includes(idx));
      
      if (unplayedTracks.length > 0) {
        const randomIndex = unplayedTracks[Math.floor(Math.random() * unplayedTracks.length)];
        setPlayedTracks(prev => [...prev, randomIndex]);
        setCurrentTrackIndex(randomIndex);
      } else if (loopMode === 'all') {
        const randomIndex = Math.floor(Math.random() * queue.length);
        setPlayedTracks([randomIndex]);
        setCurrentTrackIndex(randomIndex);
      } else {
        showToast('All tracks played', 'info');
      }
    } else {
      const nextIndex = (currentTrackIndex + 1) % queue.length;
      setCurrentTrackIndex(nextIndex);
    }
  }, [queue, currentTrackIndex, shuffleEnabled, playedTracks, loopMode, showToast]);

  const prevTrack = React.useCallback(() => {
    if (queue.length === 0) return;
    
    if (shuffleEnabled) {
      const unplayedTracks = queue
        .map((track, idx) => idx)
        .filter(idx => !playedTracks.includes(idx) && idx !== currentTrackIndex);
      
      if (unplayedTracks.length > 0) {
        const randomIndex = unplayedTracks[Math.floor(Math.random() * unplayedTracks.length)];
        setPlayedTracks(prev => [...prev, randomIndex]);
        setCurrentTrackIndex(randomIndex);
      } else {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * queue.length);
        } while (randomIndex === currentTrackIndex && queue.length > 1);
        setCurrentTrackIndex(randomIndex);
      }
    } else {
      const prevIndex = currentTrackIndex === 0 ? queue.length - 1 : currentTrackIndex - 1;
      setCurrentTrackIndex(prevIndex);
    }
  }, [queue, currentTrackIndex, shuffleEnabled, playedTracks]);

  const selectTrack = (index) => {
    console.log('Track selected:', index);
    setCurrentTrackIndex(index);
    if (shuffleEnabled) {
      setPlayedTracks(prev => [...prev, index]);
    }
  };

  const handleSeek = (e) => {
    if (!playerRef.current || !duration) return;
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    playerRef.current.seekTo(seekTime, true);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(newVolume);
    }
    if (newVolume > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const toggleLoop = () => {
    setLoopMode(prev => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'one';
      return 'none';
    });
    console.log('Loop mode toggled');
  };

  const toggleShuffle = () => {
    setShuffleEnabled(prev => {
      const newValue = !prev;
      if (newValue) {
        // Starting shuffle, mark current track as played
        setPlayedTracks([currentTrackIndex]);
        console.log('Shuffle enabled, tracking from current track');
      } else {
        // Stopping shuffle, clear played tracks
        setPlayedTracks([]);
        console.log('Shuffle disabled, cleared played tracks');
      }
      return newValue;
    });
  };

  const handleDragStart = (index) => {
    draggedItem.current = index;
  };

  const handleDragEnter = (index) => {
    draggedOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (draggedItem.current === null || draggedOverItem.current === null) return;
    if (draggedItem.current === draggedOverItem.current) return;

    const newQueue = [...queue];
    const draggedItemContent = newQueue[draggedItem.current];
    
    // Remove dragged item
    newQueue.splice(draggedItem.current, 1);
    // Insert at new position
    newQueue.splice(draggedOverItem.current, 0, draggedItemContent);
    
    // Update current track index
    if (draggedItem.current === currentTrackIndex) {
      setCurrentTrackIndex(draggedOverItem.current);
    } else if (draggedItem.current < currentTrackIndex && draggedOverItem.current >= currentTrackIndex) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    } else if (draggedItem.current > currentTrackIndex && draggedOverItem.current <= currentTrackIndex) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
    
    setQueue(newQueue);
    draggedItem.current = null;
    draggedOverItem.current = null;
  };

  const dismissSearch = () => {
    setShowSearch(false);
    setSearchResults([]);
    setSearchQuery('');
  };

  const formatTime = (time) => {
    if (isNaN(time) || time === 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentTrack = queue[currentTrackIndex];

  return (
    <div className="space-y-6">
      {/* Hidden YouTube Player */}
      <div style={{ position: 'absolute', left: '-9999px' }}>
        <div id="youtube-player"></div>
      </div>

      {/* Search Section */}
      {showSearch ? (
        <div className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Search for Music</h3>
            <button 
              onClick={dismissSearch}
              className="p-2 rounded-lg hover:bg-gray-500 dark:hover:bg-gray-700 transition-colors"
              title="Dismiss search"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              placeholder="Search for a song..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()} 
              className={`flex-1 px-4 py-2 rounded-lg ${cardBg} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            />
            <button 
              onClick={handleSearch} 
              disabled={isSearching} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSearching ? <Loader size={20} className="animate-spin" /> : <Search size={20} />}
              Search
            </button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map(track => (
                <div 
                  key={track.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-500'} transition-colors`}
                >
                  <img 
                    src={track.thumbnail} 
                    alt={track.title} 
                    className="w-12 h-12 rounded object-cover" 
                  />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium line-clamp-1">{track.title}</p>
                    <p className={`text-sm ${textSecondary} line-clamp-1`}>{track.artist}</p>
                  </div>
                  <button 
                    onClick={() => addTrackToQueue(track)} 
                    className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className={`${cardBg} p-4 rounded-xl border ${borderColor} flex items-center justify-between`}>
          <p className={textSecondary}>Search dismissed</p>
          <button 
            onClick={() => setShowSearch(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Search size={18} />
            Show Search
          </button>
        </div>
      )}
      
      {/* Player UI */}
      <div className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
        <div className="text-center mb-6">
          {currentTrack ? (
            <>
              <img 
                src={currentTrack.thumbnail} 
                alt={currentTrack.title} 
                className="w-32 h-32 mx-auto mb-4 rounded-lg shadow-lg object-cover" 
              />
              <h3 className="text-xl font-bold mb-1 line-clamp-2">{currentTrack.title}</h3>
              <p className={`text-sm ${textSecondary}`}>{currentTrack.artist}</p>
            </>
          ) : (
            <>
              <div className="w-32 h-32 mx-auto mb-4 bg-gray-300 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Music size={48} className="text-gray-500" />
              </div>
              <p className={textSecondary}>No track selected</p>
            </>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={(currentTime / duration) * 100 || 0} 
            onChange={handleSeek} 
            className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg cursor-pointer appearance-none"
            style={{
              background: currentTrack ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, ${theme === 'dark' ? '#374151' : '#d1d5db'} ${(currentTime / duration) * 100}%, ${theme === 'dark' ? '#374151' : '#d1d5db'} 100%)` : undefined
            }}
            disabled={!currentTrack} 
          />
          <div className="flex justify-between text-sm mt-2">
            <span className={textSecondary}>{formatTime(currentTime)}</span>
            <span className={textSecondary}>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between gap-4 mb-4">
          {/* Volume Control - Left Side */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleVolumeChange({ target: { value: volume > 0 ? 0 : 70 }})} 
              className="p-1.5 rounded-lg hover:bg-gray-500 dark:hover:bg-gray-700 transition-colors"
            >
              {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={volume} 
              onChange={handleVolumeChange} 
              className="w-24 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-lg cursor-pointer"
            />
            <span className={`text-sm ${textSecondary} w-12`}>
              {volume}%
            </span>
          </div>

          {/* Playback Controls - Center */}
          <div className="flex items-center justify-center gap-2">
            <button 
              onClick={toggleShuffle}
              className={`p-2 rounded-lg transition-colors ${
                shuffleEnabled 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'hover:bg-gray-500 dark:hover:bg-gray-700'
              }`}
              title={shuffleEnabled ? "Shuffle: On" : "Shuffle: Off"}
            >
              <Shuffle size={18} />
            </button>
            <button 
              onClick={prevTrack} 
              disabled={queue.length === 0} 
              className="p-2.5 rounded-full hover:bg-gray-500 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <SkipBack size={20} />
            </button>
            <button 
              onClick={playPause} 
              disabled={queue.length === 0} 
              className="p-3.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button 
              onClick={nextTrack} 
              disabled={queue.length === 0} 
              className="p-2.5 rounded-full hover:bg-gray-500 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <SkipForward size={20} />
            </button>
            <button 
              onClick={toggleLoop}
              className={`p-2 rounded-lg transition-colors ${
                loopMode !== 'none'
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'hover:bg-gray-500 dark:hover:bg-gray-700'
              }`}
              title={loopMode === 'none' ? 'Loop: Off' : loopMode === 'all' ? 'Loop: All' : 'Loop: One'}
            >
              {loopMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
            </button>
          </div>

          {/* Empty space for balance */}
          <div className="w-36"></div>
        </div>
      </div>

      {/* Queue */}
      <div className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
        <h3 className="font-semibold mb-4">Queue ({queue.length})</h3>
        {queue.length === 0 ? (
          <div className={`text-center py-8 ${textSecondary}`}>
            <Music size={48} className="mx-auto mb-2 opacity-50" />
            <p>Your queue is empty</p>
            <p className="text-sm mt-1">Search and add songs to get started!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {queue.map((track, index) => (
              <div 
                key={track.id} 
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => selectTrack(index)} 
                className={`flex items-center justify-between p-3 rounded-lg cursor-move transition-colors ${
                  index === currentTrackIndex 
                    ? 'bg-blue-500 text-white' 
                    : `hover:bg-gray-500 dark:hover:bg-gray-700`
                }`}
              >
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <div className="relative">
                    <img 
                      src={track.thumbnail} 
                      alt={track.title} 
                      className="w-12 h-12 rounded-md object-cover" 
                    />
                    {index === currentTrackIndex && isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-md">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium truncate">{track.title}</p>
                    <p className={`text-sm truncate ${index === currentTrackIndex ? 'text-white/80' : textSecondary}`}>
                      {track.artist}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    deleteTrack(track.id); 
                  }} 
                  className={`p-2 rounded-lg transition-colors ${
                    index === currentTrackIndex 
                      ? 'hover:bg-white/20' 
                      : 'hover:bg-gray-500 dark:hover:bg-gray-600'
                  }`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicPlayer;