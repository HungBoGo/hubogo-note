/**
 * Priority Engine - Auto Priority cho HubogoNote
 * Tự động xếp hạng task theo Eisenhower Matrix + Scoring System
 */

// ============ TYPES & DEFAULTS ============

/**
 * Default weights cho Priority Score
 * Có thể chỉnh sửa trong Settings
 */
export const DEFAULT_WEIGHTS = {
  strategic: 2,    // Chiến lược dài hạn
  cash_now: 3,     // Tiền có thể về nhanh
  upside: 1,       // Tiềm năng phát triển
  urgency: 2,      // Độ gấp
  effort: 1,       // Dễ làm (3 = rất dễ/nhanh)
  risk: 2          // Rủi ro (bị trừ điểm)
};

/**
 * Quadrant definitions - Eisenhower Matrix
 */
export const QUADRANTS = {
  Q1: { id: 'Q1', nameKey: 'quadrant_q1', color: '#ef4444', bgColor: 'bg-red-500', priority: 1 },
  Q2: { id: 'Q2', nameKey: 'quadrant_q2', color: '#3b82f6', bgColor: 'bg-blue-500', priority: 2 },
  Q3: { id: 'Q3', nameKey: 'quadrant_q3', color: '#f59e0b', bgColor: 'bg-amber-500', priority: 3 },
  Q4: { id: 'Q4', nameKey: 'quadrant_q4', color: '#6b7280', bgColor: 'bg-gray-500', priority: 4 }
};

// ============ CORE FUNCTIONS ============

/**
 * Tính urgency_effective dựa trên deadline
 * Deadline càng gần → urgency càng cao
 */
export function computeUrgencyEffective(now, deadlineAt, baseUrgency = 0) {
  if (!deadlineAt) return baseUrgency;

  const deadline = new Date(deadlineAt);
  const today = new Date(now);
  const diffMs = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // Deadline đã qua → max urgency
  if (diffDays <= 0) return 3;

  // Bump urgency based on deadline proximity
  if (diffDays <= 1) return Math.max(baseUrgency, 3);   // <= 1 ngày
  if (diffDays <= 7) return Math.max(baseUrgency, 2);   // <= 7 ngày
  if (diffDays <= 30) return Math.max(baseUrgency, 1);  // <= 30 ngày

  return baseUrgency;
}

/**
 * Xác định Quadrant theo Eisenhower Matrix
 * Q1: Important + Urgent
 * Q2: Important + Not Urgent
 * Q3: Not Important + Urgent
 * Q4: Not Important + Not Urgent
 */
export function computeQuadrant(importance, urgencyEffective) {
  const isImportant = importance >= 2;
  const isUrgent = urgencyEffective >= 2;

  if (isImportant && isUrgent) return 'Q1';
  if (isImportant && !isUrgent) return 'Q2';
  if (!isImportant && isUrgent) return 'Q3';
  return 'Q4';
}

/**
 * Tính Priority Score
 * Score cao = nên làm trước
 */
export function computeScore(task, weights = DEFAULT_WEIGHTS) {
  const {
    strategic = 0,
    cash_now = 0,
    upside = 0,
    urgencyEffective = 0,
    effort = 0,
    risk = 0
  } = task;

  const score =
    (weights.strategic * strategic) +
    (weights.cash_now * cash_now) +
    (weights.upside * upside) +
    (weights.urgency * urgencyEffective) +
    (weights.effort * effort) -
    (weights.risk * risk);

  return score;
}

/**
 * Tạo lý do giải thích cho việc ưu tiên task
 * Returns keys for i18n - translate in component
 */
export function explainPriority(task, evaluation) {
  const reasons = [];
  const { quadrant, urgencyEffective, score } = evaluation;
  const { importance = 0, cash_now = 0, effort = 0, risk = 0, deadline } = task;

  // Quadrant explanation - return key and data
  if (quadrant === 'Q1') {
    if (deadline) {
      const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 0) {
        reasons.push({ key: 'reason_overdue', icon: '⚠️' });
      } else if (daysLeft <= 1) {
        reasons.push({ key: 'reason_24h', icon: '🔥' });
      } else if (daysLeft <= 3) {
        reasons.push({ key: 'reason_days_left', icon: '⏰', data: { days: daysLeft } });
      } else {
        reasons.push({ key: 'reason_q1', icon: '📌' });
      }
    } else {
      reasons.push({ key: 'reason_q1', icon: '📌' });
    }
  } else if (quadrant === 'Q2') {
    reasons.push({ key: 'reason_q2', icon: '📅' });
  } else if (quadrant === 'Q3') {
    reasons.push({ key: 'reason_q3', icon: '🔄' });
  } else {
    reasons.push({ key: 'reason_q4', icon: '📋' });
  }

  // Cash now highlight
  if (cash_now >= 2) {
    reasons.push({ key: 'reason_cash', icon: '💰' });
  }

  // Effort highlight (easy wins)
  if (effort >= 2) {
    reasons.push({ key: 'reason_easy', icon: '⚡' });
  }

  // Risk warning
  if (risk >= 2) {
    reasons.push({ key: 'reason_risk', icon: '⚠️' });
  }

  return reasons;
}

/**
 * Đánh giá một task - trả về đầy đủ thông tin
 */
export function evaluateTask(task, weights = DEFAULT_WEIGHTS, now = new Date()) {
  // Get priority fields hoặc default từ task cũ
  const importance = task.importance ?? (task.priority === 'urgent' ? 3 : task.priority === 'high' ? 2 : 1);
  const baseUrgency = task.urgency ?? (task.priority === 'urgent' ? 3 : task.priority === 'high' ? 2 : 1);

  // Compute derived values
  const urgencyEffective = computeUrgencyEffective(now, task.deadline, baseUrgency);
  const quadrant = computeQuadrant(importance, urgencyEffective);

  // Prepare task with computed values for scoring
  const taskWithComputed = {
    ...task,
    importance,
    urgencyEffective,
    strategic: task.strategic ?? 0,
    cash_now: task.cash_now ?? (task.amount > 0 ? 2 : 0),
    upside: task.upside ?? 0,
    effort: task.effort ?? 1,
    risk: task.risk ?? 0
  };

  const score = computeScore(taskWithComputed, weights);

  const evaluation = {
    quadrant,
    quadrantInfo: QUADRANTS[quadrant],
    urgencyEffective,
    score,
    importance
  };

  const reasons = explainPriority(taskWithComputed, evaluation);

  return {
    ...evaluation,
    reasons
  };
}

/**
 * Sort tasks theo priority
 * 1. Quadrant (Q1 > Q2 > Q3 > Q4)
 * 2. Score trong cùng quadrant (cao > thấp)
 * 3. Tasks completed xuống cuối
 */
export function sortTasksByPriority(tasks, weights = DEFAULT_WEIGHTS, now = new Date()) {
  // Evaluate all tasks
  const tasksWithEval = tasks.map(task => ({
    ...task,
    evaluation: evaluateTask(task, weights, now)
  }));

  // Sort
  return tasksWithEval.sort((a, b) => {
    // Completed tasks go last
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (b.status === 'completed' && a.status !== 'completed') return -1;

    // Sort by quadrant priority
    const quadrantDiff = a.evaluation.quadrantInfo.priority - b.evaluation.quadrantInfo.priority;
    if (quadrantDiff !== 0) return quadrantDiff;

    // Same quadrant: sort by score DESC
    return b.evaluation.score - a.evaluation.score;
  });
}

/**
 * Get Today Focus - Top tasks cần làm hôm nay
 */
export function getTodayFocus(tasks, weights = DEFAULT_WEIGHTS, now = new Date()) {
  const sorted = sortTasksByPriority(
    tasks.filter(t => t.status !== 'completed'),
    weights,
    now
  );

  const q1Tasks = sorted.filter(t => t.evaluation.quadrant === 'Q1').slice(0, 3);
  const q2Tasks = sorted.filter(t => t.evaluation.quadrant === 'Q2').slice(0, 2);
  const q3Tasks = sorted.filter(t => t.evaluation.quadrant === 'Q3').slice(0, 2);

  return {
    urgent: q1Tasks,      // Q1: Làm ngay
    important: q2Tasks,   // Q2: Lên lịch
    delegate: q3Tasks,    // Q3: Có thể ủy quyền
    topPriority: sorted.slice(0, 5)  // Top 5 overall
  };
}

/**
 * Generate motivational banners based on stats
 * Returns raw data with i18nKey - translate in component
 */
export function generateBanners(stats, tasks) {
  const banners = [];
  const now = new Date();

  // ===== CELEBRATION BANNERS =====

  // Check for income milestones (this month)
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const monthlyIncome = tasks
    .filter(t => t.isPaid && new Date(t.completedAt || t.updatedAt) >= thisMonth)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Income milestones
  const milestones = [100000000, 50000000, 20000000, 10000000, 5000000];
  for (const milestone of milestones) {
    if (monthlyIncome >= milestone) {
      banners.push({
        type: 'celebration',
        icon: '🎉',
        titleKey: 'banner_congrats_earned',
        titleData: { milestone: (milestone / 1000000).toFixed(0), amount: monthlyIncome },
        color: 'green',
        priority: 0
      });
      break; // Only show highest milestone
    }
  }

  // Streak celebration
  const longTermTasks = tasks.filter(t => t.isLongTerm && t.currentStreak >= 7);
  if (longTermTasks.length > 0) {
    const maxStreak = Math.max(...longTermTasks.map(t => t.currentStreak || 0));
    if (maxStreak >= 30) {
      banners.push({
        type: 'streak_amazing',
        icon: '🔥',
        titleKey: 'banner_streak_amazing',
        titleData: { days: maxStreak },
        color: 'orange',
        priority: 1
      });
    } else if (maxStreak >= 7) {
      banners.push({
        type: 'streak',
        icon: '⚡',
        titleKey: 'banner_streak_days',
        titleData: { days: maxStreak },
        color: 'blue',
        priority: 1
      });
    }
  }

  // ===== WARNING BANNERS =====

  // Overdue tasks warning
  const overdueTasks = tasks.filter(t => {
    if (!t.deadline || t.status === 'completed') return false;
    return new Date(t.deadline) < now;
  });

  if (overdueTasks.length > 0) {
    banners.push({
      type: 'danger',
      icon: '🚨',
      titleKey: 'banner_overdue',
      titleData: { count: overdueTasks.length },
      color: 'red',
      priority: 2
    });
  }

  // Today deadline warning
  const todayDeadlines = tasks.filter(t => {
    if (!t.deadline || t.status === 'completed') return false;
    const deadline = new Date(t.deadline);
    const today = new Date();
    return deadline.toDateString() === today.toDateString();
  });

  if (todayDeadlines.length > 0) {
    banners.push({
      type: 'urgent',
      icon: '⏰',
      titleKey: 'banner_today_deadline',
      titleData: { count: todayDeadlines.length },
      color: 'orange',
      priority: 2
    });
  }

  // Unpaid tasks reminder
  if (stats.unpaidAmount > 0) {
    const unpaidCount = tasks.filter(t => t.amount > 0 && !t.isPaid && t.status === 'completed').length;
    if (unpaidCount > 0) {
      banners.push({
        type: 'money',
        icon: '💸',
        titleKey: 'banner_unpaid',
        titleData: { count: unpaidCount, amount: stats.unpaidAmount },
        color: 'yellow',
        priority: 3
      });
    }
  }

  // ===== MOTIVATION BANNERS =====
  if (stats.completionRate >= 80) {
    banners.push({
      type: 'success',
      icon: '🏆',
      titleKey: 'banner_excellent',
      titleData: { rate: stats.completionRate },
      color: 'green',
      priority: 4
    });
  } else if (stats.completionRate < 30 && stats.total > 0) {
    banners.push({
      type: 'warning',
      icon: '⚡',
      titleKey: 'banner_need_focus',
      color: 'amber',
      priority: 4
    });
  }

  // Sort by priority
  return banners.sort((a, b) => (a.priority || 99) - (b.priority || 99));
}

/**
 * Categorize tasks by type (income vs investment)
 */
export function categorizeTasksByType(tasks, weights = DEFAULT_WEIGHTS, now = new Date()) {
  const sorted = sortTasksByPriority(
    tasks.filter(t => t.status !== 'completed'),
    weights,
    now
  );

  const incomeTasks = sorted.filter(t => t.taskType !== 'investment');
  const investmentTasks = sorted.filter(t => t.taskType === 'investment');

  return {
    income: {
      urgent: incomeTasks.filter(t => t.evaluation.quadrant === 'Q1').slice(0, 5),
      important: incomeTasks.filter(t => t.evaluation.quadrant === 'Q2').slice(0, 3),
      all: incomeTasks
    },
    investment: {
      all: investmentTasks,
      longTerm: investmentTasks.filter(t => t.isLongTerm)
    }
  };
}

/**
 * Get advice based on current situation
 * Returns keys for i18n - translate in component
 */
export function getSmartAdvice(tasks, stats) {
  const advice = [];

  const pendingIncome = tasks.filter(t => t.status !== 'completed' && t.taskType !== 'investment' && t.amount > 0);
  const pendingInvestment = tasks.filter(t => t.status !== 'completed' && t.taskType === 'investment');
  const uncheckedLongTerm = tasks.filter(t => {
    if (!t.isLongTerm || t.status === 'completed') return false;
    const today = new Date().toISOString().split('T')[0];
    return !t.dailyCheckins || !t.dailyCheckins.includes(today);
  });

  // Income advice
  if (pendingIncome.length > 0) {
    const totalPending = pendingIncome.reduce((sum, t) => sum + (t.amount || 0), 0);
    advice.push({
      type: 'income',
      icon: '💰',
      titleKey: 'advice_income_title',
      messageKey: 'advice_income_msg',
      messageData: { count: pendingIncome.length, amount: totalPending },
      actionKey: 'advice_income_action'
    });
  }

  // Investment advice
  if (pendingInvestment.length > 0 && pendingIncome.length === 0) {
    advice.push({
      type: 'investment',
      icon: '🚀',
      titleKey: 'advice_invest_good_time',
      messageKey: 'advice_invest_no_urgent',
      actionKey: 'advice_invest_action'
    });
  } else if (pendingInvestment.length > 0) {
    advice.push({
      type: 'investment',
      icon: '📅',
      titleKey: 'advice_invest_dont_forget',
      messageKey: 'advice_invest_block_time',
      messageData: { count: pendingInvestment.length },
      actionKey: 'advice_invest_action'
    });
  }

  // Long-term check-in advice
  if (uncheckedLongTerm.length > 0) {
    advice.push({
      type: 'checkin',
      icon: '🎯',
      titleKey: 'advice_checkin_title',
      messageKey: 'advice_checkin_msg',
      messageData: { count: uncheckedLongTerm.length },
      actionKey: 'advice_checkin_action'
    });
  }

  return advice;
}

/**
 * Map priority string cũ sang importance level
 */
export function mapLegacyPriority(priority) {
  switch (priority) {
    case 'urgent': return 3;
    case 'high': return 2;
    case 'normal': return 1;
    case 'low': return 0;
    default: return 1;
  }
}

/**
 * Get importance label key for i18n
 */
export function getImportanceLabelKey(level) {
  switch (level) {
    case 3: return 'importance_3';
    case 2: return 'importance_2';
    case 1: return 'importance_1';
    case 0: return 'importance_0';
    default: return 'importance_1';
  }
}

// ============ SETTINGS STORAGE ============

const WEIGHTS_KEY = 'priority_weights';

export function getWeights() {
  const stored = localStorage.getItem(WEIGHTS_KEY);
  if (stored) {
    try {
      return { ...DEFAULT_WEIGHTS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_WEIGHTS;
    }
  }
  return DEFAULT_WEIGHTS;
}

export function saveWeights(weights) {
  localStorage.setItem(WEIGHTS_KEY, JSON.stringify(weights));
}
