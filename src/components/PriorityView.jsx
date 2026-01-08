import React, { useMemo } from 'react';
import {
  FiTarget,
  FiClock,
  FiTrendingUp,
  FiAlertCircle,
  FiCheckCircle,
  FiCalendar,
  FiDollarSign,
  FiZap
} from 'react-icons/fi';
import useStore from '../store/useStore';
import TaskItem from './TaskItem';
import {
  getTodayFocus,
  generateBanners,
  categorizeTasksByType,
  getSmartAdvice,
  QUADRANTS,
  getWeights
} from '../utils/priorityEngine';

function PriorityView() {
  const { tasks, categories, currency, exchangeRate, getUncheckedLongTermTasks, dailyCheckin } = useStore();

  // Get today's stats
  const stats = useMemo(() => {
    const pending = tasks.filter(t => t.status !== 'completed');
    const completed = tasks.filter(t => t.status === 'completed');
    const totalAmount = tasks.reduce((sum, t) => sum + (t.amount || 0), 0);
    const paidAmount = tasks.filter(t => t.isPaid).reduce((sum, t) => sum + (t.amount || 0), 0);
    const unpaidAmount = totalAmount - paidAmount;

    return {
      total: tasks.length,
      pending: pending.length,
      completed: completed.length,
      completionRate: tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0,
      totalAmount,
      paidAmount,
      unpaidAmount
    };
  }, [tasks]);

  // Get priority-sorted tasks
  const weights = getWeights();
  const todayFocus = useMemo(() => {
    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    return getTodayFocus(pendingTasks, weights);
  }, [tasks, weights]);

  // Generate banners
  const banners = useMemo(() => generateBanners(stats, tasks), [stats, tasks]);

  // Get unchecked long-term projects
  const uncheckedLongTermTasks = useMemo(() => getUncheckedLongTermTasks(), [tasks]);

  // Categorize by task type (income vs investment)
  const tasksByType = useMemo(() => categorizeTasksByType(tasks, weights), [tasks, weights]);

  // Get smart advice
  const advice = useMemo(() => getSmartAdvice(tasks, stats), [tasks, stats]);

  // Format currency
  const formatMoney = (amount) => {
    if (currency === 'USD') {
      return `$${Math.round(amount / exchangeRate).toLocaleString()}`;
    }
    return `${amount.toLocaleString()}đ`;
  };

  // Get quadrant color classes
  const getQuadrantStyles = (quadrant) => {
    switch (quadrant) {
      case 'Q1': return { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-600 dark:text-red-400' };
      case 'Q2': return { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-600 dark:text-blue-400' };
      case 'Q3': return { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-600 dark:text-amber-400' };
      default: return { bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', text: 'text-gray-600 dark:text-gray-400' };
    }
  };

  // Banner color styles
  const getBannerStyles = (color) => {
    const styles = {
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400',
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
      amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400',
      red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
      yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400',
      orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400'
    };
    return styles[color] || styles.blue;
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FiTarget className="text-primary-500" />
            Đánh giá & Ưu tiên
          </h1>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>

        {/* Long-term Projects Reminder - PRIORITY BANNER */}
        {uncheckedLongTermTasks.length > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <FiTarget size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">🎯 Dự án dài hạn chờ điểm danh!</h3>
                <p className="text-sm text-white/80">
                  {uncheckedLongTermTasks.length} dự án chưa được điểm danh hôm nay
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {uncheckedLongTermTasks.slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center justify-between bg-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔥</span>
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-xs text-white/70">
                        Streak: {task.currentStreak || 0} ngày
                        {task.longestStreak > 0 && ` • Kỷ lục: ${task.longestStreak}`}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => dailyCheckin(task.id)}
                    className="px-3 py-1.5 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 active:scale-95 transition-all flex items-center gap-1"
                  >
                    <FiZap size={14} />
                    Điểm danh
                  </button>
                </div>
              ))}
            </div>
            {uncheckedLongTermTasks.length > 3 && (
              <p className="text-xs text-white/60 mt-2 text-center">
                +{uncheckedLongTermTasks.length - 3} dự án khác
              </p>
            )}
          </div>
        )}

        {/* Banners - Motivational & Warnings */}
        {banners.length > 0 && (
          <div className="space-y-2">
            {banners.map((banner, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl border ${getBannerStyles(banner.color)} flex items-center gap-3`}
              >
                <span className="text-2xl">{banner.icon}</span>
                <div>
                  <div className="font-semibold">{banner.title}</div>
                  <div className="text-sm opacity-80">{banner.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== SMART ADVICE ===== */}
        {advice.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {advice.map((item, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl border-2 ${
                  item.type === 'income' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' :
                  item.type === 'investment' ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' :
                  'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{item.icon}</span>
                  <span className={`font-semibold text-sm ${
                    item.type === 'income' ? 'text-green-700 dark:text-green-400' :
                    item.type === 'investment' ? 'text-blue-700 dark:text-blue-400' :
                    'text-purple-700 dark:text-purple-400'
                  }`}>{item.title}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{item.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* ===== INCOME TASKS - KIẾM TIỀN NUÔI GIA ĐÌNH ===== */}
        {tasksByType.income.urgent.length > 0 && (
          <div className="rounded-2xl border-2 border-green-300 dark:border-green-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiDollarSign className="text-white" size={22} />
              </div>
              <div>
                <h2 className="font-bold text-green-700 dark:text-green-400 text-lg">
                  💰 KIẾM TIỀN NUÔI GIA ĐÌNH
                </h2>
                <p className="text-xs text-green-600 dark:text-green-500">
                  Ưu tiên làm trước để có thu nhập • {tasksByType.income.urgent.length} việc gấp
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {tasksByType.income.urgent.map(task => (
                <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-green-100 dark:border-green-800">
                  <TaskItem task={task} compact />
                  <div className="mt-2 flex flex-wrap gap-1">
                    {task.amount > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-medium">
                        💵 {formatMoney(task.amount)}
                      </span>
                    )}
                    {task.evaluation.reasons.slice(0, 2).map((reason, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {tasksByType.income.important.length > 0 && (
              <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                <p className="text-xs text-green-600 dark:text-green-500 mb-2 font-medium">
                  📋 Việc kiếm tiền quan trọng khác:
                </p>
                <div className="space-y-1">
                  {tasksByType.income.important.map(task => (
                    <div key={task.id} className="flex items-center justify-between bg-white/50 dark:bg-gray-800/50 rounded-lg p-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{task.title}</span>
                      {task.amount > 0 && (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium flex-shrink-0 ml-2">
                          {formatMoney(task.amount)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== INVESTMENT TASKS - ĐẦU TƯ TƯƠNG LAI ===== */}
        {tasksByType.investment.all.length > 0 && (
          <div className="rounded-2xl border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiTrendingUp className="text-white" size={22} />
              </div>
              <div>
                <h2 className="font-bold text-blue-700 dark:text-blue-400 text-lg">
                  🚀 ĐẦU TƯ TƯƠNG LAI
                </h2>
                <p className="text-xs text-blue-600 dark:text-blue-500">
                  Dự án dài hạn, xây dựng giá trị • {tasksByType.investment.all.length} dự án
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {tasksByType.investment.all.slice(0, 5).map(task => (
                <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-blue-100 dark:border-blue-800">
                  <TaskItem task={task} compact />
                  <div className="mt-2 flex flex-wrap gap-1">
                    {task.isLongTerm && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                        🎯 Streak: {task.currentStreak || 0} ngày
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                      📅 {task.evaluation.quadrantInfo.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-xl">
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                💡 Gợi ý: Block 1-2 tiếng mỗi ngày cho dự án đầu tư. Dù không tạo tiền ngay, đây là nền tảng cho tương lai!
              </p>
            </div>
          </div>
        )}

        {/* ===== OTHER Q1/Q3 TASKS ===== */}
        {todayFocus.delegate.length > 0 && (
          <div className={`rounded-2xl border-2 ${getQuadrantStyles('Q3').border} ${getQuadrantStyles('Q3').bg} p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <FiClock className="text-white" size={18} />
              </div>
              <div>
                <h2 className={`font-bold ${getQuadrantStyles('Q3').text}`}>
                  🔄 CÂN NHẮC ỦY QUYỀN
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Gấp nhưng không quan trọng - Làm nhanh hoặc nhờ người khác
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {todayFocus.delegate.map(task => (
                <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
                  <TaskItem task={task} compact />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {todayFocus.topPriority.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="text-green-500" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Không có việc nào cần làm!
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Bạn đã hoàn thành tất cả công việc. Nghỉ ngơi đi! 🎉
            </p>
          </div>
        )}

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-2xl p-4 border border-primary-100 dark:border-primary-800">
          <h3 className="font-semibold text-primary-700 dark:text-primary-400 mb-2 flex items-center gap-2">
            <FiZap size={16} />
            Gợi ý làm việc hiệu quả
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>• <strong>Q1</strong> - Làm ngay, không trì hoãn</li>
            <li>• <strong>Q2</strong> - Block lịch 90 phút để tập trung</li>
            <li>• <strong>Q3</strong> - Làm nhanh hoặc nhờ người khác</li>
            <li>• <strong>Q4</strong> - Loại bỏ hoặc làm khi rảnh</li>
          </ul>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-primary-500">{stats.pending}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Đang làm</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Hoàn thành</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.completionRate}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Tỷ lệ</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-amber-500">{formatMoney(stats.unpaidAmount)}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Chưa thu</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PriorityView;
