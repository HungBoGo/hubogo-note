import React, { useEffect, useState, useRef } from 'react';
import {
  FiEdit2, FiTrash2, FiDollarSign, FiClock, FiBell, FiBellOff, FiCheck,
  FiAlertTriangle, FiAlertCircle, FiCalendar, FiChevronDown, FiChevronUp,
  FiTarget, FiZap
} from 'react-icons/fi';
import { format, formatDistanceToNow, isPast, isToday, differenceInDays } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import useStore from '../store/useStore';
import { useTranslation } from '../utils/i18n';

function TaskItem({ task, compact = false, showQuadrant = false }) {
  const { toggleTaskComplete, toggleTaskPaid, updateTask, deleteTask, openTaskForm, categories, formatMoney, dailyCheckin, hasCheckedInToday } = useStore();
  const { t, language } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const itemRef = useRef(null);
  const category = categories.find(c => c.id === task.categoryId);
  const daysReceived = differenceInDays(new Date(), new Date(task.createdAt));
  const [isNeonActive, setIsNeonActive] = useState(false);
  const dateLocale = language === 'vi' ? vi : enUS;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (itemRef.current && !itemRef.current.contains(event.target)) setIsExpanded(false);
    };
    if (isExpanded) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  useEffect(() => {
    if (task.priority !== 'very-urgent' || task.status === 'completed') { setIsNeonActive(false); return; }
    setIsNeonActive(true);
    const t1 = setTimeout(() => setIsNeonActive(false), 5000);
    const t2 = setInterval(() => { setIsNeonActive(true); setTimeout(() => setIsNeonActive(false), 5000); }, 300000);
    return () => { clearTimeout(t1); clearInterval(t2); };
  }, [task.priority, task.status]);

  useEffect(() => {
    if (task.status === 'completed') return;
    const op = task.originalPriority || task.priority;
    let np = op;
    if (op === 'normal') { if (daysReceived >= 5) np = 'very-urgent'; else if (daysReceived >= 3) np = 'urgent'; }
    else if (op === 'urgent' && daysReceived >= 3) np = 'very-urgent';
    if (np !== task.priority) updateTask(task.id, { priority: np, originalPriority: op, autoUpgraded: true });
  }, [daysReceived, task.status]);

  const pc = {
    'very-urgent': { label: t('priority_very_urgent'), color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', border: 'border-l-red-500', icon: FiAlertCircle, dot: 'bg-red-500' },
    'urgent': { label: t('priority_urgent'), color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', border: 'border-l-orange-500', icon: FiAlertTriangle, dot: 'bg-orange-500' },
    'normal': { label: t('priority_normal'), color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', border: 'border-l-blue-500', icon: null, dot: 'bg-blue-500' }
  };
  const priority = pc[task.priority] || pc.normal;
  const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'completed';
  const isDueToday = task.deadline && isToday(new Date(task.deadline));

  const handleToggleReminder = (e) => { e.stopPropagation(); updateTask(task.id, { reminderEnabled: !task.reminderEnabled }); };
  const handleDelete = (e) => { e.stopPropagation(); if (window.confirm(t('delete_task_confirm'))) deleteTask(task.id); };
  const handleEdit = (e) => { e.stopPropagation(); openTaskForm(task); };
  const handleToggleComplete = (e) => { e.stopPropagation(); toggleTaskComplete(task.id); };
  const handleTogglePaid = (e) => { e.stopPropagation(); toggleTaskPaid(task.id); };
  const handleCheckin = (e) => { e.stopPropagation(); dailyCheckin(task.id); };

  // Check if already checked in today
  const checkedInToday = task.isLongTerm && hasCheckedInToday(task.id);

  // Compact relative time format
  const getCompactRelativeTime = (date) => {
    const now = new Date();
    const diff = date - now;
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const diffMonths = Math.round(diffDays / 30);

    if (diffDays <= 0) return t('overdue');
    if (diffDays === 1) return language === 'vi' ? '1 ngày' : '1 day';
    if (diffDays <= 7) return language === 'vi' ? `${diffDays} ngày` : `${diffDays}d`;
    if (diffDays <= 30) return language === 'vi' ? `${Math.ceil(diffDays / 7)} tuần` : `${Math.ceil(diffDays / 7)}w`;
    if (diffMonths <= 12) return language === 'vi' ? `${diffMonths} tháng` : `${diffMonths}mo`;
    return language === 'vi' ? `${Math.round(diffMonths / 12)} năm` : `${Math.round(diffMonths / 12)}y`;
  };

  const getDeadlineText = () => {
    if (!task.deadline) return null;
    if (isOverdue) return t('overdue');
    if (isDueToday) return t('today');
    return getCompactRelativeTime(new Date(task.deadline));
  };
  const PIcon = priority.icon;

  // Quadrant badge colors
  const getQuadrantBadge = () => {
    if (!showQuadrant || !task.evaluation) return null;
    const colors = {
      Q1: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      Q2: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      Q3: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
      Q4: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
    };
    return (
      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${colors[task.evaluation.quadrant]}`}>
        {task.evaluation.quadrant}
      </span>
    );
  };

  // Compact mode for PriorityView
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <button onClick={handleToggleComplete} className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.status === 'completed' ? 'bg-primary-500 border-primary-500' : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'}`}>
          {task.status === 'completed' && <FiCheck className="text-white" size={12} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-medium text-gray-800 dark:text-white truncate ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>{task.title}</h3>
            {task.isLongTerm && (
              <span className="flex-shrink-0 text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded flex items-center gap-0.5">
                <FiTarget size={10} />
                {task.currentStreak || 0}🔥
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            {category && <span style={{color: category.color}}>{category.icon} {category.name}</span>}
            {task.amount > 0 && <span className={task.isPaid ? 'text-green-600' : 'text-amber-600'}><FiDollarSign className="inline" size={10}/> {formatMoney(task.amount)}</span>}
            {task.deadline && <span className={isOverdue ? 'text-red-500' : ''}><FiClock className="inline" size={10}/> {getDeadlineText()}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task.isLongTerm && !checkedInToday && (
            <button onClick={handleCheckin} className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-white" title={t('checkin')}>
              <FiZap size={14}/>
            </button>
          )}
          {task.isLongTerm && checkedInToday && (
            <span className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600" title={t('checked_in_today')}>
              <FiCheck size={14}/>
            </span>
          )}
          {task.evaluation && <span className="text-xs text-gray-400">#{task.evaluation.score}</span>}
          <button onClick={handleEdit} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600"><FiEdit2 size={14}/></button>
        </div>
      </div>
    );
  }

  return (
    <div ref={itemRef} onClick={() => setIsExpanded(!isExpanded)}
      className={`group relative bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 ${priority.border} ${task.status === 'completed' ? 'opacity-60' : ''} ${isOverdue ? 'bg-red-50 dark:bg-red-900/10' : ''} ${isNeonActive ? 'neon-urgent-active' : ''} ${isExpanded ? 'shadow-lg ring-2 ring-primary-500/30' : 'hover:shadow-md'} transition-all cursor-pointer`}>
      <div className="flex items-center gap-3 p-3">
        <button onClick={handleToggleComplete} className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.status === 'completed' ? 'bg-primary-500 border-primary-500' : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'}`}>
          {task.status === 'completed' && <FiCheck className="text-white" size={12} />}
        </button>
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-gray-800 dark:text-white truncate ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>{task.title}</h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {getQuadrantBadge()}
          {task.deadline && <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${isOverdue ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : isDueToday ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>{getDeadlineText()}</span>}
          <span className={`w-2.5 h-2.5 rounded-full ${priority.dot}`} title={priority.label} />
          <span className="text-gray-400">{isExpanded ? <FiChevronUp size={16}/> : <FiChevronDown size={16}/>}</span>
        </div>
      </div>
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-700">
          {task.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-3">{task.description}</p>}
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
            {category && <span className="px-2 py-1 rounded-full" style={{backgroundColor: category.color + '20', color: category.color}}>{category.icon} {category.name}</span>}
            {task.amount > 0 && <button onClick={handleTogglePaid} className={`flex items-center gap-1 px-2 py-1 rounded-full ${task.isPaid ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}><FiDollarSign size={12}/>{formatMoney(task.amount)}{task.isPaid && <FiCheck size={10}/>}</button>}
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${priority.color}`}>{task.autoUpgraded && <span title={t('auto_upgraded')}>⬆️</span>}{PIcon && <PIcon size={10}/>}{priority.label}</span>
            <button onClick={handleToggleReminder} className={`p-1 rounded ${task.reminderEnabled ? 'text-primary-500' : 'text-gray-400'}`}>{task.reminderEnabled ? <FiBell size={14}/> : <FiBellOff size={14}/>}</button>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><FiCalendar size={12}/>{t('received_label')}: {format(new Date(task.createdAt), 'dd/MM/yy HH:mm', {locale: dateLocale})}</span>
            {task.deadline && <span className="flex items-center gap-1"><FiClock size={12}/>{t('deadline_at')}: {format(new Date(task.deadline), 'dd/MM/yy HH:mm', {locale: dateLocale})}</span>}
            {task.status === 'completed' && task.completedAt && <span className="flex items-center gap-1 text-green-600 dark:text-green-400"><FiCheck size={12}/>{t('done_at')}: {format(new Date(task.completedAt), 'dd/MM/yy HH:mm', {locale: dateLocale})}</span>}
          </div>
          {task.status !== 'completed' && daysReceived > 0 && <div className="mt-2"><span className={`inline-flex items-center text-xs px-2 py-1 rounded-full font-medium ${daysReceived >= 5 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : daysReceived >= 3 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>⏱️ {daysReceived} {t('days_not_done')}</span></div>}

          {/* Long-term project streak info */}
          {task.isLongTerm && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiTarget className="text-blue-500" size={14} />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">{t('long_term_project')}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                    <FiZap size={12} />
                    {task.currentStreak || 0} {t('streak_days')}
                  </span>
                  {task.longestStreak > 0 && (
                    <span className="text-gray-500 dark:text-gray-400">
                      {t('streak_record')}: {task.longestStreak}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleCheckin}
                disabled={checkedInToday}
                className={`mt-2 w-full py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                  checkedInToday
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 cursor-default'
                    : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                }`}
              >
                {checkedInToday ? (
                  <><FiCheck size={14} /> {t('checked_in_today')}</>
                ) : (
                  <><FiZap size={14} /> {t('checkin_today')}</>
                )}
              </button>
            </div>
          )}

          <div className="flex gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button onClick={handleEdit} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300"><FiEdit2 size={12}/>{t('edit')}</button>
            <button onClick={handleDelete} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg text-red-600 dark:text-red-400"><FiTrash2 size={12}/>{t('delete')}</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskItem;
