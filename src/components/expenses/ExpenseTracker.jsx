import React, { useState } from "react";
import {
  Plus,
  Trash2,
  IndianRupee, // Changed from DollarSign
  TrendingDown,
  Calendar,
  PieChart,
} from "lucide-react";

const ExpenseTracker = ({ theme, expenses, setExpenses, showToast }) => {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    category: "food",
    date: new Date().toISOString().split("T")[0],
  });
  const [filterPeriod, setFilterPeriod] = useState("month"); // week, month, year, all
  const [categoryFilter, setCategoryFilter] = useState("all");

  const cardBg = theme === "dark" ? "bg-gray-800" : "bg-white";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const textSecondary = theme === "dark" ? "text-gray-400" : "text-gray-600";

  const categories = [
    { name: "food", icon: "🍔", color: "bg-orange-500" },
    { name: "transport", icon: "🚗", color: "bg-blue-500" },
    { name: "shopping", icon: "🛍️", color: "bg-pink-500" },
    { name: "entertainment", icon: "🎬", color: "bg-purple-500" },
    { name: "bills", icon: "📄", color: "bg-red-500" },
    { name: "health", icon: "⚕️", color: "bg-green-500" },
    { name: "education", icon: "📚", color: "bg-indigo-500" },
    { name: "other", icon: "💰", color: "bg-gray-500" },
  ];

  const addExpense = () => {
    if (!newExpense.title.trim() || !newExpense.amount) {
      showToast("Title and amount are required", "error");
      return;
    }

    const expense = {
      id: Date.now(),
      ...newExpense,
      amount: parseFloat(newExpense.amount),
      createdAt: new Date().toISOString(),
    };

    setExpenses([expense, ...expenses]);
    setNewExpense({
      title: "",
      amount: "",
      category: "food",
      date: new Date().toISOString().split("T")[0],
    });
    setShowAddExpense(false);
    showToast("Expense added successfully!");
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter((e) => e.id !== id));
    showToast("Expense deleted", "info");
  };

  const getFilteredExpenses = () => {
    const now = new Date();
    let filtered = expenses;

    // Filter by period
    if (filterPeriod !== "all") {
      filtered = filtered.filter((expense) => {
        const expenseDate = new Date(expense.date);
        const daysDiff = (now - expenseDate) / (1000 * 60 * 60 * 24);

        if (filterPeriod === "week") return daysDiff <= 7;
        if (filterPeriod === "month") return daysDiff <= 30;
        if (filterPeriod === "year") return daysDiff <= 365;
        return true;
      });
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((e) => e.category === categoryFilter);
    }

    return filtered;
  };

  const filteredExpenses = getFilteredExpenses();

  const getCategoryTotals = () => {
    const totals = {};
    filteredExpenses.forEach((expense) => {
      totals[expense.category] =
        (totals[expense.category] || 0) + expense.amount;
    });
    return totals;
  };

  const categoryTotals = getCategoryTotals();
  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const getCategoryPercentage = (category) => {
    return totalExpense > 0
      ? (((categoryTotals[category] || 0) / totalExpense) * 100).toFixed(1)
      : 0;
  };

  const getCategoryColor = (categoryName) => {
    return (
      categories.find((c) => c.name === categoryName)?.color || "bg-gray-500"
    );
  };

  const getCategoryIcon = (categoryName) => {
    return categories.find((c) => c.name === categoryName)?.icon || "💰";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Expense Tracker 💰</h2>
        <button
          onClick={() => setShowAddExpense(!showAddExpense)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} />
          {showAddExpense ? "Cancel" : "Add Expense"}
        </button>
      </div>

      {showAddExpense && (
        <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mb-6`}>
          <h3 className="text-xl font-semibold mb-4">Add New Expense</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Expense title (e.g., Lunch at restaurant) *"
              value={newExpense.title}
              onChange={(e) =>
                setNewExpense({ ...newExpense, title: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Amount *"
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, amount: e.target.value })
                }
                className={`px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
                step="0.01"
              />
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, date: e.target.value })
                }
                className={`px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
              />
            </div>
            <select
              value={newExpense.category}
              onChange={(e) =>
                setNewExpense({ ...newExpense, category: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-lg ${cardBg} border ${borderColor}`}
            >
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.icon}{" "}
                  {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={addExpense}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95"
              >
                Add Expense
              </button>
              <button
                onClick={() => setShowAddExpense(false)}
                className="px-4 py-3 bg-gray-500 text-white rounded-lg transition-all duration-200 hover:bg-gray-600 hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={textSecondary}>Total Spent</span>
            <IndianRupee className="text-red-500" size={24} /> {/* Changed Icon */}
          </div>
          <p className="text-3xl font-bold text-red-500">
            ₹{totalExpense.toFixed(2)} {/* Changed Symbol */}
          </p>
          <p className={`text-sm ${textSecondary} mt-1`}>
            {filterPeriod === "week"
              ? "This week"
              : filterPeriod === "month"
              ? "This month"
              : filterPeriod === "year"
              ? "This year"
              : "All time"}
          </p>
        </div>

        <div className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={textSecondary}>Transactions</span>
            <TrendingDown className="text-blue-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-blue-500">
            {filteredExpenses.length}
          </p>
          <p className={`text-sm ${textSecondary} mt-1`}>Total entries</p>
        </div>

        <div className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={textSecondary}>Avg. Expense</span>
            <Calendar className="text-green-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-500">
            ₹
            {filteredExpenses.length > 0
              ? (totalExpense / filteredExpenses.length).toFixed(2)
              : "0.00"} {/* Changed Symbol */}
          </p>
          <p className={`text-sm ${textSecondary} mt-1`}>Per transaction</p>
        </div>

        <div className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={textSecondary}>Top Category</span>
            <PieChart className="text-purple-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-purple-500">
            {Object.keys(categoryTotals).length > 0
              ? getCategoryIcon(
                  Object.keys(categoryTotals).reduce((a, b) =>
                    categoryTotals[a] > categoryTotals[b] ? a : b
                  )
                )
              : "—"}
          </p>
          <p className={`text-sm ${textSecondary} mt-1`}>
            {Object.keys(categoryTotals).length > 0
              ? Object.keys(categoryTotals)
                  .reduce((a, b) =>
                    categoryTotals[a] > categoryTotals[b] ? a : b
                  )
                  .toUpperCase()
              : "No data"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <select
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
          className={`px-4 py-2 rounded-lg ${cardBg} border ${borderColor}`}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={`px-4 py-2 rounded-lg ${cardBg} border ${borderColor}`}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.icon} {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className={`${cardBg} p-6 rounded-xl border ${borderColor} mb-6`}>
          <h3 className="text-xl font-semibold mb-4">Spending by Category</h3>
          <div className="space-y-3">
            {Object.entries(categoryTotals)
              .sort((a, b) => b[1] - a[1])
              .map(([category, amount]) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {getCategoryIcon(category)}
                      </span>
                      <span className="font-semibold capitalize">
                        {category}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{amount.toFixed(2)}</p> {/* Changed Symbol */}
                      <p className={`text-sm ${textSecondary}`}>
                        {getCategoryPercentage(category)}%
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`${getCategoryColor(
                        category
                      )} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${getCategoryPercentage(category)}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Expense List */}
      <div
        className={`${cardBg} rounded-xl border ${borderColor} overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <h3 className="text-xl font-semibold">Recent Expenses</h3>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className={`p-8 text-center ${textSecondary}`}>
            <IndianRupee size={48} className="mx-auto mb-4 opacity-50" /> {/* Changed Icon */}
            <p>No expenses found. Start tracking your spending!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`w-12 h-12 ${getCategoryColor(
                      expense.category
                    )} rounded-lg flex items-center justify-center text-2xl`}
                  >
                    {getCategoryIcon(expense.category)}
                  </div>
                  <div>
                    <p className="font-semibold">{expense.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                        } capitalize`}
                      >
                        {expense.category}
                      </span>
                      <span className={`text-xs ${textSecondary}`}>
                        {new Date(expense.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-xl font-bold text-red-500">
                    -₹{expense.amount.toFixed(2)} {/* Changed Symbol */}
                  </p>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default ExpenseTracker;