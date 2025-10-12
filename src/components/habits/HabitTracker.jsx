import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Circle, TrendingUp } from 'lucide-react';

const HabitTracker = ({ theme, habits, setHabits, showToast }) => {
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', frequency: 'daily', category: 'health' });
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week

  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  const categories = ['health', 'productivity', 'learning', 'fitness', 'mindfulness', 'other'];

  const getWeekDates = (weekOffset = 0) => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay + (weekOffset * 7));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(selectedWeek);

  const addHabit = () => {
    if (!newHabit.name.trim()) {
      showToast('Habit name is required', 'error');
      return;
    }

    const habit = {
      id: Date.now(),
      ...newHabit,
      completions: {}, // { 'YYYY-MM-DD': true }
      createdAt: new Date().toISOString()
    };

    setHabits([habit, ...habits]);
    setNewHabit({ name: '', frequency: 'daily', category: 'health' });
    setShowAddHabit(false);
    showToast('Habit added successfully!');
  };

  const deleteHabit = (id) => {
    setHabits(habits.filter(h => h.id !== id));
    showToast('Habit deleted', 'info');
  };

  const toggleCompletion = (habitId, date) => {
    const dateStr = date.toISOString().split('T')[0];
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const completions = { ...habit.completions };
        if (completions[dateStr]) {
          delete completions[dateStr];
        } else {
          completions[dateStr] = true;
        }
        return { ...habit, completions };
      }
      return habit;
    }));
  };

  const isCompleted = (habit, date) => {
    const dateStr = date.toISOString().split('T')[0];
    return habit.completions[dateStr] === true;
  };

  const getStreak = (habit) => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (habit.completions[dateStr]) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  const getCompletionRate = (habit) => {
    const totalDays = Object.keys(habit.completions).length;
    const createdDate = new Date(habit.createdAt);
    const daysSinceCreation = Math.ceil((Date.now() - createdDate) / (1000 * 60 * 60 * 24));
    return totalDays > 0 ? Math.round((totalDays / Math.min(daysSinceCreation, 30)) * 100) : 0;
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Habit Tracker 🎯</h2>
        <button
          onClick={() => setShowAddHabit(!showAddHabit)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} />
          {showAddHabit ? 'Cancel' : 'Add Habit'}
        </button>
      </div>

      {showAddHabit && (
        <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mb-6`}>
          <h3 className="text-xl font-semibold mb-4">Create New Habit</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Habit name (e.g., Exercise, Read a book) *"
              value={newHabit.name}
              onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={newHabit.frequency}
                onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}
                className={`px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <select
                value={newHabit.category}
                onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
                className={`px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addHabit}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95"
              >
                Create Habit
              </button>
              <button
                onClick={() => setShowAddHabit(false)}
                className="px-4 py-3 bg-gray-500 text-white rounded-lg transition-all duration-200 hover:bg-gray-600 hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Week Navigation */}
      <div className={`${cardBg} p-4 rounded-xl border ${borderColor} mb-6 flex items-center justify-between`}>
        <button
          onClick={() => setSelectedWeek(selectedWeek - 1)}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          ← Previous Week
        </button>
        <span className="font-semibold">
          {selectedWeek === 0 ? 'This Week' : `${Math.abs(selectedWeek)} week${Math.abs(selectedWeek) > 1 ? 's' : ''} ${selectedWeek < 0 ? 'ago' : 'ahead'}`}
        </span>
        <button
          onClick={() => setSelectedWeek(selectedWeek + 1)}
          disabled={selectedWeek >= 0}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Week →
        </button>
      </div>

      {/* Habit Grid */}
      {habits.length === 0 ? (
        <div className={`${cardBg} p-8 rounded-xl border ${borderColor} text-center ${textSecondary}`}>
          <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
          <p>No habits yet. Start building better habits today!</p>
        </div>
      ) : (
        <div className={`${cardBg} rounded-xl border ${borderColor} overflow-hidden`}>
          {/* Header Row */}
          <div className="grid grid-cols-8 gap-2 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="font-semibold">Habit</div>
            {weekDates.map((date, idx) => (
              <div key={idx} className="text-center">
                <div className="font-semibold text-sm">{dayNames[date.getDay()]}</div>
                <div className={`text-xs ${textSecondary}`}>{date.getDate()}</div>
              </div>
            ))}
          </div>

          {/* Habit Rows */}
          {habits.map(habit => (
            <div key={habit.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
              <div className="grid grid-cols-8 gap-2 p-4 items-center">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{habit.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        {habit.category}
                      </span>
                      <span className="text-xs text-orange-500 font-semibold flex items-center gap-1">
                        🔥 {getStreak(habit)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {weekDates.map((date, idx) => {
                  const completed = isCompleted(habit, date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isFuture = date > new Date();

                  return (
                    <div key={idx} className="flex justify-center">
                      <button
                        onClick={() => !isFuture && toggleCompletion(habit.id, date)}
                        disabled={isFuture}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          isFuture ? 'opacity-30 cursor-not-allowed' :
                          isToday ? 'ring-2 ring-blue-500' : ''
                        } ${
                          completed 
                            ? 'bg-green-500 hover:bg-green-600 text-white' 
                            : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Habit Stats */}
              <div className={`px-4 pb-3 text-sm ${textSecondary} flex gap-4`}>
                <span>Streak: 🔥 {getStreak(habit)} days</span>
                <span>Completion Rate: {getCompletionRate(habit)}% (last 30 days)</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Overall Stats */}
      {habits.length > 0 && (
        <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mt-6`}>
          <h3 className="text-xl font-semibold mb-4">Your Progress 📊</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`text-sm ${textSecondary} mb-1`}>Total Habits</p>
              <p className="text-3xl font-bold text-blue-500">{habits.length}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'}`}>
              <p className={`text-sm ${textSecondary} mb-1`}>Completed Today</p>
              <p className="text-3xl font-bold text-green-500">
                {habits.filter(h => isCompleted(h, new Date())).length}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-orange-50'}`}>
              <p className={`text-sm ${textSecondary} mb-1`}>Longest Streak</p>
              <p className="text-3xl font-bold text-orange-500">
                {Math.max(...habits.map(h => getStreak(h)), 0)} 🔥
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <p className={`text-sm ${textSecondary} mb-1`}>This Week</p>
              <p className="text-3xl font-bold text-purple-500">
                {habits.reduce((acc, h) => acc + weekDates.filter(d => isCompleted(h, d)).length, 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitTracker;