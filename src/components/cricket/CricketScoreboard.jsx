import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, Activity, AlertCircle, CheckCircle, X } from 'lucide-react';

const CricketScoreboard = ({ theme, showToast }) => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [filter, setFilter] = useState('live');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [backendStatus, setBackendStatus] = useState('checking');

    const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
    const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

    const BACKEND_URL = 'https://backend-4z7z.onrender.com';

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
                const filteredMatches = filter === 'live' ? uniqueMatches.filter(m => m.isLive) : uniqueMatches;
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
        for (let [key, flag] of Object.entries(flags)) {
            if (teamName.toUpperCase().includes(key.toUpperCase())) return flag;
        }
        return '🏏';
    };
    
    // --- Render Functions for Modal ---
    const renderModalContent = () => {
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

        const StatItem = ({ label, value }) => (
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <p className={`text-xs ${textSecondary} mb-1`}>{label}</p>
                <p className="font-semibold text-sm">{value}</p>
            </div>
        );

        return (
            <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
                 <div className={`p-4 rounded-lg text-center mb-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <p className="font-bold text-lg">{modalData.current}</p>
                    <p className="text-sm text-blue-500 font-semibold mt-1">{modalData.update}</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     {/* Batting Card */}
                     <div className={`${cardBg} border ${borderColor} rounded-lg p-4`}>
                         <h4 className="font-bold mb-3">Batting</h4>
                         <div className="space-y-3">
                            {[
                                { name: modalData.batsman, r: modalData.batsmanrun, b: modalData.ballsfaced, '4s': modalData.fours, '6s': modalData.sixes, sr: modalData.sr },
                                { name: modalData.batsmantwo, r: modalData.batsmantworun, b: modalData.batsmantwoballsfaced, '4s': modalData.batsmantwofours, '6s': modalData.batsmantwosixes, sr: modalData.batsmantwosr }
                            ].map((p, i) => p.name !== 'Data Not Found' && (
                                <div key={i} className={`pb-3 ${i === 0 ? `border-b ${borderColor}` : ''}`}>
                                     <div className="flex justify-between items-center mb-1">
                                         <p className="font-semibold text-blue-500">{p.name}</p>
                                         <p className="font-bold text-lg">{p.r} <span className="text-sm font-normal text-gray-500">({p.b})</span></p>
                                     </div>
                                     <div className="flex justify-between text-xs text-gray-500">
                                         <span>4s: {p['4s']}</span>
                                         <span>6s: {p['6s']}</span>
                                         <span>SR: {p.sr}</span>
                                     </div>
                                </div>
                            ))}
                         </div>
                     </div>
                     {/* Bowling Card */}
                     <div className={`${cardBg} border ${borderColor} rounded-lg p-4`}>
                        <h4 className="font-bold mb-3">Bowling</h4>
                        <div className="space-y-3">
                             {[
                                { name: modalData.bowler, o: modalData.bowlerover, m: modalData.bowlermaiden, r: modalData.bowlerruns, w: modalData.bowlerwickets },
                                { name: modalData.bowlertwo, o: modalData.bowlertwoover, m: modalData.bowlertwomaiden, r: modalData.bowlertworuns, w: modalData.bowlertwowickets }
                             ].map((p, i) => p.name !== 'Data Not Found' && (
                                <div key={i} className={`pb-3 ${i === 0 ? `border-b ${borderColor}` : ''}`}>
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-blue-500">{p.name}</p>
                                        <p className="font-bold text-lg">{p.w} / {p.r}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">O: {p.o} | M: {p.m}</p>
                                </div>
                             ))}
                        </div>
                     </div>
                 </div>

                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                     <StatItem label="Partnership" value={modalData.partnership} />
                     <StatItem label="Run Rate" value={modalData.runrate} />
                 </div>
                 <StatItem label="Last Wicket" value={modalData.lastwicket} />
                 <StatItem label="Recent Balls" value={modalData.recentballs} />

                 {modalData.commentary !== 'Data Not Found' && (
                    <div className="mt-4">
                        <h4 className="font-bold mb-2">Commentary</h4>
                        <p className={`text-sm ${textSecondary} p-3 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg`}>
                            {modalData.commentary}
                        </p>
                    </div>
                 )}
            </div>
        );
    };


    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h2 className="text-3xl font-bold">Cricket Live Scores</h2>
                    <p className={`text-sm ${textSecondary} mt-1`}>Real-time scores from Cricbuzz</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setAutoRefresh(!autoRefresh)} className={`px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 ${autoRefresh ? 'bg-blue-500 text-white' : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                        <Activity size={18} />
                        <span className="text-sm">Auto {autoRefresh ? 'ON' : 'OFF'}</span>
                    </button>
                    <button onClick={() => { checkBackendHealth(); fetchMatches(); }} disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 flex items-center gap-2 disabled:opacity-50">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        <span className="text-sm">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Backend Status */}
            <div className={`${cardBg} p-4 rounded-xl border ${backendStatus === 'online' ? 'border-green-500' : backendStatus === 'offline' ? 'border-red-500' : borderColor} mb-6 flex items-start gap-3`}>
                {backendStatus === 'online' ? <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} /> : <AlertCircle className="text-red-500 flex-shrink-0 mt-1" size={20} />}
                <div className="flex-1">
                    <p className="font-semibold mb-1">{backendStatus === 'online' ? '✅ Backend Online' : backendStatus === 'offline' ? '❌ Backend Offline' : '⏳ Checking...'}</p>
                    {backendStatus === 'offline' ? (<p className={`text-sm ${textSecondary} mb-2`}>Start the backend to get live scores.</p>) : (<p className={`text-sm ${textSecondary}`}>Auto-refresh: {autoRefresh ? 'Every 30s' : 'Off'}</p>)}
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                <button onClick={() => setFilter('live')} className={`px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-sm ${filter === 'live' ? 'bg-blue-500 text-white' : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    <span className="flex items-center gap-2">{filter === 'live' && <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>}Live Matches</span>
                </button>
                <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-sm ${filter === 'all' ? 'bg-blue-500 text-white' : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>All Matches</button>
            </div>
            
            {/* Matches Grid */}
            {loading && matches.length === 0 ? (
                <div className={`${cardBg} p-12 rounded-xl border ${borderColor} text-center`}>
                    <RefreshCw size={40} className="mx-auto mb-4 animate-spin text-blue-500" />
                    <p className={textSecondary}>Loading cricket scores...</p>
                </div>
            ) : matches.length === 0 ? (
                <div className={`${cardBg} p-12 rounded-xl border ${borderColor} text-center ${textSecondary}`}>
                    <span className="text-6xl mb-4 block">🏏</span>
                    <p className="text-lg mb-2">No {filter} matches found</p>
                    <p className="text-sm">Check back later or try a different filter.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {matches.map((match, index) => (
                        <div key={`${match.id}-${index}`} onClick={() => fetchMatchDetails(match)} className={`${cardBg} rounded-xl border ${borderColor} overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer ${match.isLive ? 'ring-2 ring-blue-500/50' : ''}`}>
                            <div className={`p-3 border-b ${borderColor} flex items-center justify-between`}>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-medium ${textSecondary}`}>{match.matchType}</span>
                                    {match.isLive && (<span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>LIVE</span>)}
                                </div>
                                <span className={`text-xs ${textSecondary}`}>{match.matchInfo || 'Live Cricket Match'}</span>
                            </div>

                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-2 flex-1"><span className="text-2xl">{getTeamFlag(match.team1)}</span><span className="font-semibold">{match.team1}</span></div>
                                    <div className="text-right"><span className="font-semibold">{match.score1}</span></div>
                                </div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 flex-1"><span className="text-2xl">{getTeamFlag(match.team2)}</span><span className="font-semibold">{match.team2}</span></div>
                                    <div className="text-right"><span className="font-semibold">{match.score2}</span></div>
                                </div>
                                {match.status && (<div className={`p-2 rounded-lg text-center text-sm ${match.isLive ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>{match.status}</div>)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detailed Match Modal */}
            {selectedMatch && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedMatch(null)}>
                    <div className={`${cardBg} rounded-xl border ${borderColor} max-w-2xl w-full max-h-[90vh] flex flex-col`} onClick={(e) => e.stopPropagation()}>
                        <div className={`p-4 border-b ${borderColor} flex items-center justify-between flex-shrink-0`}>
                            <h3 className="text-lg font-bold leading-tight">{modalData?.title || `${selectedMatch.team1} vs ${selectedMatch.team2}`}</h3>
                            <button onClick={() => setSelectedMatch(null)} className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}><X size={20} /></button>
                        </div>
                        {renderModalContent()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CricketScoreboard;
