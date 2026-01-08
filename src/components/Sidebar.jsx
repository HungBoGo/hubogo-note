import React, { useEffect, useState } from 'react';
import {
  FiCalendar,
  FiList,
  FiTarget,
  FiBarChart2,
  FiPlus,
  FiSearch,
  FiDollarSign,
  FiChevronDown,
  FiChevronUp,
  FiChevronLeft,
  FiChevronRight,
  FiInfo
} from 'react-icons/fi';
import useStore from '../store/useStore';

function Sidebar() {
  const {
    categories,
    tasks,
    selectedView,
    selectedCategory,
    setSelectedView,
    setSelectedCategory,
    openTaskForm,
    openCategoryForm,
    searchQuery,
    setSearchQuery,
    currency,
    setCurrency,
    exchangeRate,
    fetchExchangeRate
  } = useStore();

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // Fetch exchange rate on mount
  useEffect(() => {
    fetchExchangeRate();
  }, []);

  // Count tasks
  const allTasksCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount = tasks.filter(t => t.status !== 'completed').length;

  const menuItems = [
    { id: 'calendar', icon: FiCalendar, label: 'Lịch', count: allTasksCount, color: 'bg-blue-500' },
    { id: 'priority', icon: FiTarget, label: 'Ưu tiên', count: pendingCount, color: 'bg-red-500' },
    { id: 'status', icon: FiList, label: 'Trạng thái', count: allTasksCount, color: 'bg-orange-500' },
    { id: 'statistics', icon: FiBarChart2, label: 'Thống kê', count: null, color: 'bg-purple-500' },
    { id: 'about', icon: FiInfo, label: 'Thông tin', count: null, color: 'bg-gray-500' },
  ];

  // Get selected category name
  const selectedCategoryObj = categories.find(c => c.id === selectedCategory);

  return (
    <>
      {/* ===== MOBILE/TABLET HORIZONTAL HEADER (< lg) ===== */}
      <div className="lg:hidden bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 relative z-40">
        {/* Collapsible content */}
        <div className={`transition-all duration-300 ${isCollapsed ? 'max-h-0 overflow-hidden' : 'max-h-96'}`}>
          {/* Row 1: Search + Currency Toggle */}
          <div className="flex items-center gap-2 p-2">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {/* Currency Toggle */}
            <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-0.5 flex-shrink-0">
              <button
                onClick={() => setCurrency('VND')}
                className={`px-2 py-1.5 text-xs font-bold rounded-md transition-all ${
                  currency === 'VND'
                    ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                đ
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1.5 text-xs font-bold rounded-md transition-all ${
                  currency === 'USD'
                    ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                $
              </button>
            </div>
          </div>

          {/* Row 2: Quick stats - icon only grid for ultra compact */}
          <div className="flex justify-between gap-0.5 px-2 pb-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedView(item.id)}
                className={`flex-1 flex flex-col items-center py-1 rounded-lg transition-all min-w-0 ${
                  selectedView === item.id && !selectedCategory
                    ? 'bg-white dark:bg-gray-700 shadow-sm'
                    : 'hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className={`w-6 h-6 ${item.color} rounded flex items-center justify-center relative`}>
                  <item.icon className="text-white" size={12} />
                  {item.count !== null && item.count > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5">
                      {item.count > 99 ? '99+' : item.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Row 3: Category dropdown - full width */}
          <div className="px-2 pb-2 relative z-50">
            {/* Category Dropdown */}
            <div className="relative" style={{ zIndex: 100 }}>
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded-lg text-sm"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {selectedCategoryObj ? (
                    <>
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: selectedCategoryObj.color }}
                      />
                      <span className="text-gray-700 dark:text-gray-200 truncate">
                        {selectedCategoryObj.icon} {selectedCategoryObj.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-500 truncate">Danh mục</span>
                  )}
                </div>
                <FiChevronDown size={14} className={`text-gray-400 transition-transform flex-shrink-0 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-50 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedView('calendar');
                      setShowCategoryDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                  >
                    Tất cả danh mục
                  </button>
                  {categories.map(category => {
                    const categoryTaskCount = tasks.filter(t => t.categoryId === category.id).length;
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full px-3 py-2 flex items-center justify-between text-sm hover:bg-gray-100 dark:hover:bg-gray-600 ${
                          selectedCategory === category.id ? 'bg-primary-50 dark:bg-primary-900/30' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-gray-700 dark:text-gray-200">{category.icon} {category.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">{categoryTaskCount}</span>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => {
                      openCategoryForm();
                      setShowCategoryDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-600 border-t border-gray-200 dark:border-gray-600"
                  >
                    <FiPlus className="inline mr-1" size={12} /> Thêm danh mục
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toggle button - always visible */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full py-1 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {isCollapsed ? (
            <FiChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
          ) : (
            <FiChevronUp size={16} className="text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* ===== DESKTOP VERTICAL SIDEBAR (>= lg) ===== */}
      <div className={`hidden lg:flex h-full bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col transition-all duration-300 ${isDesktopCollapsed ? 'w-16' : 'w-56'}`}>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
          className="absolute top-1/2 -translate-y-1/2 -right-3 z-10 w-6 h-12 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-r-lg flex items-center justify-center text-gray-500 dark:text-gray-400 shadow-md"
          style={{ left: isDesktopCollapsed ? '52px' : '212px' }}
        >
          {isDesktopCollapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
        </button>

        {/* Search - only when expanded */}
        {!isDesktopCollapsed && (
          <div className="p-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Menu Items - Vertical List */}
        <div className={`${isDesktopCollapsed ? 'px-2 pt-3' : 'px-3'} space-y-1`}>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedView(item.id)}
              className={`w-full rounded-lg flex items-center transition-all ${
                isDesktopCollapsed ? 'p-2 justify-center' : 'px-3 py-2.5 gap-3'
              } ${
                selectedView === item.id && !selectedCategory
                  ? 'bg-white dark:bg-gray-700 shadow-md'
                  : 'hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
              title={isDesktopCollapsed ? item.label : ''}
            >
              <div className={`${item.color} rounded-lg flex items-center justify-center relative ${isDesktopCollapsed ? 'w-8 h-8' : 'w-8 h-8'}`}>
                <item.icon className="text-white" size={16} />
                {item.count !== null && item.count > 0 && isDesktopCollapsed && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {item.count > 99 ? '99+' : item.count}
                  </span>
                )}
              </div>
              {!isDesktopCollapsed && (
                <>
                  <span className="flex-1 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    {item.label}
                  </span>
                  {item.count !== null && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                      {item.count}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>

        {/* Divider & Categories - only when expanded */}
        {!isDesktopCollapsed && (
          <>
            <div className="px-3 py-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Danh mục
                </span>
                <button
                  onClick={() => openCategoryForm()}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Thêm danh mục"
                >
                  <FiPlus size={14} />
                </button>
              </div>
            </div>

            {/* Categories List */}
            <div className="flex-1 overflow-y-auto px-3 space-y-1">
              {categories.map(category => {
                const categoryTaskCount = tasks.filter(t => t.categoryId === category.id).length;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full px-3 py-2 rounded-lg flex items-center justify-between transition-all ${
                      selectedCategory === category.id
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm">{category.icon} {category.name}</span>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      selectedCategory === category.id
                        ? 'bg-primary-200 dark:bg-primary-800 text-primary-700 dark:text-primary-300'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}>
                      {categoryTaskCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Currency Selector */}
            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <FiDollarSign size={12} />
                  Tiền tệ
                </span>
                <span className="text-xs text-gray-400">
                  1$ = {exchangeRate.toLocaleString()}đ
                </span>
              </div>
              <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                <button
                  onClick={() => setCurrency('VND')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                    currency === 'VND'
                      ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  VND
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                    currency === 'USD'
                      ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  USD
                </button>
              </div>
            </div>
          </>
        )}

        {/* Add Task Button */}
        <div className={`p-3 border-t border-gray-200 dark:border-gray-700 ${isDesktopCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={() => openTaskForm()}
            className={`bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-medium ${
              isDesktopCollapsed ? 'w-10 h-10' : 'w-full py-2.5'
            }`}
            title={isDesktopCollapsed ? 'Thêm công việc' : ''}
          >
            <FiPlus size={18} />
            {!isDesktopCollapsed && 'Thêm công việc'}
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
