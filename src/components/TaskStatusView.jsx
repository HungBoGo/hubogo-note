import React, { useState, useMemo } from 'react';
import {
  FiClock,
  FiCheckCircle,
  FiList,
  FiFilter,
  FiSearch
} from 'react-icons/fi';
import useStore from '../store/useStore';
import TaskItem from './TaskItem';
import { sortTasksByPriority, getWeights, QUADRANTS } from '../utils/priorityEngine';

function TaskStatusView() {
  const { tasks, categories, searchQuery } = useStore();
  const [activeTab, setActiveTab] = useState('all'); // all, pending, completed
  const [sortBy, setSortBy] = useState('priority'); // priority, date, deadline

  // Filter tasks by status and search
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      );
    }

    // Filter by tab
    if (activeTab === 'pending') {
      result = result.filter(t => t.status !== 'completed');
    } else if (activeTab === 'completed') {
      result = result.filter(t => t.status === 'completed');
    }

    // Sort
    if (sortBy === 'priority') {
      const weights = getWeights();
      result = sortTasksByPriority(result, weights);
    } else if (sortBy === 'date') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'deadline') {
      result.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      });
    }

    return result;
  }, [tasks, searchQuery, activeTab, sortBy]);

  // Count by status
  const counts = useMemo(() => ({
    all: tasks.length,
    pending: tasks.filter(t => t.status !== 'completed').length,
    completed: tasks.filter(t => t.status === 'completed').length
  }), [tasks]);

  // Get quadrant badge for task
  const getQuadrantBadge = (task) => {
    if (!task.evaluation) return null;
    const q = QUADRANTS[task.evaluation.quadrant];
    const colors = {
      Q1: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      Q2: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      Q3: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
      Q4: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
    };
    return (
      <span className={`text-xs px-1.5 py-0.5 rounded ${colors[task.evaluation.quadrant]}`}>
        {task.evaluation.quadrant}
      </span>
    );
  };

  const tabs = [
    { id: 'all', label: 'Tất cả', icon: FiList, count: counts.all },
    { id: 'pending', label: 'Đang làm', icon: FiClock, count: counts.pending },
    { id: 'completed', label: 'Hoàn thành', icon: FiCheckCircle, count: counts.completed }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header with tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FiList className="text-primary-500" />
            Trạng thái công việc
          </h1>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <FiFilter size={14} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="priority">Theo ưu tiên</option>
              <option value="date">Theo ngày tạo</option>
              <option value="deadline">Theo deadline</option>
            </select>
          </div>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600/50'
              }`}
            >
              <tab.icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id
                  ? 'bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-300'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'completed' ? (
                <FiCheckCircle className="text-gray-400" size={32} />
              ) : (
                <FiClock className="text-gray-400" size={32} />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {activeTab === 'completed' ? 'Chưa có việc hoàn thành' : 'Không có công việc'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {activeTab === 'completed'
                ? 'Hoàn thành việc đầu tiên để thấy ở đây!'
                : searchQuery
                  ? 'Không tìm thấy kết quả phù hợp'
                  : 'Thêm công việc mới để bắt đầu!'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <TaskItem task={task} showQuadrant={sortBy === 'priority'} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            Hiển thị {filteredTasks.length} / {tasks.length} công việc
          </span>
          <span>
            {counts.pending} đang làm • {counts.completed} hoàn thành
          </span>
        </div>
      </div>
    </div>
  );
}

export default TaskStatusView;
