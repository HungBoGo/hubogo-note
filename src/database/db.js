// Database module sử dụng localStorage cho web dev, better-sqlite3 cho production
const isElectron = typeof window !== 'undefined' && window.process && window.process.type;

// Schema cho tasks
const TASKS_KEY = 'sticky_tasks';
const CATEGORIES_KEY = 'sticky_categories';
const SETTINGS_KEY = 'sticky_settings';

// Default categories
const defaultCategories = [
  { id: 1, name: 'Kiến trúc', color: '#3b82f6', icon: '🏛️' },
  { id: 2, name: 'Poster', color: '#8b5cf6', icon: '🎨' },
  { id: 3, name: 'Trading', color: '#22c55e', icon: '📈' },
  { id: 4, name: 'Khác', color: '#6b7280', icon: '📋' }
];

// Helper functions
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Initialize database
export function initDatabase() {
  if (!localStorage.getItem(CATEGORIES_KEY)) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
  }
  if (!localStorage.getItem(TASKS_KEY)) {
    localStorage.setItem(TASKS_KEY, JSON.stringify([]));
  }
}

// ============ TASKS ============

export function getAllTasks() {
  const tasks = localStorage.getItem(TASKS_KEY);
  return tasks ? JSON.parse(tasks) : [];
}

export function getTaskById(id) {
  const tasks = getAllTasks();
  return tasks.find(t => t.id === id);
}

export function getTasksByCategory(categoryId) {
  const tasks = getAllTasks();
  return tasks.filter(t => t.categoryId === categoryId);
}

export function getTasksByStatus(status) {
  const tasks = getAllTasks();
  return tasks.filter(t => t.status === status);
}

export function getTasksByDateRange(startDate, endDate) {
  const tasks = getAllTasks();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return tasks.filter(t => {
    const taskDate = new Date(t.createdAt).getTime();
    return taskDate >= start && taskDate <= end;
  });
}

export function createTask(task) {
  const tasks = getAllTasks();
  const newTask = {
    id: generateId(),
    title: task.title,
    description: task.description || '',
    categoryId: task.categoryId,
    priority: task.priority || 'normal',
    originalPriority: task.originalPriority || task.priority || 'normal',
    status: 'pending',
    amount: task.amount || 0,
    isPaid: false,
    payments: task.payments || [], // Array of {id, amount, date, note}
    deadline: task.deadline,
    reminderEnabled: task.reminderEnabled !== false,
    reminderTime: task.reminderTime || null,
    createdAt: task.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    autoUpgraded: false,
    checklist: task.checklist || [], // Array of {id, text, completed, phase}
    // Priority scoring fields (0-3 scale)
    importance: task.importance ?? 1,      // Mức độ quan trọng
    urgency: task.urgency ?? 1,            // Độ gấp (base, sẽ được bump theo deadline)
    strategic: task.strategic ?? 0,        // Giá trị chiến lược dài hạn
    cash_now: task.cash_now ?? 0,          // Tiền có thể về nhanh
    upside: task.upside ?? 0,              // Tiềm năng phát triển
    effort: task.effort ?? 1,              // Độ dễ làm (3 = rất dễ/nhanh)
    risk: task.risk ?? 0,                  // Rủi ro
    estimateMinutes: task.estimateMinutes || null,  // Thời gian ước tính (phút)
    // Long-term project tracking
    isLongTerm: task.isLongTerm || false,  // Đánh dấu dự án dài hạn
    dailyCheckins: task.dailyCheckins || [], // Array of date strings: ['2024-01-15', '2024-01-16', ...]
    currentStreak: task.currentStreak || 0,  // Số ngày liên tục điểm danh
    longestStreak: task.longestStreak || 0,  // Kỷ lục streak
    // Task category type
    taskType: task.taskType || 'income'  // 'income' = kiếm tiền nuôi gia đình, 'investment' = đầu tư dài hạn
  };
  tasks.push(newTask);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  return newTask;
}

export function updateTask(id, updates) {
  const tasks = getAllTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    tasks[index] = {
      ...tasks[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    if (updates.status === 'completed' && !tasks[index].completedAt) {
      tasks[index].completedAt = new Date().toISOString();
    }
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return tasks[index];
  }
  return null;
}

export function deleteTask(id) {
  const tasks = getAllTasks();
  const filtered = tasks.filter(t => t.id !== id);
  localStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
  return true;
}

export function toggleTaskComplete(id) {
  const task = getTaskById(id);
  if (task) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    return updateTask(id, { status: newStatus });
  }
  return null;
}

export function toggleTaskPaid(id) {
  const task = getTaskById(id);
  if (task) {
    return updateTask(id, { isPaid: !task.isPaid });
  }
  return null;
}

// ============ CATEGORIES ============

export function getAllCategories() {
  const categories = localStorage.getItem(CATEGORIES_KEY);
  return categories ? JSON.parse(categories) : defaultCategories;
}

export function getCategoryById(id) {
  const categories = getAllCategories();
  return categories.find(c => c.id === id);
}

export function createCategory(category) {
  const categories = getAllCategories();
  const newCategory = {
    id: Date.now(),
    name: category.name,
    color: category.color || '#6b7280',
    icon: category.icon || '📋'
  };
  categories.push(newCategory);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  return newCategory;
}

export function updateCategory(id, updates) {
  const categories = getAllCategories();
  const index = categories.findIndex(c => c.id === id);
  if (index !== -1) {
    categories[index] = { ...categories[index], ...updates };
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    return categories[index];
  }
  return null;
}

export function deleteCategory(id) {
  const categories = getAllCategories();
  const filtered = categories.filter(c => c.id !== id);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(filtered));
  return true;
}

// ============ STATISTICS ============

export function getStatistics(startDate, endDate) {
  const tasks = getTasksByDateRange(startDate, endDate);
  const categories = getAllCategories();

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    totalAmount: tasks.reduce((sum, t) => sum + (t.amount || 0), 0),
    paidAmount: tasks.filter(t => t.isPaid).reduce((sum, t) => sum + (t.amount || 0), 0),
    unpaidAmount: tasks.filter(t => !t.isPaid).reduce((sum, t) => sum + (t.amount || 0), 0),
    completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0,
    byCategory: {}
  };

  categories.forEach(cat => {
    const catTasks = tasks.filter(t => t.categoryId === cat.id);
    stats.byCategory[cat.id] = {
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      total: catTasks.length,
      completed: catTasks.filter(t => t.status === 'completed').length,
      pending: catTasks.filter(t => t.status !== 'completed').length,
      totalAmount: catTasks.reduce((sum, t) => sum + (t.amount || 0), 0),
      paidAmount: catTasks.filter(t => t.isPaid).reduce((sum, t) => sum + (t.amount || 0), 0)
    };
  });

  return stats;
}

export function getTodayStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getStatistics(today.toISOString(), tomorrow.toISOString());
}

export function getWeekStats() {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return getStatistics(startOfWeek.toISOString(), endOfWeek.toISOString());
}

export function getMonthStats() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return getStatistics(startOfMonth.toISOString(), endOfMonth.toISOString());
}

// ============ BACKUP ============

export function exportData() {
  return {
    tasks: getAllTasks(),
    categories: getAllCategories(),
    exportedAt: new Date().toISOString()
  };
}

export function importData(data) {
  if (data.tasks) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(data.tasks));
  }
  if (data.categories) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(data.categories));
  }
  return true;
}

// Initialize on load
initDatabase();
