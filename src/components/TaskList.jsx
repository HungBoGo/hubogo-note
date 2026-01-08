import React, { useMemo } from 'react';
import { FiPlus } from 'react-icons/fi';
import useStore from '../store/useStore';
import TaskItem from './TaskItem';
import CalendarView from './CalendarView';
import AboutView from './AboutView';

function TaskList() {
  const {
    getFilteredTasks,
    selectedView,
    selectedCategory,
    categories,
    openTaskForm
  } = useStore();

  const tasks = getFilteredTasks();

  // Use CalendarView for "calendar" view
  if (selectedView === 'calendar') {
    return <CalendarView />;
  }

  // Use AboutView for "about" view
  if (selectedView === 'about') {
    return <AboutView />;
  }

  // Get title based on view
  const getTitle = () => {
    switch (selectedView) {
      case 'pending':
        return 'Đang thực hiện';
      case 'completed':
        return 'Đã hoàn thành';
      case 'category':
        const cat = categories.find(c => c.id === selectedCategory);
        return cat ? `${cat.icon} ${cat.name}` : 'Danh mục';
      default:
        return 'Công việc';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-primary-500">
              {getTitle()}
            </h1>
            <span className="text-2xl font-bold text-primary-500">
              {tasks.length}
            </span>
          </div>
          <button
            onClick={() => openTaskForm()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
            title="Thêm công việc mới"
          >
            <FiPlus size={20} />
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-lg">Chưa có công việc nào</p>
            <button
              onClick={() => openTaskForm()}
              className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Thêm công việc đầu tiên
            </button>
          </div>
        ) : (
          // Simple list view
          <div className="space-y-2">
            {tasks.map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskList;
