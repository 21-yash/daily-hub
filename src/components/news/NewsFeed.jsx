import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, RefreshCw, Filter, Loader } from 'lucide-react';

const NewsFeed = ({ theme, showToast }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('general');
  const [country, setCountry] = useState('us');

  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  const categories = [
    { id: 'general', name: 'General', icon: '📰' },
    { id: 'technology', name: 'Technology', icon: '💻' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'health', name: 'Health', icon: '⚕️' },
    { id: 'science', name: 'Science', icon: '🔬' },
    { id: 'sports', name: 'Sports', icon: '⚽' }
  ];

  const countries = [
    { code: 'us', name: 'United States', flag: '🇺🇸' },
    { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'ca', name: 'Canada', flag: '🇨🇦' },
    { code: 'au', name: 'Australia', flag: '🇦🇺' },
    { code: 'in', name: 'India', flag: '🇮🇳' }
  ];

  useEffect(() => {
    fetchNews();
  }, [category, country]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const API_KEY = import.meta.env.VITE_NEWS_KEY || '124267d595acf126a308d88c6aab4021'; 
      
      const apiUrl = `https://gnews.io/api/v4/top-headlines?country=${country}&topic=${category}&lang=en&token=${API_KEY}`;
    
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch news through proxy');
      }
      
      const wrappedData = await response.json();
      const data = JSON.parse(wrappedData.contents); 
      if (data.errors) {
          throw new Error(data.errors[0]);
      }

      setNews(data.articles || []);
      showToast('News updated!', 'success');
    } catch (error) {
      console.error('Error fetching news:', error);
      
      // Fallback to mock data for demo
      setNews([
        {
          title: "Breaking: Major Tech Announcement Expected This Week",
          description: "Industry insiders suggest a major announcement from leading tech companies...",
          url: "https://example.com/news1",
          urlToImage: "https://via.placeholder.com/400x200/3B82F6/FFFFFF?text=Tech+News",
          publishedAt: new Date().toISOString(),
          source: { name: "Tech Daily" }
        },
        {
          title: "Global Markets Show Strong Growth",
          description: "Stock markets around the world are experiencing positive momentum...",
          url: "https://example.com/news2",
          urlToImage: "https://via.placeholder.com/400x200/10B981/FFFFFF?text=Business+News",
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          source: { name: "Financial Times" }
        },
        {
          title: "New Scientific Discovery Could Change Everything",
          description: "Researchers have made a groundbreaking discovery that may revolutionize...",
          url: "https://example.com/news3",
          urlToImage: "https://via.placeholder.com/400x200/8B5CF6/FFFFFF?text=Science+News",
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          source: { name: "Science Journal" }
        }
      ]);
      showToast('Using demo news data. Add your NewsAPI key for live news.', 'info');
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const published = new Date(dateString);
    const diffMs = now - published;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">News Feed 📰</h2>
        <button
          onClick={fetchNews}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mb-6`}>
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} />
          <h3 className="text-xl font-semibold">Filters</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Category</label>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                    category === cat.id
                      ? 'bg-blue-500 text-white'
                      : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Country</label>
            <div className="flex gap-2 flex-wrap">
              {countries.map(c => (
                <button
                  key={c.code}
                  onClick={() => setCountry(c.code)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                    country === c.code
                      ? 'bg-blue-500 text-white'
                      : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{c.flag}</span>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* News Grid */}
      {loading ? (
        <div className={`${cardBg} p-12 rounded-xl border ${borderColor} text-center`}>
          <Loader size={48} className="mx-auto mb-4 animate-spin text-blue-500" />
          <p className={textSecondary}>Loading news...</p>
        </div>
      ) : news.length === 0 ? (
        <div className={`${cardBg} p-12 rounded-xl border ${borderColor} text-center ${textSecondary}`}>
          <Newspaper size={48} className="mx-auto mb-4 opacity-50" />
          <p>No news available. Try changing filters or refresh.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.slice(0, 12).map((article, index) => (
            <div
              key={index}
              className={`${cardBg} rounded-xl border ${borderColor} overflow-hidden transition-all duration-200 hover:shadow-xl hover:scale-105`}
            >
              {article.image && (
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/400x200/${
                      theme === 'dark' ? '1F2937' : 'E5E7EB'
                    }/FFFFFF?text=No+Image`;
                  }}
                />
              )}
              
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                    {article.source.name}
                  </span>
                  <span className={`text-xs ${textSecondary}`}>
                    {getTimeAgo(article.publishedAt)}
                  </span>
                </div>

                <h3 className="font-bold text-lg mb-2 line-clamp-2">
                  {article.title}
                </h3>

                <p className={`${textSecondary} text-sm mb-4 line-clamp-3`}>
                  {article.description || 'No description available.'}
                </p>

                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium"
                >
                  Read more
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsFeed;