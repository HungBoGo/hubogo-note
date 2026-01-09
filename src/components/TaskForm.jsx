import React, { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiDollarSign, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import useStore from '../store/useStore';
import { useTranslation } from '../utils/i18n';

function TaskForm() {
  const { closeTaskForm, editingTask, addTask, updateTask, categories } = useStore();
  const { t, language } = useTranslation();

  // Get current datetime in local format for input
  const getCurrentDateTime = () => {
    const now = new Date();
    return format(now, "yyyy-MM-dd'T'HH:mm");
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: categories[0]?.id || null,
    priority: 'normal',
    importance: 1,  // 0-3: Mức độ quan trọng
    taskType: 'income', // 'income' = kiếm tiền, 'investment' = đầu tư dài hạn
    amount: '',
    receivedAt: getCurrentDateTime(), // Ngày giờ nhận việc
    deadline: '',
    reminderEnabled: true,
    isLongTerm: false  // Dự án dài hạn cần điểm danh hàng ngày
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        categoryId: editingTask.categoryId || categories[0]?.id,
        priority: editingTask.originalPriority || editingTask.priority || 'normal',
        importance: editingTask.importance ?? 1,
        taskType: editingTask.taskType || 'income',
        amount: editingTask.amount || '',
        receivedAt: editingTask.createdAt ? format(new Date(editingTask.createdAt), "yyyy-MM-dd'T'HH:mm") : getCurrentDateTime(),
        deadline: editingTask.deadline ? format(new Date(editingTask.deadline), "yyyy-MM-dd'T'HH:mm") : '',
        reminderEnabled: editingTask.reminderEnabled !== false,
        isLongTerm: editingTask.isLongTerm || false
      });
    }
  }, [editingTask, categories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = t('task_name_required');
    }
    if (!formData.categoryId) {
      newErrors.categoryId = t('category_required');
    }
    if (!formData.receivedAt) {
      newErrors.receivedAt = t('received_required');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const taskData = {
      ...formData,
      amount: formData.amount ? parseFloat(formData.amount) : 0,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      categoryId: parseInt(formData.categoryId),
      createdAt: new Date(formData.receivedAt).toISOString(),
      originalPriority: formData.priority,
      importance: parseInt(formData.importance),
      // Auto-set urgency from priority for backward compatibility
      urgency: formData.priority === 'very-urgent' ? 3 : formData.priority === 'urgent' ? 2 : 1,
      // Auto-set cash_now if amount > 0
      cash_now: formData.amount && parseFloat(formData.amount) > 0 ? 2 : 0,
      // Long-term project tracking
      isLongTerm: formData.isLongTerm,
      // Task type
      taskType: formData.taskType
    };

    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }

    closeTaskForm();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeTaskForm();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl animate-slide-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {editingTask ? t('edit_task') : t('add_new_task')}
          </h2>
          <button
            onClick={closeTaskForm}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('task_name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('task_name_placeholder')}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('task_description')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('description_placeholder')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Task Type - Income vs Investment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('task_type')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, taskType: 'income' }))}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  formData.taskType === 'income'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">💰</span>
                  <div>
                    <div className={`font-medium ${formData.taskType === 'income' ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {t('task_type_income')}
                    </div>
                    <div className="text-xs text-gray-500">{t('task_type_income_desc')}</div>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, taskType: 'investment' }))}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  formData.taskType === 'investment'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚀</span>
                  <div>
                    <div className={`font-medium ${formData.taskType === 'investment' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {t('task_type_invest')}
                    </div>
                    <div className="text-xs text-gray-500">{t('task_type_invest_desc')}</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('category_label')} <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId || ''}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.categoryId ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
              }`}
            >
              <option value="">{t('select_category')}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Importance & Priority (Urgency) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ⭐ {t('importance_label')}
              </label>
              <select
                name="importance"
                value={formData.importance}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={0}>⚪ {t('importance_0')}</option>
                <option value={1}>🔵 {t('importance_1')}</option>
                <option value={2}>🟡 {t('importance_2')}</option>
                <option value={3}>⭐ {t('importance_3')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ⏰ {t('urgency_label')}
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="normal">🔵 {t('urgency_normal')}</option>
                <option value="urgent">🟠 {t('urgency_urgent')}</option>
                <option value="very-urgent">🔴 {t('urgency_very_urgent')}</option>
              </select>
            </div>
          </div>

          {/* Ngày giờ nhận việc */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              📅 {t('received_date')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="datetime-local"
                name="receivedAt"
                value={formData.receivedAt}
                onChange={handleChange}
                className={`w-full pl-9 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.receivedAt ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                }`}
              />
            </div>
            {errors.receivedAt && (
              <p className="mt-1 text-xs text-red-500">{errors.receivedAt}</p>
            )}
          </div>

          {/* Amount & Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                💰 {t('amount_vnd')}
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ⏰ {t('deadline_label')}
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="datetime-local"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Long-term Project Toggle */}
          <div className="flex items-center justify-between py-2 px-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                🎯 {t('long_term_project')}
              </span>
              <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5">
                {t('long_term_desc')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isLongTerm"
                checked={formData.isLongTerm}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
            </label>
          </div>

          {/* Reminder Toggle */}
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              🔔 {t('reminder_toggle')}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="reminderEnabled"
                checked={formData.reminderEnabled}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeTaskForm}
              className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              {editingTask ? t('update') : t('add_new')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;
