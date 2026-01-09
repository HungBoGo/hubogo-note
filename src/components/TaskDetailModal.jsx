import React, { useState, useEffect, useRef } from 'react';
import {
  FiX, FiEdit2, FiTrash2, FiCheck, FiDollarSign, FiClock, FiBell, FiBellOff,
  FiCalendar, FiAlertCircle, FiAlertTriangle, FiPlus, FiSquare, FiCheckSquare
} from 'react-icons/fi';
import { format, formatDistanceToNow, isPast, isToday, differenceInDays } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import useStore from '../store/useStore';
import { useTranslation } from '../utils/i18n';

function TaskDetailModal({ task: initialTask, onClose }) {
  const {
    toggleTaskComplete, toggleTaskPaid, updateTask, deleteTask,
    openTaskForm, categories, formatMoney, tasks
  } = useStore();
  const { t, language } = useTranslation();
  const dateLocale = language === 'vi' ? vi : enUS;

  // Get fresh task data from store (to sync after updates)
  const task = tasks.find(t => t.id === initialTask.id) || initialTask;

  const modalRef = useRef(null);
  const category = categories.find(c => c.id === task.categoryId);
  const daysReceived = differenceInDays(new Date(), new Date(task.createdAt));

  // Checklist state
  const [checklist, setChecklist] = useState(task.checklist || []);
  const [newCheckItem, setNewCheckItem] = useState('');
  const [editingCheckId, setEditingCheckId] = useState(null);
  const [editingCheckText, setEditingCheckText] = useState('');

  // Payments state
  const [payments, setPayments] = useState(task.payments || []);
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [newPaymentNote, setNewPaymentNote] = useState('');

  // Sync checklist when task changes
  useEffect(() => {
    setChecklist(task.checklist || []);
  }, [task.checklist]);

  // Sync payments when task changes
  useEffect(() => {
    setPayments(task.payments || []);
  }, [task.payments]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Priority config
  const pc = {
    'very-urgent': { label: t('priority_very_urgent'), color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: FiAlertCircle },
    'urgent': { label: t('priority_urgent'), color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: FiAlertTriangle },
    'normal': { label: t('priority_normal'), color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: null }
  };
  const priority = pc[task.priority] || pc.normal;
  const PIcon = priority.icon;

  const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'completed';
  const isDueToday = task.deadline && isToday(new Date(task.deadline));

  // Checklist handlers
  const handleAddCheckItem = () => {
    if (!newCheckItem.trim()) return;
    const newItem = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      text: newCheckItem.trim(),
      completed: false
    };
    const updated = [...checklist, newItem];
    setChecklist(updated);
    updateTask(task.id, { checklist: updated });
    setNewCheckItem('');
  };

  const handleToggleCheckItem = (itemId) => {
    const updated = checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updated);
    updateTask(task.id, { checklist: updated });
  };

  const handleDeleteCheckItem = (itemId) => {
    const updated = checklist.filter(item => item.id !== itemId);
    setChecklist(updated);
    updateTask(task.id, { checklist: updated });
  };

  const handleStartEditCheckItem = (item) => {
    setEditingCheckId(item.id);
    setEditingCheckText(item.text);
  };

  const handleSaveEditCheckItem = () => {
    if (!editingCheckText.trim()) return;
    const updated = checklist.map(item =>
      item.id === editingCheckId ? { ...item, text: editingCheckText.trim() } : item
    );
    setChecklist(updated);
    updateTask(task.id, { checklist: updated });
    setEditingCheckId(null);
    setEditingCheckText('');
  };

  const completedChecks = checklist.filter(c => c.completed).length;
  const totalChecks = checklist.length;
  const checkProgress = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;

  const handleDelete = () => {
    if (window.confirm(t('delete_task_confirm_msg'))) {
      deleteTask(task.id);
      onClose();
    }
  };

  const handleEdit = () => {
    openTaskForm(task);
    onClose();
  };

  const handleToggleComplete = () => {
    toggleTaskComplete(task.id);
  };

  const handleTogglePaid = () => {
    toggleTaskPaid(task.id);
  };

  const handleToggleReminder = () => {
    updateTask(task.id, { reminderEnabled: !task.reminderEnabled });
  };

  // Payment handlers
  const handleAddPayment = () => {
    const amount = parseFloat(newPaymentAmount.replace(/[^\d]/g, ''));
    if (!amount || amount <= 0) return;

    const newPayment = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      amount: amount,
      date: new Date().toISOString(),
      note: newPaymentNote.trim() || (language === 'vi' ? `Đợt ${payments.length + 1}` : `Payment ${payments.length + 1}`)
    };
    const updated = [...payments, newPayment];
    setPayments(updated);

    // Calculate total paid and check if fully paid
    const totalPaid = updated.reduce((sum, p) => sum + p.amount, 0);
    const isPaid = totalPaid >= task.amount;

    updateTask(task.id, { payments: updated, isPaid });
    setNewPaymentAmount('');
    setNewPaymentNote('');
  };

  const handleDeletePayment = (paymentId) => {
    const updated = payments.filter(p => p.id !== paymentId);
    setPayments(updated);

    // Recalculate isPaid
    const totalPaid = updated.reduce((sum, p) => sum + p.amount, 0);
    const isPaid = totalPaid >= task.amount;

    updateTask(task.id, { payments: updated, isPaid });
  };

  // Calculate payment totals
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = Math.max(0, task.amount - totalPaid);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-scale-in"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {category && (
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
              )}
              <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${priority.color}`}>
                {task.autoUpgraded && <span title={t('auto_upgraded')}>⬆️</span>}
                {PIcon && <PIcon size={10} />}
                {priority.label}
              </span>
            </div>
            <h2 className={`text-lg font-semibold text-gray-800 dark:text-white ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
              {task.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Description */}
          {task.description && (
            <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {task.description}
            </div>
          )}

          {/* Dates info */}
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <FiCalendar size={12} />
              {t('received_label')}: {format(new Date(task.createdAt), 'dd/MM/yyyy HH:mm', { locale: dateLocale })}
            </span>
            {task.deadline && (
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 dark:text-red-400' : isDueToday ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <FiClock size={12} />
                {t('deadline_at')}: {format(new Date(task.deadline), 'dd/MM/yyyy HH:mm', { locale: dateLocale })}
                {isOverdue && ` (${t('overdue')})`}
                {isDueToday && !isOverdue && ` (${t('due_today_label')})`}
              </span>
            )}
            {task.status === 'completed' && task.completedAt && (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <FiCheck size={12} />
                {t('done_at')}: {format(new Date(task.completedAt), 'dd/MM/yyyy HH:mm', { locale: dateLocale })}
              </span>
            )}
          </div>

          {/* Days counter */}
          {task.status !== 'completed' && daysReceived > 0 && (
            <div className={`inline-flex items-center text-xs px-2 py-1 rounded-full font-medium ${
              daysReceived >= 5 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              daysReceived >= 3 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
              'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              ⏱️ {daysReceived} {t('days_not_done')}
            </div>
          )}

          {/* Amount & Payments */}
          {task.amount > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-3">
              {/* Total amount header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiDollarSign className="text-primary-500" size={18} />
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {formatMoney(task.amount)}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  task.isPaid
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {task.isPaid ? `✓ ${t('paid_full')}` : t('not_paid_full')}
                </span>
              </div>

              {/* Payment progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{t('received_amount')}: <span className="text-green-600 dark:text-green-400 font-medium">{formatMoney(totalPaid)}</span></span>
                  <span>{t('remaining_amount')}: <span className={remainingAmount > 0 ? 'text-red-600 dark:text-red-400 font-medium' : 'text-green-600 dark:text-green-400 font-medium'}>{formatMoney(remainingAmount)}</span></span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      totalPaid >= task.amount ? 'bg-green-500' : 'bg-primary-500'
                    }`}
                    style={{ width: `${Math.min((totalPaid / task.amount) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Payment history */}
              {payments.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('payment_history')}:</span>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {payments.map((payment, index) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-green-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <span className="text-sm font-medium text-green-700 dark:text-green-400">
                              {formatMoney(payment.amount)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              {payment.note}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400">
                            {format(new Date(payment.date), 'dd/MM/yy')}
                          </span>
                          <button
                            onClick={() => handleDeletePayment(payment.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add new payment */}
              {remainingAmount > 0 && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newPaymentAmount}
                        onChange={(e) => {
                          // Format as money
                          const value = e.target.value.replace(/[^\d]/g, '');
                          if (value) {
                            setNewPaymentAmount(parseInt(value).toLocaleString('vi-VN'));
                          } else {
                            setNewPaymentAmount('');
                          }
                        }}
                        placeholder={t('amount_placeholder')}
                        className="flex-1 min-w-0 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        onClick={handleAddPayment}
                        disabled={!newPaymentAmount}
                        className="w-9 h-9 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white text-lg font-bold rounded-lg transition-colors flex-shrink-0 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    <input
                      type="text"
                      value={newPaymentNote}
                      onChange={(e) => setNewPaymentNote(e.target.value)}
                      placeholder={t('payment_note')}
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setNewPaymentAmount(remainingAmount.toLocaleString('vi-VN'));
                      setNewPaymentNote(t('pay_full'));
                    }}
                    className="mt-2 text-xs text-primary-500 hover:text-primary-600 hover:underline"
                  >
                    {t('fill_remaining')} ({formatMoney(remainingAmount)})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Checklist Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <FiCheckSquare size={16} />
                {t('checklist_label')}
                {totalChecks > 0 && (
                  <span className="text-xs text-gray-400 font-normal">
                    ({completedChecks}/{totalChecks})
                  </span>
                )}
              </h3>
              {totalChecks > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  checkProgress === 100
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {checkProgress}%
                </span>
              )}
            </div>

            {/* Progress bar */}
            {totalChecks > 0 && (
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    checkProgress === 100 ? 'bg-green-500' : 'bg-primary-500'
                  }`}
                  style={{ width: `${checkProgress}%` }}
                />
              </div>
            )}

            {/* Checklist items */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {checklist.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-2 p-2 rounded-lg group ${
                    item.completed ? 'bg-green-50 dark:bg-green-900/10' : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <button
                    onClick={() => handleToggleCheckItem(item.id)}
                    className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      item.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                    }`}
                  >
                    {item.completed && <FiCheck size={12} />}
                  </button>

                  {editingCheckId === item.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editingCheckText}
                        onChange={(e) => setEditingCheckText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEditCheckItem()}
                        className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEditCheckItem}
                        className="p-1 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded"
                      >
                        <FiCheck size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between">
                      <span className={`text-sm ${
                        item.completed
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : 'text-gray-700 dark:text-gray-200'
                      }`}>
                        {item.text}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        <button
                          onClick={() => handleStartEditCheckItem(item)}
                          className="p-1 text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <FiEdit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteCheckItem(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add new check item */}
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={newCheckItem}
                onChange={(e) => setNewCheckItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCheckItem()}
                placeholder={t('add_new_item')}
                className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
              />
              <button
                onClick={handleAddCheckItem}
                disabled={!newCheckItem.trim()}
                className="p-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <FiPlus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleComplete}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                task.status === 'completed'
                  ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
              }`}
            >
              <FiCheck size={16} />
              {task.status === 'completed' ? t('mark_incomplete') : t('mark_complete')}
            </button>

            <button
              onClick={handleToggleReminder}
              className={`p-2 rounded-lg transition-colors ${
                task.reminderEnabled
                  ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/30'
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={task.reminderEnabled ? t('turn_off_reminder') : t('turn_on_reminder')}
            >
              {task.reminderEnabled ? <FiBell size={16} /> : <FiBellOff size={16} />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300"
            >
              <FiEdit2 size={14} />
              {t('edit')}
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg text-red-600 dark:text-red-400"
            >
              <FiTrash2 size={14} />
              {t('delete')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailModal;
