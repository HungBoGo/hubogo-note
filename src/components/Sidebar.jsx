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
  FiInfo,
  FiGlobe,
  FiPower
} from 'react-icons/fi';
import { enable, disable, isEnabled } from '@tauri-apps/plugin-autostart';
import useStore from '../store/useStore';
import { useTranslation } from '../utils/i18n';

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

  const { t, language, toggleLanguage } = useTranslation();
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [autostartEnabled, setAutostartEnabled] = useState(false);
  const [autostartLoading, setAutostartLoading] = useState(true);

  // Fetch exchange rate on mount
  useEffect(() => {
    fetchExchangeRate();
  }, []);

  // Check autostart status on mount
  useEffect(() => {
    const checkAutostart = async () => {
      try {
        const enabled = await isEnabled();
        setAutostartEnabled(enabled);
      } catch (err) {
        console.error('Failed to check autostart status:', err);
      } finally {
        setAutostartLoading(false);
      }
    };
    checkAutostart();
  }, []);

  // Toggle autostart
  const handleToggleAutostart = async () => {
    setAutostartLoading(true);
    try {
      if (autostartEnabled) {
        await disable();
        setAutostartEnabled(false);
      } else {
        await enable();
        setAutostartEnabled(true);
      }
    } catch (err) {
      console.error('Failed to toggle autostart:', err);
      const errMsg = language === 'vi'
        ? 'Không thể thay đổi cài đặt khởi động. Vui lòng thử lại.'
        : 'Cannot change startup settings. Please try again.';
      alert(errMsg);
    } finally {
      setAutostartLoading(false);
    }
  };

  // Count tasks
  const allTasksCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount = tasks.filter(t => t.status !== 'completed').length;

  const menuItems = [
    { id: 'calendar', icon: FiCalendar, label: language === 'vi' ? 'Lịch' : 'Calendar', tooltip: t('menu_calendar'), count: allTasksCount, color: 'bg-blue-500' },
    { id: 'priority', icon: FiTarget, label: language === 'vi' ? 'Ưu tiên' : 'Priority', tooltip: t('menu_priority'), count: pendingCount, color: 'bg-red-500' },
    { id: 'status', icon: FiList, label: language === 'vi' ? 'Trạng thái' : 'Status', tooltip: t('menu_status'), count: allTasksCount, color: 'bg-orange-500' },
    { id: 'statistics', icon: FiBarChart2, label: language === 'vi' ? 'Thống kê' : 'Statistics', tooltip: t('menu_statistics'), count: null, color: 'bg-purple-500' },
    { id: 'about', icon: FiInfo, label: language === 'vi' ? 'Thông tin' : 'About', tooltip: t('menu_about'), count: null, color: 'bg-gray-500' },
  ];

  // Get selected category name
  const selectedCategoryObj = categories.find(c => c.id === selectedCategory);

  return (
    <>
      {/* ===== MOBILE/TABLET HORIZONTAL HEADER (< lg) ===== */}
      <div className="lg:hidden bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 relative z-40">
        {/* Collapsible content */}
        <div className={`transition-all duration-300 ${isCollapsed ? 'max-h-0 overflow-hidden' : 'max-h-96'}`}>
          {/* Row 1: Search */}
          <div className="flex items-center gap-2 p-2">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Row 2: Quick stats - icon only grid for ultra compact */}
          <div className="flex justify-between gap-0.5 px-2 pb-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedView(item.id)}
                title={item.tooltip}
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

          {/* Row 3: Compact Settings Row for Mobile */}
          <div className="px-2 pb-2">
            <div className="flex items-center gap-2">
              {/* Autostart Toggle - Switch Style */}
              <button
                onClick={handleToggleAutostart}
                disabled={autostartLoading}
                title={language === 'vi' ? 'Khởi động cùng Windows' : 'Start with Windows'}
                className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                  autostartLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                } bg-gray-200 dark:bg-gray-700`}
              >
                <FiPower size={12} className={autostartEnabled ? 'text-green-500' : 'text-gray-400'} />
                <span className="text-gray-600 dark:text-gray-300">
                  {language === 'vi' ? 'Auto' : 'Auto'}
                </span>
                <div className={`relative w-8 h-4 rounded-full transition-colors ${
                  autostartEnabled ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-500'
                }`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${
                    autostartEnabled ? 'left-4' : 'left-0.5'
                  }`} />
                </div>
              </button>

              {/* Language Toggle */}
              <div className="flex-1 flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-0.5">
                <button
                  onClick={() => language !== 'vi' && toggleLanguage()}
                  className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
                    language === 'vi'
                      ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  VI
                </button>
                <button
                  onClick={() => language !== 'en' && toggleLanguage()}
                  className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
                    language === 'en'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Currency Toggle */}
              <div className="flex-1 flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-0.5">
                <button
                  onClick={() => setCurrency('VND')}
                  className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${
                    currency === 'VND'
                      ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  đ
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${
                    currency === 'USD'
                      ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  $
                </button>
              </div>
            </div>
          </div>

          {/* Row 4: Category dropdown - full width */}
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
                    <span className="text-gray-500 truncate">{t('category')}</span>
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
                    {t('all_categories_dropdown')}
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
                    <FiPlus className="inline mr-1" size={12} /> {t('add_category')}
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
                placeholder={t('search')}
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
              title={item.tooltip}
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
                  {t('categories')}
                </span>
                <button
                  onClick={() => openCategoryForm()}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title={t('add_category')}
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

            {/* Compact Settings Row: Autostart | Language | Currency */}
            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                {/* Autostart Toggle - Switch Style */}
                <button
                  onClick={handleToggleAutostart}
                  disabled={autostartLoading}
                  title={language === 'vi' ? 'Khởi động cùng Windows' : 'Start with Windows'}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                    autostartLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                  } bg-gray-200 dark:bg-gray-700`}
                >
                  <FiPower size={12} className={autostartEnabled ? 'text-green-500' : 'text-gray-400'} />
                  <span className="text-gray-600 dark:text-gray-300">Auto</span>
                  <div className={`relative w-8 h-4 rounded-full transition-colors ${
                    autostartEnabled ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-500'
                  }`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${
                      autostartEnabled ? 'left-4' : 'left-0.5'
                    }`} />
                  </div>
                </button>

                {/* Language Toggle */}
                <div className="flex-1 flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-0.5">
                  <button
                    onClick={() => language !== 'vi' && toggleLanguage()}
                    className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
                      language === 'vi'
                        ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    VI
                  </button>
                  <button
                    onClick={() => language !== 'en' && toggleLanguage()}
                    className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
                      language === 'en'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    EN
                  </button>
                </div>

                {/* Currency Toggle */}
                <div className="flex-1 flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-0.5">
                  <button
                    onClick={() => setCurrency('VND')}
                    className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${
                      currency === 'VND'
                        ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    đ
                  </button>
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${
                      currency === 'USD'
                        ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    $
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Compact Settings for collapsed mode */}
        {isDesktopCollapsed && (
          <div className="px-2 py-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
            {/* Autostart */}
            <button
              onClick={handleToggleAutostart}
              disabled={autostartLoading}
              title={language === 'vi'
                ? (autostartEnabled ? 'Khởi động cùng Windows: BẬT' : 'Khởi động cùng Windows: TẮT')
                : (autostartEnabled ? 'Start with Windows: ON' : 'Start with Windows: OFF')}
              className={`w-full flex items-center justify-center p-2 rounded-lg transition-all ${
                autostartEnabled
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-gray-200 dark:bg-gray-700'
              } ${autostartLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
            >
              <FiPower size={16} className={autostartEnabled ? 'text-green-500' : 'text-gray-400'} />
            </button>
            {/* Language */}
            <button
              onClick={toggleLanguage}
              title={language === 'vi' ? 'English' : 'Tiếng Việt'}
              className="w-full flex items-center justify-center p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:opacity-80 transition-all"
            >
              {language === 'vi' ? '🇻🇳' : '🇺🇸'}
            </button>
            {/* Currency */}
            <button
              onClick={() => setCurrency(currency === 'VND' ? 'USD' : 'VND')}
              title={currency === 'VND' ? 'USD' : 'VND'}
              className="w-full flex items-center justify-center p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:opacity-80 transition-all text-xs font-bold"
            >
              {currency === 'VND' ? 'đ' : '$'}
            </button>
          </div>
        )}

        {/* Add Task Button */}
        <div className={`p-3 border-t border-gray-200 dark:border-gray-700 ${isDesktopCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={() => openTaskForm()}
            className={`bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-medium ${
              isDesktopCollapsed ? 'w-10 h-10' : 'w-full py-2.5'
            }`}
            title={isDesktopCollapsed ? (language === 'vi' ? 'Thêm công việc' : 'Add Task') : ''}
          >
            <FiPlus size={18} />
            {!isDesktopCollapsed && (language === 'vi' ? 'Thêm công việc' : 'Add Task')}
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
