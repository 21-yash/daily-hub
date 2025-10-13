import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, Activity, AlertCircle, CheckCircle } from 'lucide-react';

const CricketScoreboard = ({ theme, showToast }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchDetails, setMatchDetails] = useState(null);
  const [filter, setFilter] = useState('live');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');

  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  const BACKEND_URL = 'http://localhost:3001';

  useEffect(() => {
    checkBackendHealth();
  }, []);

  useEffect(() => {
    fetchMatches();
    
    if (autoRefresh && backendStatus === 'online') {
      const interval = setInterval(fetchMatches, 30000);
      return () => clearInterval(interval);
    }
  }, [filter, autoRefresh, backendStatus]);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/health`, { 
        signal: AbortSignal.timeout(3000) 
      });
      const data = await response.json();
      
      if (data.success) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (error) {
      setBackendStatus('offline');
    }
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const endpoint = backendStatus === 'offline' 
        ? `${BACKEND_URL}/api/cricket/test`
        : filter === 'recent'
        ? `${BACKEND_URL}/api/cricket/recent-matches`
        : `${BACKEND_URL}/api/cricket/live-matches`;
      
      const response = await fetch(endpoint, { 
        signal: AbortSignal.timeout(5000) 
      });
      const data = await response.json();
      
      if (data.success) {
        let filteredMatches = data.matches;
        
        const uniqueMatches = [];
        const seenIds = new Set();
        
        for (const match of filteredMatches) {
          if (!seenIds.has(match.id)) {
            seenIds.add(match.id);
            uniqueMatches.push(match);
          }
        }
        
        if (filter === 'live') {
          filteredMatches = uniqueMatches.filter(m => m.isLive);
        } else {
          filteredMatches = uniqueMatches;
        }
        
        setMatches(filteredMatches);
        
        if (backendStatus === 'online' && filteredMatches.length === 0 && filter === 'live') {
          showToast('No live matches currently. Check back later!', 'info');
        }
      } else {
        showToast('Failed to fetch cricket data', 'error');
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      
      if (backendStatus === 'offline') {
        showToast('Backend is offline. Start the server!', 'error');
      }
      
      setMatches([
        {
          id: 'demo-1',
          team1: 'India',
          team2: 'Australia',
          score1: '328/5 (50)',
          score2: '286/9 (50)',
          status: 'India won by 42 runs',
          matchInfo: 'Demo Match',
          isLive: false,
          matchType: 'International'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchDetails = async (matchId) => {
    if (!matchId || matchId.startsWith('demo-') || matchId.startsWith('test-')) {
      showToast('Match details not available for demo matches', 'info');
      return;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/cricket/match/${matchId}`, {
        signal: AbortSignal.timeout(5000)
      });
      const data = await response.json();
      
      if (data.success) {
        setMatchDetails(data.match);
      }
    } catch (error) {
      console.error('Error fetching match details:', error);
      showToast('Could not fetch match details', 'error');
    }
  };

  const handleMatchClick = (match) => {
    setSelectedMatch(match);
    fetchMatchDetails(match.id);
  };

  const getTeamFlag = (teamName) => {
    const flags = {
      'IND': '🇮🇳', 'India': '🇮🇳',
      'AUS': '🇦🇺', 'Australia': '🇦🇺',
      'ENG': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'PAK': '🇵🇰', 'Pakistan': '🇵🇰',
      'RSA': '🇿🇦', 'South Africa': '🇿🇦',
      'NZ': '🇳🇿', 'New Zealand': '🇳🇿',
      'SL': '🇱🇰', 'Sri Lanka': '🇱🇰',
      'BAN': '🇧🇩', 'Bangladesh': '🇧🇩',
      'WI': '🇬🇾', 'West Indies': '🇬🇾',
      'AFG': '🇦🇫', 'Afghanistan': '🇦🇫',
      'ZIM': '🇿🇼', 'Zimbabwe': '🇿🇼',
      'IRE': '🇮🇪', 'Ireland': '🇮🇪',
      'INDW': '🇮🇳', 'AUSW': '🇦🇺',
      'JPN': '🇯🇵', 'Japan': '🇯🇵',
      'WSM': '🇼🇸', 'Samoa': '🇼🇸',
      'NEP': '🇳🇵', 'Nepal': '🇳🇵',
      'UAE': '🇦🇪', 'NOYW': '🇳🇴'
    };
    
    for (let [key, flag] of Object.entries(flags)) {
      if (teamName.toUpperCase().includes(key.toUpperCase())) {
        return flag;
      }
    }
    return '🏏';
  };

  const cleanScore = (score) => {
    if (!score) return 'Yet to bat';
    return score.replace(/^[A-Z]+\s*/i, '').trim();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            🏏 Cricket Live Scores
          </h2>
          <p className={`text-sm ${textSecondary} mt-1`}>
            Real-time cricket scores from Cricbuzz
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 ${
              autoRefresh 
                ? 'bg-green-500 text-white' 
                : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          >
            <Activity size={20} />
            Auto {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => {
              checkBackendHealth();
              fetchMatches();
            }}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Backend Status */}
      <div className={`${cardBg} p-4 rounded-xl border ${
        backendStatus === 'online' ? 'border-green-500' : 
        backendStatus === 'offline' ? 'border-red-500' : 
        borderColor
      } mb-6 flex items-start gap-3`}>
        {backendStatus === 'online' ? (
          <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
        ) : (
          <AlertCircle className="text-red-500 flex-shrink-0 mt-1" size={20} />
        )}
        <div className="flex-1">
          <p className="font-semibold mb-1">
            {backendStatus === 'online' ? '✅ Backend Online' : 
             backendStatus === 'offline' ? '❌ Backend Offline' : 
             '⏳ Checking Backend...'}
          </p>
          {backendStatus === 'offline' && (
            <>
              <p className={`text-sm ${textSecondary} mb-2`}>
                Start the backend to get live scores!
              </p>
              <code className="block bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded text-xs">
                cd backend && node cricketScraper.js
              </code>
            </>
          )}
          {backendStatus === 'online' && (
            <p className={`text-sm ${textSecondary}`}>
              Connected • Auto-refresh: {autoRefresh ? 'Every 30s' : 'Off'}
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('live')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
            filter === 'live'
              ? 'bg-red-500 text-white shadow-lg'
              : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className={filter === 'live' ? 'animate-pulse' : ''}>🔴</span>
            Live Matches
          </span>
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
            filter === 'all'
              ? 'bg-blue-500 text-white shadow-lg'
              : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          All Matches
        </button>
      </div>

      {/* Live Counter */}
      {matches.filter(m => m.isLive).length > 0 && (
        <div className={`${cardBg} p-4 rounded-xl border-2 border-red-500 mb-6`}>
          <div className="flex items-center justify-center gap-2 text-red-500 font-bold">
            <Activity size={20} className="animate-pulse" />
            <span>{matches.filter(m => m.isLive).length} LIVE MATCH{matches.filter(m => m.isLive).length > 1 ? 'ES' : ''}</span>
          </div>
        </div>
      )}

      {/* Matches Grid */}
      {loading && matches.length === 0 ? (
        <div className={`${cardBg} p-12 rounded-xl border ${borderColor} text-center`}>
          <RefreshCw size={48} className="mx-auto mb-4 animate-spin text-blue-500" />
          <p className={textSecondary}>Loading cricket scores...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className={`${cardBg} p-12 rounded-xl border ${borderColor} text-center ${textSecondary}`}>
          <span className="text-6xl mb-4 block">🏏</span>
          <p className="text-xl mb-2">No {filter} matches found</p>
          <p className="text-sm">Try All Matches or check back later</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {matches.map((match, index) => (
            <div
              key={`${match.id}-${index}`}
              onClick={() => handleMatchClick(match)}
              className={`${cardBg} rounded-xl border ${borderColor} overflow-hidden transition-all duration-200 hover:shadow-xl hover:scale-105 cursor-pointer ${match.isLive ? 'ring-2 ring-red-500' : ''}`}
            >
              <div className={`p-4 ${match.isLive ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-purple-600'} text-white`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">{match.matchType || 'Cricket Match'}</span>
                  {match.isLive && (
                    <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full animate-pulse">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                      LIVE
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-90">{match.matchInfo || 'Cricket Match'}</p>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-3xl">{getTeamFlag(match.team1)}</span>
                    <p className="font-bold text-lg">{match.team1}</p>
                  </div>
                  <p className="text-xl font-bold text-blue-500">{cleanScore(match.score1)}</p>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-3xl">{getTeamFlag(match.team2)}</span>
                    <p className="font-bold text-lg">{match.team2}</p>
                  </div>
                  <p className="text-xl font-bold text-green-500">{cleanScore(match.score2)}</p>
                </div>

                {match.status && (
                  <div className={`p-3 rounded-lg text-center font-semibold text-sm ${match.isLive ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                    {match.status}
                  </div>
                )}

                {match.link && !match.id.startsWith('demo-') && !match.id.startsWith('test-') && (
                  <a
                    href={match.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-4 flex items-center justify-center gap-2 text-blue-500 hover:text-blue-600 font-medium text-sm"
                  >
                    View on Cricbuzz
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => { setSelectedMatch(null); setMatchDetails(null); }}>
          <div className={`${cardBg} rounded-xl border ${borderColor} max-w-4xl w-full max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{selectedMatch.team1} vs {selectedMatch.team2}</h3>
                  <p className="text-sm opacity-90">{selectedMatch.matchInfo}</p>
                </div>
                <button onClick={() => { setSelectedMatch(null); setMatchDetails(null); }} className="text-white hover:bg-white/20 p-2 rounded-lg transition-all text-2xl leading-none">×</button>
              </div>
            </div>
            <div className="p-6">
              <p className={textSecondary}>Match details loading...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CricketScoreboard;