import React, { useState, useEffect } from "react";
import {
  Plus,
  Play,
  Pause,
  CheckCircle,
  Trash2,
  Edit2,
  Calendar,
  Search,
  X,
} from "lucide-react";
import { watchlistService } from '../../services/api';
import { authService } from '../../services/authService';
import { syncQueue } from '../../services/syncQueue';

const OMDB_API_KEY = "e7ac27b7";

const Watchlist = ({ theme, showToast }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [currentItem, setCurrentItem] = useState({
    title: "",
    type: "movie",
    status: "plan-to-watch",
    startDate: "",
    endDate: "",
    rating: 0,
    notes: "",
    genre: "",
    image: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [watchlistSearch, setWatchlistSearch] = useState("");

  const cardBg = theme === "dark" ? "bg-gray-800" : "bg-white";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const textSecondary = theme === "dark" ? "text-gray-400" : "text-gray-600";

  // Load watchlist
  useEffect(() => {
    const loadWatchlist = async () => {
      
      if (authService.isAuthenticated()) {
        if (navigator.onLine) {
          try {
            const res = await watchlistService.getAll();
            
            // Map _id to id for consistency
            const items = (res.data || []).map(item => {
              return {
                ...item,
                id: item._id || item.id
              };
            });
            
            setWatchlist(items);
          } catch (error) {
            console.error("❌ [WATCHLIST] Failed to fetch watchlist", error);
          }
        }
      } else {
        const saved = localStorage.getItem("watchlist");
        console.log('💾 [WATCHLIST] Loading from localStorage:', saved);
        
        if (saved) {
          try {
            const items = JSON.parse(saved);
            setWatchlist(items);
          } catch (e) {
            console.error("❌ [WATCHLIST] Failed to parse localStorage", e);
          }
        }
      }
      setIsInitialized(true);
    };
    loadWatchlist();
  }, []);

  useEffect(() => {
    const handleSyncComplete = (e) => {
      const { results } = e.detail;
      
      // Replace temp IDs with real MongoDB IDs
      results.forEach(result => {
        if (result.tempId && result.data?._id && result.type === 'watchlist') {
          const realId = result.data._id;
          
          setWatchlist(prev => prev.map(item => {
            if (item.id === result.tempId) {
              const merged = {
                ...item,           
                ...result.data,    
                id: realId,       
                _id: realId      
              };
              return merged;
            }
            return item;
          }));
        }
      });
    };
    
    window.addEventListener('syncComplete', handleSyncComplete);
    return () => window.removeEventListener('syncComplete', handleSyncComplete);
  }, []);

  const searchOMDb = async () => {
    if (!searchQuery.trim()) return;
    if (OMDB_API_KEY === "YOUR_OMDB_API_KEY_HERE") {
      setError("Please enter your OMDb API Key in the code.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(searchQuery)}`,
      );
      const data = await response.json();

      if (data.Response === "True") {
        setSearchResults(data.Search);
      } else {
        setError(data.Error || "No results found.");
        setSearchResults([]);
      }
    } catch (err) {
      setError("Failed to fetch data. Please check your connection.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addItemFromOMDb = async (omdbItem) => {
  
    const typeMap = {
      series: "tv-show",
      movie: "movie",
      game: "other",
      episode: "tv-show",
    };

    const tempId = `temp_${Date.now()}`;
    const newItem = {
      title: omdbItem.Title,
      type: typeMap[omdbItem.Type] || "other",
      year: omdbItem.Year,
      image: omdbItem.Poster !== "N/A" ? omdbItem.Poster : "",
      imdbId: omdbItem.imdbID,
      status: "plan-to-watch",
      startDate: "",
      endDate: "",
      rating: 0,
      notes: "",
      genre: omdbItem.Genre || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Check for duplicates
    if (watchlist.some((item) => item.imdbId === newItem.imdbId)) {
        showToast(`${newItem.title} is already in your watchlist!`, 'warning');
      return;
    }

    const optimisticItem = { ...newItem, id: tempId };
    
    setWatchlist([optimisticItem, ...watchlist]);
    resetForm();

    if (authService.isAuthenticated()) {
      syncQueue.add('watchlist', 'create', newItem, tempId);
    } else {
      console.log('⚠️ [WATCHLIST] Not authenticated, skipping sync');
    }
  };

  const addOrUpdateItem = async () => {
    if (!currentItem.title.trim()) return;

    if (editingItem) {
      const updatedItem = { 
        ...editingItem, 
        ...currentItem, 
        updatedAt: new Date().toISOString() 
      };
      
      setWatchlist(
        watchlist.map((item) =>
          item.id === editingItem.id ? updatedItem : item,
        ),
      );
      
      if (authService.isAuthenticated()) {
        syncQueue.add('watchlist', 'update', updatedItem, editingItem.id);
      }
    }

    resetForm();
  };

  const resetForm = () => {
    setCurrentItem({
      title: "",
      type: "movie",
      status: "plan-to-watch",
      startDate: "",
      endDate: "",
      rating: 0,
      notes: "",
      genre: "",
      image: "",
    });
    setShowAddItem(false);
    setShowEditModal(false);
    setEditingItem(null);
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
  };

  const editItem = (item) => {
    const itemToEdit = {
      ...{
        title: "",
        type: "movie",
        status: "plan-to-watch",
        startDate: "",
        endDate: "",
        rating: 0.0,
        notes: "",
        genre: "",
        image: "",
      },
      ...item,
    };
    setCurrentItem(itemToEdit);
    setEditingItem(item);
    setShowEditModal(true); // Show modal instead of inline form
  };

  const deleteItem = async (id) => {
    setWatchlist(watchlist.filter((item) => item.id !== id));
    
    if (authService.isAuthenticated() && !id.startsWith('temp_')) {
      syncQueue.add('watchlist', 'delete', { id }, id);
    }
  };

  const updateStatus = async (id, newStatus) => {
    const item = watchlist.find(i => i.id === id);
    if (!item) return;

    const updates = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    
    if (newStatus === "watching" && !item.startDate) {
      updates.startDate = new Date().toISOString().split("T")[0];
    }
    if (newStatus === "completed" && !item.endDate) {
      updates.endDate = new Date().toISOString().split("T")[0];
    }
    
    const updatedItem = { ...item, ...updates };
    
    setWatchlist(
      watchlist.map((item) => {
        if (item.id === id) {
          return updatedItem;
        }
        return item;
      }),
    );
    
    if (authService.isAuthenticated()) {
      syncQueue.add('watchlist', 'update', updatedItem, id);
    }
  };

  const filteredItems = watchlist.filter((item) => {
    const matchesStatus =
      filterStatus === "all" || item.status === filterStatus;
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesSearch = 
      watchlistSearch === "" || 
      item.title.toLowerCase().includes(watchlistSearch.toLowerCase()) ||
      (item.genre && item.genre.toLowerCase().includes(watchlistSearch.toLowerCase()));
    return matchesStatus && matchesType && matchesSearch;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "watching":
        return <Play size={16} className="text-blue-500" />;
      case "completed":
        return <CheckCircle size={16} className="text-green-500" />;
      case "on-hold":
        return <Pause size={16} className="text-orange-500" />;
      default:
        return <Calendar size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "watching":
        return "bg-blue-500/20 text-blue-500";
      case "completed":
        return "bg-green-500/20 text-green-500";
      case "on-hold":
        return "bg-orange-500/20 text-orange-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🎬 Watchlist <span className="text-sm text-gray-500">({watchlist.length} items)</span>
        </h2>
        <button
          onClick={() => {
            setShowAddItem(!showAddItem);
            if (showAddItem) resetForm();
          }}
          className="p-2 bg-blue-500 text-white rounded-full transition-all duration-200 hover:bg-blue-600 active:scale-95"
        >
          {showAddItem ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showAddItem && (
        <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mb-6`}>
          {/* Only show OMDb search, edit is now in modal */}
          <h3 className="text-xl font-semibold mb-4">
            Search OMDb for a Movie or TV Show
          </h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="e.g., Game of Thrones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchOMDb()}
              className={`flex-1 px-4 py-2 rounded-lg ${cardBg} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <button
              onClick={searchOMDb}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Search size={18} />
            </button>
          </div>

          {isLoading && <p className={textSecondary}>Searching...</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
            {searchResults.map((result) => (
              <div
                key={result.imdbID}
                onClick={() => addItemFromOMDb(result)}
                className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} p-2 rounded-lg flex items-center gap-4 cursor-pointer hover:bg-blue-500/20`}
              >
                <img
                  src={
                    result.Poster !== "N/A"
                      ? result.Poster
                      : "https://placehold.co/50x75/0f172a/FFF?text=?"
                  }
                  alt={result.Title}
                  className="w-12 h-[72px] object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold">{result.Title}</p>
                  <p className={`${textSecondary} text-sm capitalize`}>
                    {result.Type} ({result.Year})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            className={`${cardBg} rounded-2xl border ${borderColor} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-inherit p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                Edit "{editingItem.title}"
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Title *"
                  value={currentItem.title}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, title: e.target.value })
                  }
                  className={`px-4 py-2 rounded-lg ${cardBg} border ${borderColor}`}
                />
                <select
                  value={currentItem.type}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, type: e.target.value })
                  }
                  className={`px-4 py-2 rounded-lg ${cardBg} border ${borderColor}`}
                >
                  <option value="movie">Movie</option>
                  <option value="tv-show">TV Show</option>
                  <option value="anime">Anime</option>
                  <option value="documentary">Documentary</option>
                </select>
                <select
                  value={currentItem.status}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, status: e.target.value })
                  }
                  className={`px-4 py-2 rounded-lg ${cardBg} border ${borderColor}`}
                >
                  <option value="plan-to-watch">Plan to Watch</option>
                  <option value="watching">Watching</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
                <input
                  type="text"
                  placeholder="Genre"
                  value={currentItem.genre}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, genre: e.target.value })
                  }
                  className={`px-4 py-2 rounded-lg ${cardBg} border ${borderColor}`}
                />
                <div>
                  <label className={`block text-sm ${textSecondary} mb-1`}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={currentItem.startDate}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        startDate: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 rounded-lg ${cardBg} border ${borderColor}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm ${textSecondary} mb-1`}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={currentItem.endDate}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        endDate: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 rounded-lg ${cardBg} border ${borderColor}`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm ${textSecondary} mb-1`}>
                    Rating: {currentItem.rating}/10
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={currentItem.rating}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          rating: parseFloat(e.target.value),
                        })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                <textarea
                  placeholder="Notes"
                  value={currentItem.notes}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, notes: e.target.value })
                  }
                  rows="3"
                  className={`md:col-span-2 px-4 py-2 rounded-lg ${cardBg} border ${borderColor}`}
                />
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    addOrUpdateItem();
                    setShowEditModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                >
                  Update Item
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SEARCH AND FILTER --- */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search watchlist..."
          value={watchlistSearch}
          onChange={(e) => setWatchlistSearch(e.target.value)}
          className={`flex-1 px-4 py-2 rounded-lg ${cardBg} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`px-4 py-2 rounded-lg ${cardBg} border ${borderColor}`}
        >
          <option value="all">All Status</option>
          <option value="plan-to-watch">Plan to Watch</option>
          <option value="watching">Watching</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={`px-4 py-2 rounded-lg ${cardBg} border ${borderColor}`}
        >
          <option value="all">All Types</option>
          <option value="movie">Movie</option>
          <option value="tv-show">TV Show</option>
          <option value="anime">Anime</option>
          <option value="documentary">Documentary</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`${cardBg} p-4 rounded-xl border ${borderColor} flex flex-col`}
          >
            <div className="flex items-start gap-4 mb-3">
              <img
                src={
                  item.image
                    ? item.image
                    : "https://placehold.co/100x150/0f172a/FFF?text=?"
                }
                alt={item.title}
                className="w-24 h-36 object-cover rounded-md shadow-md"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h4 className="text-lg font-semibold flex-1">
                    {item.title} {item.year && `(${item.year})`}
                  </h4>
                  <div className="flex gap-1">
                    <button
                      onClick={() => editItem(item)}
                      className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-1 rounded ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
                  >
                    {item.type}
                  </span>
                  {item.genre && (
                    <span
                      className={`text-xs px-2 py-1 rounded ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
                    >
                    {item.genre}
                    </span>
                  )}
                </div>
                {item.rating > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    {" "}
                    <span className="text-yellow-500">⭐</span>{" "}
                    <span className={textSecondary}>
                      Rating: {item.rating.toFixed(1)}/10
                    </span>{" "}
                  </div>
                )}
              </div>
            </div>
            <div
              className={`flex items-center gap-2 mb-3 px-2 py-1 rounded ${getStatusColor(item.status)}`}
            >
              {" "}
              {getStatusIcon(item.status)}{" "}
              <span className="text-sm font-medium capitalize">
                {item.status.replace("-", " ")}
              </span>{" "}
            </div>
            <div className="flex-grow space-y-2 text-sm">
              {" "}
              {item.startDate && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} className={textSecondary} />
                  <span className={textSecondary}>
                    Started: {new Date(item.startDate).toLocaleDateString()}
                  </span>
                </div>
              )}{" "}
              {item.endDate && (
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className={textSecondary} />
                  <span className={textSecondary}>
                    Finished: {new Date(item.endDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            {item.notes && (
              <p
                className={`text-sm ${textSecondary} mt-3 p-2 rounded ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} line-clamp-2`}
              >
                {item.notes}
              </p>
            )}
            <div className="flex gap-2 mt-3">
              {" "}
              {item.status !== "watching" && (
                <button
                  onClick={() => updateStatus(item.id, "watching")}
                  className="flex-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <Play size={14} className="inline mr-1" /> Watch
                </button>
              )}{" "}
              {item.status === "watching" && (
                <button
                  onClick={() => updateStatus(item.id, "completed")}
                  className="flex-1 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <CheckCircle size={14} className="inline mr-1" /> Complete
                </button>
              )}{" "}
              {item.status !== "on-hold" && item.status !== "completed" && (
                <button
                  onClick={() => updateStatus(item.id, "on-hold")}
                  className="flex-1 px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  <Pause size={14} className="inline mr-1" /> Hold
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div
            className={`${cardBg} p-8 rounded-xl border ${borderColor} text-center ${textSecondary} col-span-full`}
          >
            🎬 No items in watchlist. Add your first one!
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;