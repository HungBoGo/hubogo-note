import React, { useState, useMemo } from 'react';
import {
  format,
  startOfDay,
  endOfDay,
  subDays,
  subMonths,
  subYears,
  eachDayOfInterval,
  isSameDay,
  isToday,
  getDay
} from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { FiCheck, FiClock, FiDollarSign, FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi';
import useStore from '../store/useStore';
import TaskDetailModal from './TaskDetailModal';
import { useTranslation } from '../utils/i18n';

const WEEKDAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function CalendarView() {
  const { tasks, categories, openTaskForm, toggleTaskComplete, toggleTaskPaid, formatMoney, formatMoneyShort } = useStore();
  const { t, language } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const PERIODS = [
    { key: '7d', label: t('days_7'), days: 7 },
    { key: '30d', label: t('days_30'), days: 30 },
    { key: '90d', label: t('days_90'), days: 90 },
    { key: '1y', label: t('year_1'), days: 365 },
    { key: 'all', label: t('all'), days: null }
  ];

  const WEEKDAYS = language === 'vi' ? WEEKDAYS_VI : WEEKDAYS_EN;
  const dateLocale = language === 'vi' ? vi : enUS;
  const [viewOffset, setViewOffset] = useState(0); // For pagination
  const [selectedTask, setSelectedTask] = useState(null); // For detail modal

  // Filter tasks by period
  const { filteredTasks, dateRange } = useMemo(() => {
    const now = new Date();
    const period = PERIODS.find(p => p.key === selectedPeriod);

    let startDate;
    if (period.days === null) {
      // Get oldest task date
      const oldestTask = tasks.reduce((oldest, task) => {
        const taskDate = new Date(task.createdAt);
        return taskDate < oldest ? taskDate : oldest;
      }, now);
      startDate = startOfDay(oldestTask);
    } else {
      startDate = startOfDay(subDays(now, period.days - 1));
    }

    const endDate = endOfDay(now);

    const filtered = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= startDate && taskDate <= endDate;
    });

    return {
      filteredTasks: filtered,
      dateRange: { start: startDate, end: endDate }
    };
  }, [tasks, selectedPeriod]);

  // Generate days array for calendar
  const calendarDays = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return [];

    const days = eachDayOfInterval({
      start: dateRange.start,
      end: dateRange.end
    }).reverse(); // Most recent first

    return days;
  }, [dateRange]);

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped = {};
    filteredTasks.forEach(task => {
      const dateKey = format(new Date(task.createdAt), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(task);
    });
    return grouped;
  }, [filteredTasks]);

  // Get category by id
  const getCategoryById = (id) => {
    return categories.find(c => c.id === id) || { name: language === 'vi' ? 'Khác' : 'Other', color: '#6b7280', icon: '📋' };
  };

  // Priority colors
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'very-urgent':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'urgent':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  // Statistics for period
  const periodStats = useMemo(() => {
    const completed = filteredTasks.filter(t => t.status === 'completed').length;
    const pending = filteredTasks.filter(t => t.status !== 'completed').length;
    const totalAmount = filteredTasks.reduce((sum, t) => sum + (t.amount || 0), 0);
    const paidAmount = filteredTasks.filter(t => t.isPaid).reduce((sum, t) => sum + (t.amount || 0), 0);

    return { completed, pending, total: filteredTasks.length, totalAmount, paidAmount };
  }, [filteredTasks]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header with period selector */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-primary-500">
            {t('task_calendar')}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredTasks.length} {t('tasks_count')}
            </span>
            <button
              onClick={() => openTaskForm()}
              className="p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              title={t('add_new_task')}
            >
              <FiPlus size={18} />
            </button>
          </div>
        </div>

        {/* Period tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {PERIODS.map(period => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key)}
              className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                selectedPeriod === period.key
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-2 mt-3 text-xs">
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
            <FiCheck size={12} />
            {periodStats.completed} {t('completed')}
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full">
            <FiClock size={12} />
            {periodStats.pending} {t('in_progress')}
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full" title={t('paid')}>
            <FiDollarSign size={12} />
            ✓ {formatMoneyShort(periodStats.paidAmount)}
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full" title={t('unpaid')}>
            <FiDollarSign size={12} />
            {formatMoneyShort(periodStats.totalAmount - periodStats.paidAmount)} {t('unpaid')}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {calendarDays.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-5xl mb-3">📅</div>
            <p>{t('no_tasks_period')}</p>
            <button
              onClick={() => openTaskForm()}
              className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
            >
              <FiPlus size={16} />
              {t('add_first_task')}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {calendarDays.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayTasks = tasksByDate[dateKey] || [];
              const dayOfWeek = getDay(day);
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const dayIsToday = isToday(day);

              if (dayTasks.length === 0) return null;

              return (
                <div
                  key={dateKey}
                  className={`rounded-xl overflow-hidden border ${
                    dayIsToday
                      ? 'border-primary-300 dark:border-primary-600 bg-primary-50/50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  {/* Day header */}
                  <div className={`px-3 py-2 flex items-center justify-between ${
                    dayIsToday
                      ? 'bg-primary-100 dark:bg-primary-900/40'
                      : isWeekend
                        ? 'bg-gray-100 dark:bg-gray-700/50'
                        : 'bg-white dark:bg-gray-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        dayIsToday
                          ? 'bg-primary-500 text-white'
                          : isWeekend
                            ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                        {WEEKDAYS[dayOfWeek]}
                      </span>
                      <span className={`font-semibold ${
                        dayIsToday
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-200'
                      }`}>
                        {format(day, 'dd/MM/yyyy', { locale: vi })}
                      </span>
                      {dayIsToday && (
                        <span className="text-xs text-primary-500 font-medium">{t('today')}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {dayTasks.length} việc
                    </span>
                  </div>

                  {/* Tasks for this day */}
                  <div className="p-2 space-y-1.5">
                    {dayTasks.map(task => {
                      const category = getCategoryById(task.categoryId);

                      return (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className={`group relative p-2 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${
                            getPriorityStyle(task.priority)
                          } ${task.status === 'completed' ? 'opacity-60' : ''}`}
                          style={{ borderLeftColor: category.color }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            {/* Checkbox */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskComplete(task.id);
                              }}
                              className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                task.status === 'completed'
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                              }`}
                            >
                              {task.status === 'completed' && (
                                <FiCheck className="text-white" size={10} />
                              )}
                            </button>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className={`text-sm font-medium truncate ${
                                  task.status === 'completed'
                                    ? 'line-through text-gray-400'
                                    : 'text-gray-800 dark:text-white'
                                }`}>
                                  {task.title}
                                </h4>
                                {task.autoUpgraded && (
                                  <span className="text-xs text-orange-500" title="Tự động nâng cấp">
                                    ⬆️
                                  </span>
                                )}
                              </div>

                              {/* Meta row */}
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {/* Category badge - prominent */}
                                <span
                                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                                  style={{
                                    backgroundColor: category.color + '30',
                                    color: category.color,
                                    border: `1px solid ${category.color}50`
                                  }}
                                >
                                  {category.icon} {category.name}
                                </span>

                                {/* Amount */}
                                {task.amount > 0 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleTaskPaid(task.id);
                                    }}
                                    className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                      task.isPaid
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }`}
                                  >
                                    <FiDollarSign size={10} />
                                    {formatMoneyShort(task.amount)}
                                    {task.isPaid && <FiCheck size={10} />}
                                  </button>
                                )}

                                {/* Time received */}
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  {format(new Date(task.createdAt), 'HH:mm')}
                                </span>
                              </div>
                            </div>

                            {/* Right side: Progress & Payment info */}
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              {/* Checklist progress */}
                              {task.checklist && task.checklist.length > 0 && (() => {
                                const completed = task.checklist.filter(c => c.completed).length;
                                const total = task.checklist.length;
                                const percent = Math.round((completed / total) * 100);
                                return (
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${
                                          percent === 100 ? 'bg-green-500' : percent >= 50 ? 'bg-blue-500' : 'bg-orange-500'
                                        }`}
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                    <span className={`text-xs font-medium ${
                                      percent === 100 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                      {percent}%
                                    </span>
                                  </div>
                                );
                              })()}

                              {/* Payment status for tasks with amount */}
                              {task.amount > 0 && (
                                <div className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                  task.isPaid
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                    : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                                }`}>
                                  {task.isPaid ? '✓ Đã TT' : 'Chưa TT'}
                                </div>
                              )}

                              {/* Priority indicator */}
                              <div className={`w-2 h-2 rounded-full ${
                                task.priority === 'very-urgent'
                                  ? 'bg-red-500'
                                  : task.priority === 'urgent'
                                    ? 'bg-orange-500'
                                    : 'bg-blue-500'
                              }`} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

export default CalendarView;
