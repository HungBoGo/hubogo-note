import { create } from 'zustand';
import * as db from '../database/db';

const DEFAULT_EXCHANGE_RATE = 25800; // 1 USD = 25800 VND

const useStore = create((set, get) => ({
  // State
  tasks: [],
  categories: [],
  selectedCategory: null,
  selectedView: 'all', // all, today, category, statistics
  searchQuery: '',
  theme: localStorage.getItem('theme') || 'light',
  isTaskFormOpen: false,
  editingTask: null,
  isCategoryFormOpen: false,
  editingCategory: null,
  currency: localStorage.getItem('currency') || 'VND', // VND or USD
  exchangeRate: parseFloat(localStorage.getItem('exchangeRate')) || DEFAULT_EXCHANGE_RATE,

  // Actions - Tasks
  loadTasks: () => {
    const tasks = db.getAllTasks();
    set({ tasks });
  },

  addTask: (task) => {
    const newTask = db.createTask(task);
    set(state => ({ tasks: [...state.tasks, newTask] }));
    return newTask;
  },

  updateTask: (id, updates) => {
    const updated = db.updateTask(id, updates);
    if (updated) {
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? updated : t)
      }));
    }
    return updated;
  },

  deleteTask: (id) => {
    db.deleteTask(id);
    set(state => ({
      tasks: state.tasks.filter(t => t.id !== id)
    }));
  },

  toggleTaskComplete: (id) => {
    const updated = db.toggleTaskComplete(id);
    if (updated) {
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? updated : t)
      }));
    }
  },

  toggleTaskPaid: (id) => {
    const updated = db.toggleTaskPaid(id);
    if (updated) {
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? updated : t)
      }));
    }
  },

  // Daily check-in for long-term projects
  dailyCheckin: (id) => {
    const task = get().tasks.find(t => t.id === id);
    if (!task) return null;

    const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const checkins = task.dailyCheckins || [];

    // Already checked in today?
    if (checkins.includes(today)) return task;

    // Add today's check-in
    const newCheckins = [...checkins, today].sort();

    // Calculate streak
    let currentStreak = 1;
    const sortedDates = newCheckins.slice().reverse();

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }

    const longestStreak = Math.max(task.longestStreak || 0, currentStreak);

    const updated = db.updateTask(id, {
      dailyCheckins: newCheckins,
      currentStreak,
      longestStreak
    });

    if (updated) {
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? updated : t)
      }));
    }
    return updated;
  },

  // Check if task has been checked in today
  hasCheckedInToday: (id) => {
    const task = get().tasks.find(t => t.id === id);
    if (!task || !task.dailyCheckins) return false;
    const today = new Date().toISOString().split('T')[0];
    return task.dailyCheckins.includes(today);
  },

  // Get all long-term tasks that haven't been checked in today
  getUncheckedLongTermTasks: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().tasks.filter(t =>
      t.isLongTerm &&
      t.status !== 'completed' &&
      (!t.dailyCheckins || !t.dailyCheckins.includes(today))
    );
  },

  // Actions - Categories
  loadCategories: () => {
    const categories = db.getAllCategories();
    set({ categories });
  },

  addCategory: (category) => {
    const newCategory = db.createCategory(category);
    set(state => ({ categories: [...state.categories, newCategory] }));
    return newCategory;
  },

  updateCategory: (id, updates) => {
    const updated = db.updateCategory(id, updates);
    if (updated) {
      set(state => ({
        categories: state.categories.map(c => c.id === id ? updated : c)
      }));
    }
  },

  deleteCategory: (id) => {
    db.deleteCategory(id);
    set(state => ({
      categories: state.categories.filter(c => c.id !== id)
    }));
  },

  // Actions - UI
  setSelectedCategory: (categoryId) => {
    set({ selectedCategory: categoryId, selectedView: 'category' });
  },

  setSelectedView: (view) => {
    set({ selectedView: view, selectedCategory: null });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    set({ theme: newTheme });
  },

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  openTaskForm: (task = null) => {
    set({ isTaskFormOpen: true, editingTask: task });
  },

  closeTaskForm: () => {
    set({ isTaskFormOpen: false, editingTask: null });
  },

  openCategoryForm: (category = null) => {
    set({ isCategoryFormOpen: true, editingCategory: category });
  },

  closeCategoryForm: () => {
    set({ isCategoryFormOpen: false, editingCategory: null });
  },

  // Currency
  setCurrency: (currency) => {
    localStorage.setItem('currency', currency);
    set({ currency });
  },

  setExchangeRate: (rate) => {
    localStorage.setItem('exchangeRate', rate.toString());
    set({ exchangeRate: rate });
  },

  fetchExchangeRate: async () => {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      const rate = data.rates.VND || DEFAULT_EXCHANGE_RATE;
      get().setExchangeRate(rate);
      return rate;
    } catch (error) {
      console.log('Could not fetch exchange rate, using default');
      return get().exchangeRate;
    }
  },

  // Format money based on selected currency
  formatMoney: (amountVND) => {
    const { currency, exchangeRate } = get();
    if (currency === 'USD') {
      const usd = amountVND / exchangeRate;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(usd);
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amountVND);
  },

  formatMoneyShort: (amountVND) => {
    const { currency, exchangeRate } = get();
    if (currency === 'USD') {
      const usd = amountVND / exchangeRate;
      if (usd >= 1000) return '$' + (usd / 1000).toFixed(1) + 'K';
      return '$' + usd.toFixed(2);
    }
    if (amountVND >= 1000000) return (amountVND / 1000000).toFixed(1) + 'M';
    if (amountVND >= 1000) return (amountVND / 1000).toFixed(0) + 'K';
    return amountVND.toString() + 'đ';
  },

  // Computed - Filtered tasks
  getFilteredTasks: () => {
    const { tasks, selectedView, selectedCategory, searchQuery } = get();
    let filtered = [...tasks];

    // Filter by view
    if (selectedView === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filtered = filtered.filter(t => {
        const taskDate = new Date(t.createdAt);
        return taskDate >= today && taskDate < tomorrow;
      });
    } else if (selectedView === 'category' && selectedCategory) {
      filtered = filtered.filter(t => t.categoryId === selectedCategory);
    } else if (selectedView === 'completed') {
      filtered = filtered.filter(t => t.status === 'completed');
    } else if (selectedView === 'pending') {
      filtered = filtered.filter(t => t.status !== 'completed');
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query))
      );
    }

    // Sort by priority and deadline
    filtered.sort((a, b) => {
      const priorityOrder = { 'very-urgent': 0, 'urgent': 1, 'normal': 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (a.deadline && b.deadline) {
        return new Date(a.deadline) - new Date(b.deadline);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return filtered;
  },

  // Statistics
  getStatistics: (period = 'month') => {
    if (period === 'today') return db.getTodayStats();
    if (period === 'week') return db.getWeekStats();
    return db.getMonthStats();
  },

  // Backup
  exportData: () => {
    return db.exportData();
  },

  importData: (data) => {
    db.importData(data);
    get().loadTasks();
    get().loadCategories();
  }
}));

export default useStore;
