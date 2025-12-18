import React, { useState, useEffect } from 'react';
import { RefreshCw, Activity, AlertCircle, CheckCircle, X, Trophy, MapPin } from 'lucide-react';

const CricketScoreboard = ({ theme, showToast }) => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [scorecardData, setScorecardData] = useState(null);
    const [scorecardLoading, setScorecardLoading] = useState(false);
    const [showScorecard, setShowScorecard] = useState(false);
    const [filter, setFilter] = useState('live');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [backendStatus, setBackendStatus] = useState('checking');

    const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
    const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

    const BACKEND_URL = 'https://backend-4z7z.onrender.com';

    const filterOptions = [
        { value: 'live', label: 'Live', icon: '🔴' },
        { value: 'all', label: 'All', icon: '🏏' },
        { value: 'International', label: 'International', icon: '🌍' },
        { value: 'Domestic', label: 'Domestic', icon: '🏠' },
        { value: 'Women', label: 'Women', icon: '👩' },
        { value: 'League', label: 'League', icon: '🏆' }
    ];

    useEffect(() => {
        checkBackendHealth();
    }, []);

    useEffect(() => {
        fetchMatches();
        let interval;
        if (autoRefresh && backendStatus === 'online') {
            interval = setInterval(fetchMatches, 30000);
        }
        return () => clearInterval(interval);
    }, [filter, autoRefresh, backendStatus]);



    useEffect(() => {
        if (selectedMatch) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedMatch]);

    useEffect(() => {
    const handleRefresh = () => {
        console.log('🔄 Refresh requested from widget');
        fetchMatches();
    };

    window.addEventListener('refreshCricket', handleRefresh);
    
    return () => {
        window.removeEventListener('refreshCricket', handleRefresh);
    };
    }, []);

    const checkBackendHealth = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
            const data = await response.json();
            setBackendStatus(data.success ? 'online' : 'offline');
        } catch (error) {
            setBackendStatus('offline');
        }
    };

    const fetchMatches = async () => {
        setLoading(true);
        try {
            const endpoint = backendStatus === 'offline' ?
                `${BACKEND_URL}/api/cricket/test` :
                `${BACKEND_URL}/api/cricket/live-matches`;

            const response = await fetch(endpoint, { signal: AbortSignal.timeout(8000) });
            const data = await response.json();

            if (data.success) {
                const uniqueMatches = Array.from(new Map(data.matches.map(m => [m.id, m])).values());
                let filteredMatches = uniqueMatches;
                
                if (filter === 'live') {
                    filteredMatches = uniqueMatches.filter(m => m.isLive);
                } else if (filter !== 'all') {
                    filteredMatches = uniqueMatches.filter(m => m.matchType === filter);
                }
                
                setMatches(filteredMatches);
            }
        } catch (error) {
            console.error('Error:', error);
            if (backendStatus === 'online') {
                showToast('Could not fetch cricket data', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchMatchDetails = async (match) => {
        if (!match.link || match.id.startsWith('test-')) {
            showToast("Detailed view is not available for this match.", "info");
            return;
        }
        setSelectedMatch(match);
        setModalLoading(true);
        setModalData(null);
        setShowScorecard(false);
        setScorecardData(null);

        try {
            const response = await fetch(`${BACKEND_URL}/api/cricket/match-details`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matchUrl: match.link }),
                signal: AbortSignal.timeout(10000),
            });
            const data = await response.json();
            if (data.success) {
                setModalData(data.data);
            } else {
                throw new Error(data.error || 'Failed to fetch details');
            }
        } catch (error) {
            console.error('Error fetching match details:', error);
            showToast('Could not fetch detailed match data.', 'error');
            setSelectedMatch(null);
        } finally {
            setModalLoading(false);
        }
    };

    const fetchScorecard = async (match) => {
        if (!match.id || !match.slug || match.id.startsWith('test-')) {
            showToast("Scorecard is not available for this match.", "info");
            return;
        }
        
        setScorecardLoading(true);
        setShowScorecard(true);
        
        try {
            const response = await fetch(`${BACKEND_URL}/api/cricket/scorecard/${match.id}/${match.slug}`, {
                signal: AbortSignal.timeout(15000),
            });
            const data = await response.json();
            if (data.success) {
                setScorecardData(data.scorecard);
            } else {
                throw new Error(data.error || 'Failed to fetch scorecard');
            }
        } catch (error) {
            console.error('Error fetching scorecard:', error);
            showToast('Could not fetch scorecard data.', 'error');
            setShowScorecard(false);
        } finally {
            setScorecardLoading(false);
        }
    };

    const getTeamFlag = (teamName) => {
        const flags = {
            'IND': '🇮🇳', 'India': '🇮🇳', 'AUS': '🇦🇺', 'Australia': '🇦🇺',
            'ENG': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'PAK': '🇵🇰', 'Pakistan': '🇵🇰',
            'RSA': '🇿🇦', 'South Africa': '🇿🇦', 'NZ': '🇳🇿', 'New Zealand': '🇳🇿',
            'SL': '🇱🇰', 'Sri Lanka': '🇱🇰', 'BAN': '🇧🇩', 'Bangladesh': '🇧🇩',
            'WI': '🇬🇾', 'West Indies': '🇬🇾', 'AFG': '🇦🇫', 'Afghanistan': '🇦🇫',
            'INDW': '🇮🇳', 'AUSW': '🇦🇺', 'BANW': '🇧🇩', 'RSAW': '🇿🇦',
            'JPN': '🇯🇵', 'Japan': '🇯🇵', 'WSM': '🇼🇸', 'Samoa': '🇼🇸', 
            'NEP': '🇳🇵', 'Nepal': '🇳🇵', 'UAE': '🇦🇪', 'NOYW': '🇳🇴',
            'SLW': '🇱🇰', 'NZW': '🇳🇿'
        };
        for (let key in flags) {
            if (teamName.toUpperCase().includes(key.toUpperCase())) return flags[key];
        }
        return '🏏';
    };

    const StatItem = ({ label, value }) => (
        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className={`text-xs ${textSecondary} mb-1`}>{label}</p>
            <p className="font-semibold text-sm">{value}</p>
        </div>
    );
    
    const renderLiveView = () => {
        if (modalLoading) {
            return (
                <div className="flex flex-col items-center justify-center p-10">
                    <RefreshCw size={32} className="animate-spin text-blue-500 mb-4" />
                    <p className={textSecondary}>Fetching live details...</p>
                </div>
            );
        }
        if (!modalData) {
            return (
                <div className="p-10 text-center">
                    <p className={textSecondary}>Could not load match details.</p>
                </div>
            );
        }

        return (
            <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                {/* Live Score Display */}
                <div className={`p-4 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    {/* Score Display - Mimicking Cricbuzz style */}
                    <div className="flex flex-col gap-2">
                        {/* Teams Score Display */}
                        {modalData.teams && modalData.teams.length > 0 ? (
                            <div className="flex flex-col gap-2 text-lg">
                                {modalData.teams.map((team, index) => (
                                    <div 
                                        key={index} 
                                        className={`flex justify-between items-center text-xl ${
                                            team.isBatting 
                                            ? 'font-bold text-black' 
                                            : 'text-gray-500'
                                        }`}
                                    >
                                        <span>{team.name}</span>
                                        <span>{team.score}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center font-bold text-lg">{modalData.liveScore.current || 'No live score available'}</p>
                        )}

                        {/* Status/Update */}
                        {modalData.update && (
                            <div className="text-center">
                                <p className="text-base text-blue-500 font-semibold">{modalData.update}</p>
                            </div>
                        )}

                        {/* CRR and RRR side-by-side */}
                        {(modalData.liveScore.runRate || modalData.liveScore.requiredRunRate) && (
                            <div className="flex justify-center gap-4 mt-2 text-xs">
                                {modalData.liveScore.runRate && (
                                    <span className={textSecondary}>CRR: {modalData.liveScore.runRate}</span>
                                )}
                                {modalData.liveScore.requiredRunRate && (
                                    <span className={textSecondary}>RRR: {modalData.liveScore.requiredRunRate}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {modalData.playerOfTheMatch && modalData.playerOfTheMatch.name && (
                    <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner gap-4 mb-4">
                        <h3 className={`text-xs font-bold uppercase ${textSecondary} mb-2 tracking-wider`}>
                            Player of the Match
                        </h3>
                        <div className="flex items-center gap-3">
                            {/* Conditionally render image only if imageUrl exists */}
                            {modalData.playerOfTheMatch.imageUrl && (
                                <img 
                                    src={modalData.playerOfTheMatch.imageUrl} 
                                    alt={modalData.playerOfTheMatch.name} 
                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                                    // Fallback in case the image fails to load
                                    onError={(e) => { 
                                        e.target.onerror = null; 
                                        e.target.src='https://placehold.co/48x48/EFEFEF/333333?text=?'; // Optional fallback placeholder
                                    }}
                                />
                            )}
                            <span className="font-bold text-lg text-gray-900 dark:text-white">{modalData.playerOfTheMatch.name}</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Batting Card */}
                    <div className={`${cardBg} border ${borderColor} rounded-lg p-4`}>
                        <h4 className="font-bold mb-3">Batting</h4>
                        <div className="space-y-3">
                            {modalData.batsmen && modalData.batsmen.length > 0 ? (
                                modalData.batsmen.map((batsman, i) => (
                                    <div key={i} className={`pb-3 ${i < modalData.batsmen.length - 1 ? `border-b ${borderColor}` : ''}`}>
                                        <div className="flex justify-between items-center mb-1">
                                            <p className={`font-semibold ${batsman.onStrike ? 'text-green-500' : 'text-blue-500'}`}>
                                                {batsman.name} {batsman.onStrike && '*'}
                                            </p>
                                            <p className="font-bold text-lg">
                                                {batsman.runs} <span className="text-sm font-normal text-gray-500">({batsman.balls})</span>
                                            </p>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>4s: {batsman.fours}</span>
                                            <span>6s: {batsman.sixes}</span>
                                            <span>SR: {batsman.strikeRate}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className={`text-sm ${textSecondary}`}>No batting data available</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Bowling Card */}
                    <div className={`${cardBg} border ${borderColor} rounded-lg p-4`}>
                        <h4 className="font-bold mb-3">Bowling</h4>
                        <div className="space-y-3">
                            {modalData.bowlers && modalData.bowlers.length > 0 ? (
                                modalData.bowlers.map((bowler, i) => (
                                    <div key={i} className={`pb-3 ${i < modalData.bowlers.length - 1 ? `border-b ${borderColor}` : ''}`}>
                                        <div className="flex justify-between items-center">
                                            <p className={`font-semibold ${bowler.onStrike ? 'text-green-500' : 'text-blue-500'}`}>
                                                {bowler.name} {bowler.onStrike && '*'}
                                            </p>
                                            <p className="font-bold text-lg">{bowler.wickets}/{bowler.runs}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            O: {bowler.overs} | M: {bowler.maidens} | Eco: {bowler.economy}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className={`text-sm ${textSecondary}`}>No bowling data available</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {modalData.partnership && (
                        <StatItem label="Partnership" value={modalData.partnership} />
                    )}
                    {modalData.recentBalls && (
                        <StatItem label="Recent Balls" value={modalData.recentBalls} />
                    )}
                </div>
                {modalData.lastWicket && (
                    <StatItem label="Last Wicket" value={modalData.lastWicket} />
                )}

                {/* Commentary Section */}
                {modalData.commentary && modalData.commentary.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-bold mb-3">Commentary</h4>
                        <div className="space-y-2">
                            {modalData.commentary.map((comm, i) => (
                                <div key={i} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                                    <div className="flex items-start gap-2">
                                        <span className="font-bold text-blue-500 text-sm flex-shrink-0">
                                            {comm.ball}
                                        </span>
                                        {comm.event && (
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold flex-shrink-0 ${
                                                comm.event === 'W' ? 'bg-red-500 text-white' :
                                                comm.event === '6' ? 'bg-purple-500 text-white' :
                                                comm.event === '4' ? 'bg-green-500 text-white' : ''
                                            }`}>
                                                {comm.event}
                                            </span>
                                        )}
                                        <p className={`text-sm ${textSecondary} flex-1`}>{comm.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderScorecard = () => {
        if (scorecardLoading) {
            return (
                <div className="flex flex-col items-center justify-center p-10">
                    <RefreshCw size={32} className="animate-spin text-blue-500 mb-4" />
                    <p className={textSecondary}>Loading full scorecard...</p>
                </div>
            );
        }

        if (!scorecardData) {
            return (
                <div className="p-10 text-center">
                    <p className={textSecondary}>Could not load scorecard.</p>
                </div>
            );
        }

        return (
            <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                <div className={`p-4 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <p className="text-sm font-semibold text-blue-500 mb-1">{scorecardData.matchInfo.series}</p>
                    <p className="text-xs text-gray-500">{scorecardData.matchInfo.venue}</p>
                    <p className="text-xs text-gray-500">{scorecardData.matchInfo.dateTime}</p>
                </div>

                {scorecardData.status && (
                    <div className={`p-3 rounded-lg text-center mb-4 font-semibold ${theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
                        {scorecardData.status}
                    </div>
                )}

                {scorecardData.innings.map((innings, idx) => (
                    <div key={idx} className={`mb-6 ${cardBg} border ${borderColor} rounded-lg overflow-hidden`}>
                        <div className={`p-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} flex justify-between items-center`}>
                            <div>
                                <p className="font-bold">{innings.battingTeam}</p>
                                <p className="text-xs text-gray-500">Innings {innings.inningsNumber}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg">{innings.score}</p>
                                <p className="text-xs text-gray-500">{innings.overs}</p>
                            </div>
                        </div>

                        <div className="p-4">
                            <h5 className="font-bold mb-3 text-sm">Batting</h5>
                            <div className="overflow-x-auto -mx-4 px-4">
                                <table className="w-full text-xs">
                                    <thead className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                        <tr>
                                            <th className="text-left py-2 px-2 font-semibold">Batter</th>
                                            <th className="text-center py-2 px-1">R</th>
                                            <th className="text-center py-2 px-1">B</th>
                                            <th className="text-center py-2 px-1">4s</th>
                                            <th className="text-center py-2 px-1">6s</th>
                                            <th className="text-center py-2 px-1">SR</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {innings.batting.map((bat, i) => (
                                            <tr key={i} className={`border-b ${borderColor}`}>
                                                <td className="py-2 px-2">
                                                    <p className="font-semibold">{bat.name}</p>
                                                    <p className="text-gray-500 text-xs">{bat.status}</p>
                                                </td>
                                                <td className="text-center py-2 px-1 font-semibold">{bat.runs}</td>
                                                <td className="text-center py-2 px-1">{bat.balls}</td>
                                                <td className="text-center py-2 px-1">{bat.fours}</td>
                                                <td className="text-center py-2 px-1">{bat.sixes}</td>
                                                <td className="text-center py-2 px-1">{bat.strikeRate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {innings.extras && (
                                <div className="mt-2 text-xs text-gray-500">
                                    <span className="font-semibold">Extras:</span> {innings.extras}
                                </div>
                            )}

                            {innings.didNotBat.length > 0 && (
                                <div className="mt-3 text-xs">
                                    <span className="font-semibold">Did not bat:</span> {innings.didNotBat.join(', ')}
                                </div>
                            )}

                            {innings.fallOfWickets.length > 0 && innings.fallOfWickets[0].player !== 'mandatory' && (
                                <div className="mt-3">
                                    <h6 className="font-semibold text-xs mb-2">Fall of Wickets</h6>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {innings.fallOfWickets.map((fow, i) => (
                                            <span key={i} className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                                {fow.scoreAtWicket} ({fow.player}, {fow.over} ov)
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <h5 className="font-bold mb-3 text-sm">Bowling</h5>
                            <div className="overflow-x-auto -mx-4 px-4">
                                <table className="w-full text-xs">
                                    <thead className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                        <tr>
                                            <th className="text-left py-2 px-2 font-semibold">Bowler</th>
                                            <th className="text-center py-2 px-1">O</th>
                                            <th className="text-center py-2 px-1">M</th>
                                            <th className="text-center py-2 px-1">R</th>
                                            <th className="text-center py-2 px-1">W</th>
                                            <th className="text-center py-2 px-1">Eco</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {innings.bowling.map((bowl, i) => (
                                            <tr key={i} className={`border-b ${borderColor}`}>
                                                <td className="py-2 px-2 font-semibold">{bowl.name}</td>
                                                <td className="text-center py-2 px-1">{bowl.overs}</td>
                                                <td className="text-center py-2 px-1">{bowl.maidens}</td>
                                                <td className="text-center py-2 px-1">{bowl.runs}</td>
                                                <td className="text-center py-2 px-1 font-semibold">{bowl.wickets}</td>
                                                <td className="text-center py-2 px-1">{bowl.economy}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="pb-20">
            <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Cricket Live Scores</h2>
                <p className={`text-xs sm:text-sm ${textSecondary}`}>Real-time scores from Cricbuzz</p>
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
                <button 
                    onClick={() => setAutoRefresh(!autoRefresh)} 
                    className={`px-3 py-2 rounded-lg transition-all duration-200 active:scale-95 flex items-center gap-2 text-sm ${autoRefresh ? 'bg-blue-500 text-white' : theme === 'dark' ? 'bg-gray-700 active:bg-gray-600' : 'bg-gray-100 active:bg-gray-200'}`}
                >
                    <Activity size={16} />
                    <span>Auto {autoRefresh ? 'ON' : 'OFF'}</span>
                </button>
                <button 
                    onClick={() => { checkBackendHealth(); fetchMatches(); }} 
                    disabled={loading} 
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg transition-all duration-200 active:scale-95 flex items-center gap-2 disabled:opacity-50 text-sm"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                </button>
            </div>

            <div className={`${cardBg} p-3 rounded-lg border ${backendStatus === 'online' ? 'border-green-500' : backendStatus === 'offline' ? 'border-red-500' : borderColor} mb-4 flex items-start gap-3`}>
                {backendStatus === 'online' ? <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={18} /> : <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />}
                <div className="flex-1">
                    <p className="font-semibold text-sm">{backendStatus === 'online' ? '✅ Backend Online' : backendStatus === 'offline' ? '❌ Backend Offline' : '⏳ Checking...'}</p>
                    <p className={`text-xs ${textSecondary} mt-0.5`}>
                        {backendStatus === 'offline' ? 'Start the backend to get live scores.' : `Auto-refresh: ${autoRefresh ? 'Every 30s' : 'Off'}`}
                    </p>
                </div>
            </div>

            <div className="mb-4 -mx-4 px-4">
                <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {filterOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setFilter(option.value)}
                            className={`px-4 py-2 rounded-lg transition-all duration-200 active:scale-95 text-sm whitespace-nowrap flex items-center gap-2 flex-shrink-0 ${filter === option.value ? 'bg-blue-500 text-white' : theme === 'dark' ? 'bg-gray-700 active:bg-gray-600' : 'bg-gray-100 active:bg-gray-200'}`}
                        >
                            
                            <span>{option.label}</span>
                            {filter === option.value && option.value === 'live' && (
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
            
            {loading && matches.length === 0 ? (
                <div className={`${cardBg} p-12 rounded-xl border ${borderColor} text-center`}>
                    <RefreshCw size={40} className="mx-auto mb-4 animate-spin text-blue-500" />
                    <p className={textSecondary}>Loading cricket scores...</p>
                </div>
            ) : matches.length === 0 ? (
                <div className={`${cardBg} p-12 rounded-xl border ${borderColor} text-center ${textSecondary}`}>
                    <span className="text-6xl mb-4 block">🏏</span>
                    <p className="text-lg mb-2">No {filter !== 'all' && filter !== 'live' ? filter : filter} matches found</p>
                    <p className="text-sm">Check back later or try a different filter.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {matches.map((match, index) => (
                        <div 
                            key={`${match.id}-${index}`} 
                            onClick={() => fetchMatchDetails(match)} 
                            className={`${cardBg} rounded-xl border ${borderColor} overflow-hidden transition-all duration-300 active:scale-[0.98] ${match.isLive ? 'ring-2 ring-blue-500/50' : ''}`}
                        >
                            <div className={`p-3 border-b ${borderColor} flex items-center justify-between`}>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-xs font-medium ${textSecondary}`}>{match.matchType}</span>
                                    {match.isLive && (
                                        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-blue-900/30 text-green-600 dark:text-green-400">
                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                                            LIVE
                                        </span>
                                    )}
                                </div>
                                <span className={`text-xs ${textSecondary}`}>{match.matchInfo || 'Live Cricket Match'}</span>
                            </div>

                            <div className="p-4">
                                {match.series && (
                                    <p className={`text-xs ${textSecondary} mb-2`}>{match.series}</p>
                                )}
                                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-2 flex-1">
                                        <img
                                        src={match.team1FlagUrl}
                                        alt={`${match.team1} flag`}
                                        className="h-6 w-auto inline-block align-middle mr-2"
                                        />
                                        <span className="font-semibold text-sm">{match.team1}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-semibold text-sm">{match.score1}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 flex-1">
                                        <img
                                        src={match.team2FlagUrl}
                                        alt={`${match.team2} flag`}
                                        className="h-6 w-auto inline-block align-middle mr-2"
                                        />
                                        <span className="font-semibold text-sm">{match.team2}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-semibold text-sm">{match.score2}</span>
                                    </div>
                                </div>
                                {match.status && (
                                    <div className={`p-2 rounded-lg text-center text-xs ${match.isLive ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                        {match.status}
                                    </div>
                                )}
                                {match.venue && (
                                    <p className={`text-xs ${textSecondary} mt-2`}><MapPin size={12} className="inline-block mr-1" /> {match.venue}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedMatch && (
                <>
                    <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setSelectedMatch(null)}
                        style={{
                            backdropFilter: 'blur(1px)',
                            WebkitBackdropFilter: 'blur(1px)',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)'
                        }}
                    />
                    
                    <div 
                        className="fixed inset-0 flex items-end sm:items-center justify-center z-50 pointer-events-none"
                        onClick={() => setSelectedMatch(null)}
                    >
                        <div 
                            className={`${cardBg} rounded-t-2xl sm:rounded-xl border ${borderColor} w-full sm:max-w-2xl sm:mx-4 flex flex-col pointer-events-auto`} 
                            style={{ maxHeight: '90vh' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={`p-4 border-b ${borderColor} flex-shrink-0`}>
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-base sm:text-lg font-bold leading-tight flex-1 pr-2">
                                        {modalData?.title || `${selectedMatch.team1} vs ${selectedMatch.team2}`}
                                    </h3>
                                    <button 
                                        onClick={() => setSelectedMatch(null)} 
                                        className="p-2 rounded-full active:bg-gray-100 dark:active:bg-gray-700 transition-colors flex-shrink-0"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowScorecard(false)}
                                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all active:scale-95 ${!showScorecard ? 'bg-blue-500 text-white' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                                    >
                                        Live View
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!scorecardData && !scorecardLoading) {
                                                fetchScorecard(selectedMatch);
                                            } else {
                                                setShowScorecard(true);
                                            }
                                        }}
                                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2 ${showScorecard ? 'bg-blue-500 text-white' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                                    >
                                        <Trophy size={16} />
                                        Full Scorecard
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                {showScorecard ? renderScorecard() : renderLiveView()}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CricketScoreboard;