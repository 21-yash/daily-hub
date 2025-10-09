import React, { useState } from 'react';
import { ExternalLink, Plus, Trash2, Edit2, Star } from 'lucide-react';

const QuickLinks = ({ theme, links, setLinks }) => {
  // Initialize with default links if empty
  React.useEffect(() => {
    if (links.length === 0) {
      setLinks([
        { id: 1, title: 'Google', url: 'https://www.google.com', category: 'Search', favorite: true },
        { id: 2, title: 'GitHub', url: 'https://github.com', category: 'Development', favorite: true },
        { id: 3, title: 'Stack Overflow', url: 'https://stackoverflow.com', category: 'Development', favorite: false },
        { id: 4, title: 'YouTube', url: 'https://www.youtube.com', category: 'Social', favorite: true },
        { id: 5, title: 'Gmail', url: 'https://mail.google.com', category: 'Productivity', favorite: true },
        { id: 6, title: 'LinkedIn', url: 'https://www.linkedin.com', category: 'Social', favorite: false },
        { id: 7, title: 'Twitter', url: 'https://twitter.com', category: 'Social', favorite: false },
        { id: 8, title: 'Replit', url: 'https://replit.com', category: 'Development', favorite: true },
        { id: 9, title: 'MDN Web Docs', url: 'https://developer.mozilla.org', category: 'Development', favorite: false },
        { id: 10, title: 'ChatGPT', url: 'https://chat.openai.com', category: 'AI', favorite: true },
        { id: 11, title: 'Netflix', url: 'https://www.netflix.com', category: 'Entertainment', favorite: false },
        { id: 12, title: 'Amazon', url: 'https://www.amazon.in', category: 'Shopping', favorite: false },
        { id: 13, title: 'Flipkart', url: 'https://www.flipkart.com', category: 'Shopping', favorite: false },
        { id: 14, title: 'WhatsApp Web', url: 'https://web.whatsapp.com', category: 'Social', favorite: true },
      ]);
    }
  }, []);
  
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '', category: 'General' });
  const [editingLink, setEditingLink] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ['General', 'Development', 'Social', 'Productivity', 'Entertainment', 'Shopping', 'AI'];

  const addLink = () => {
    if (!newLink.title || !newLink.url) {
      alert('Title and URL are required');
      return;
    }
    
    if (editingLink) {
      setLinks(links.map(link => 
        link.id === editingLink.id 
          ? { ...newLink, id: editingLink.id, favorite: editingLink.favorite }
          : link
      ));
      setEditingLink(null);
    } else {
      const link = {
        id: Date.now(),
        ...newLink,
        favorite: false
      };
      setLinks([link, ...links]);
    }
    
    setNewLink({ title: '', url: '', category: 'General' });
    setShowAddLink(false);
  };

  const deleteLink = (id) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const toggleFavorite = (id) => {
    setLinks(links.map(link => 
      link.id === id ? { ...link, favorite: !link.favorite } : link
    ));
  };

  const editLink = (link) => {
    setNewLink({ title: link.title, url: link.url, category: link.category });
    setEditingLink(link);
    setShowAddLink(true);
  };

  const filteredLinks = links.filter(link => 
    categoryFilter === 'all' || link.category === categoryFilter
  );

  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Quick Links</h2>
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg ${cardBg} border ${borderColor}`}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setShowAddLink(!showAddLink);
              if (showAddLink) {
                setNewLink({ title: '', url: '', category: 'General' });
                setEditingLink(null);
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Plus size={20} />
            {showAddLink ? 'Cancel' : 'Add Link'}
          </button>
        </div>
      </div>

      {showAddLink && (
        <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mb-6`}>
          <h3 className="text-xl font-semibold mb-4">{editingLink ? 'Edit Link' : 'Add New Link'}</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Title *"
              value={newLink.title}
              onChange={(e) => setNewLink({...newLink, title: e.target.value})}
              className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
            />
            <input
              type="url"
              placeholder="URL * (https://example.com)"
              value={newLink.url}
              onChange={(e) => setNewLink({...newLink, url: e.target.value})}
              className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
            />
            <select
              value={newLink.category}
              onChange={(e) => setNewLink({...newLink, category: e.target.value})}
              className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={addLink}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95"
              >
                {editingLink ? 'Update Link' : 'Save Link'}
              </button>
              <button
                onClick={() => {
                  setShowAddLink(false);
                  setNewLink({ title: '', url: '', category: 'General' });
                  setEditingLink(null);
                }}
                className="px-4 py-3 bg-gray-500 text-white rounded-lg transition-all duration-200 hover:bg-gray-600 hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredLinks.map(link => (
          <div key={link.id} className={`${cardBg} p-4 rounded-xl border ${borderColor} transition-all duration-200 hover:shadow-lg hover:scale-105 relative group`}>
            <button
              onClick={() => toggleFavorite(link.id)}
              className={`absolute top-2 right-2 p-1 rounded transition-all duration-200 ${
                link.favorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
              }`}
            >
              <Star size={20} fill={link.favorite ? 'currentColor' : 'none'} />
            </button>
            
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block mb-3"
            >
              <h4 className="text-lg font-semibold mb-1 pr-8">{link.title}</h4>
              <p className={`text-sm ${textSecondary} flex items-center gap-1 truncate`}>
                <ExternalLink size={14} />
                {link.url}
              </p>
            </a>
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                {link.category}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => editLink(link)}
                  className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => deleteLink(link.id)}
                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredLinks.length === 0 && (
          <div className={`${cardBg} p-8 rounded-xl border ${borderColor} text-center ${textSecondary} col-span-full`}>
            <ExternalLink size={48} className="mx-auto mb-4 opacity-50" />
            <p>No links found. Add your first quick link!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickLinks;
