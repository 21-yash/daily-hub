import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Circle, TrendingUp, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { habitService } from '../../services/api';
import { authService } from '../../services/authService';
import { syncQueue } from '../../services/syncQueue';

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

    const tempId = `temp_${Date.now()}`;
    const habit = {
      title: newHabit.name,  
      frequency: newHabit.frequency,
      category: newHabit.category,
      completions: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const optimisticHabit = { ...habit, id: tempId };
    setHabits([optimisticHabit, ...habits]);
    
    setNewHabit({ name: '', frequency: 'daily', category: 'health' });
    setShowAddHabit(false);
    showToast('Habit added successfully!');

    if (authService.isAuthenticated()) {
      syncQueue.add('habit', 'create', habit, tempId);
    }
  };

  const deleteHabit = (id) => {
    setHabits(habits.filter(h => h.id !== id));
    showToast('Habit deleted', 'info');
    
    if (authService.isAuthenticated() && !id.toString().startsWith('temp_')) {
      syncQueue.add('habit', 'delete', { id }, id);
    }
  };

  const toggleCompletion = (habitId, date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const updatedHabit = habits.find(h => h.id === habitId);
    if (!updatedHabit) return;
    
    const completions = { ...updatedHabit.completions };
    if (completions[dateStr]) {
      delete completions[dateStr];
    } else {
      completions[dateStr] = true;
    }
    
    const newHabit = { 
      ...updatedHabit, 
      completions,
      updatedAt: new Date().toISOString()
    };
    
    setHabits(habits.map(habit => 
      habit.id === habitId ? newHabit : habit
    ));
    
    if (authService.isAuthenticated()) {
      syncQueue.add('habit', 'update', newHabit, habitId);
    }
  };

  const isCompleted = (habit, date) => {
    if (!habit.completions) return false;
    const dateStr = date.toISOString().split('T')[0];
    return habit.completions[dateStr] === true;
  };

  const getStreak = (habit) => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!habit.completions) return 0;
    
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
    if (!habit.completions) return 0;

    const totalDays = Object.keys(habit.completions).length;
    const createdDate = new Date(habit.createdAt);
    const daysSinceCreation = Math.ceil((Date.now() - createdDate) / (1000 * 60 * 60 * 24));
    return totalDays > 0 ? Math.round((totalDays / Math.min(daysSinceCreation, 30)) * 100) : 0;
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">🎯 Habit Tracker</h2>
        <button
          onClick={() => setShowAddHabit(!showAddHabit)}
          className="p-2 bg-blue-500 text-white rounded-full transition-all duration-200 hover:bg-blue-600 active:scale-95"
        >
          {showAddHabit ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showAddHabit && (
        <div className={`${cardBg} p-4 rounded-2xl border ${borderColor}`}>
          <h3 className="text-lg font-semibold mb-3">Create New Habit</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Habit name (e.g., Exercise) *"
              value={newHabit.name}
              onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl ${cardBg} border ${borderColor}`}
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newHabit.frequency}
                onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}
                className={`px-3 py-2 rounded-xl ${cardBg} border ${borderColor} text-sm`}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <select
                value={newHabit.category}
                onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
                className={`px-3 py-2 rounded-xl ${cardBg} border ${borderColor} text-sm`}
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
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl transition-all duration-200 hover:bg-blue-600 active:scale-95 text-sm font-medium"
              >
                Create Habit
              </button>
              <button
                onClick={() => setShowAddHabit(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-xl transition-all duration-200 hover:bg-gray-600 active:scale-95 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Week Navigation - Compact */}
      <div className={`${cardBg} p-3 rounded-2xl border ${borderColor} flex items-center justify-between`}>
        <button
          onClick={() => setSelectedWeek(selectedWeek - 1)}
          className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 active:scale-95"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold">
          {selectedWeek === 0 ? 'This Week' : `${Math.abs(selectedWeek)} week${Math.abs(selectedWeek) > 1 ? 's' : ''} ${selectedWeek < 0 ? 'ago' : 'ahead'}`}
        </span>
        <button
          onClick={() => setSelectedWeek(selectedWeek + 1)}
          disabled={selectedWeek >= 0}
          className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Habit Grid - Optimized for Mobile */}
      {habits.length === 0 ? (
        <div className={`${cardBg} p-8 rounded-2xl border ${borderColor} text-center ${textSecondary}`}>
          <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-sm">No habits yet. Start building better habits today!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map(habit => (
            <div key={habit.id} className={`${cardBg} rounded-2xl border ${borderColor} overflow-hidden`}>
              {/* Habit Header */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${'text-gray-800'}`}>{habit.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        {habit.category}
                      </span>
                      <span className="text-xs text-orange-500 font-semibold">
                        🔥 {getStreak(habit)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg active:scale-95"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Day Grid - Compact */}
              <div className="p-3">
                <div className="grid grid-cols-7 gap-2">
                  {weekDates.map((date, idx) => {
                    const completed = isCompleted(habit, date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isFuture = date > new Date();

                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div className={`text-xs font-medium mb-1 ${textSecondary}`}>
                          {dayNames[date.getDay()]}
                        </div>
                        <div className={`text-xs mb-1 ${textSecondary}`}>
                          {date.getDate()}
                        </div>
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
                          } active:scale-95`}
                        >
                          {completed ? <CheckCircle size={16} /> : <Circle size={16} />}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Habit Stats - Compact */}
                <div className={`mt-3 pt-3 border-t ${borderColor} text-xs ${textSecondary} flex justify-between`}>
                  <span>Streak: 🔥 {getStreak(habit)}</span>
                  <span>Rate: {getCompletionRate(habit)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Overall Stats - Compact Grid */}
      {habits.length > 0 && (
        <div className={`${cardBg} p-4 rounded-2xl border ${borderColor}`}>
          <h3 className="text-lg font-semibold mb-3">Your Progress 📊</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`text-xs ${textSecondary} mb-1`}>Total Habits</p>
              <p className="text-2xl font-bold text-blue-500">{habits.length}</p>
            </div>
            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'}`}>
              <p className={`text-xs ${textSecondary} mb-1`}>Today</p>
              <p className="text-2xl font-bold text-green-500">
                {habits.filter(h => isCompleted(h, new Date())).length}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-orange-50'}`}>
              <p className={`text-xs ${textSecondary} mb-1`}>Best Streak</p>
              <p className="text-2xl font-bold text-orange-500">
                {Math.max(...habits.map(h => getStreak(h)), 0)} 🔥
              </p>
            </div>
            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <p className={`text-xs ${textSecondary} mb-1`}>This Week</p>
              <p className="text-2xl font-bold text-purple-500">
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