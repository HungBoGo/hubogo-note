import React, { useState, useMemo } from 'react';
import {
  FiCalendar,
  FiTrendingUp,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiUpload,
  FiPieChart,
  FiAlertTriangle,
  FiAlertCircle,
  FiActivity,
  FiAward,
  FiZap,
  FiTarget,
  FiStar,
  FiDatabase
} from 'react-icons/fi';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, differenceInDays, eachDayOfInterval, eachWeekOfInterval, subWeeks, subMonths, isToday, isYesterday, startOfDay } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { save, open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';
import { exportData, importData } from '../database/db';
import useStore from '../store/useStore';
import { useTranslation } from '../utils/i18n';

function Statistics() {
  const { tasks, categories, formatMoney, formatMoneyShort, currency } = useStore();
  const { t, language } = useTranslation();
  const [period, setPeriod] = useState('month');
  const [chartType, setChartType] = useState('total'); // total, completed, money
  const [hoveredPoint, setHoveredPoint] = useState(null); // For tooltip
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [customRange, setCustomRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const dateLocale = language === 'vi' ? vi : enUS;

  // Calculate date range
  const dateRange = useMemo(() => {
    const now = new Date();
    switch (period) {
      case 'today':
        return { start: new Date(now.setHours(0, 0, 0, 0)), end: new Date(now.setHours(23, 59, 59, 999)) };
      case 'week':
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'custom':
        return { start: new Date(customRange.start), end: new Date(customRange.end) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  }, [period, customRange]);

  // Filter tasks by date range
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= dateRange.start && taskDate <= dateRange.end;
    });
  }, [tasks, dateRange]);

  // ============ CHART DATA ============
  const chartData = useMemo(() => {
    const now = new Date();
    let intervals = [];
    let labelFormat = 'dd/MM';
    let useWeekLabel = false;

    if (period === 'today') {
      intervals = Array.from({ length: 24 }, (_, i) => {
        const date = new Date(now);
        date.setHours(i, 0, 0, 0);
        return { start: date, end: new Date(date.getTime() + 3600000 - 1) };
      });
      labelFormat = 'HH:mm';
    } else if (period === 'week') {
      intervals = eachDayOfInterval({ start: dateRange.start, end: dateRange.end }).map(date => ({
        start: new Date(date.setHours(0, 0, 0, 0)),
        end: new Date(new Date(date).setHours(23, 59, 59, 999))
      }));
      labelFormat = 'EEE';
    } else {
      const weeks = eachWeekOfInterval({ start: dateRange.start, end: dateRange.end }, { weekStartsOn: 1 });
      intervals = weeks.map((weekStart, i) => ({
        start: weekStart,
        end: i < weeks.length - 1 ? new Date(weeks[i + 1].getTime() - 1) : dateRange.end
      }));
      useWeekLabel = true;
    }

    return intervals.map((interval, index) => {
      const tasksInPeriod = tasks.filter(t => {
        const taskDate = new Date(t.createdAt);
        return taskDate >= interval.start && taskDate <= interval.end;
      });

      const completedInPeriod = tasks.filter(t => {
        if (t.status !== 'completed' || !t.completedAt) return false;
        const completedDate = new Date(t.completedAt);
        return completedDate >= interval.start && completedDate <= interval.end;
      });

      // Generate label
      let label;
      if (useWeekLabel) {
        label = `${t('week_label')} ${index + 1}`;
      } else {
        label = format(interval.start, labelFormat, { locale: dateLocale });
      }

      return {
        label,
        total: tasksInPeriod.length,
        completed: completedInPeriod.length,
        money: tasksInPeriod.reduce((sum, t) => sum + (t.amount || 0), 0),
        pending: tasksInPeriod.filter(t => t.status !== 'completed').length
      };
    });
  }, [tasks, dateRange, period, t, dateLocale]);

  // Calculate max value for chart scaling - round up to nearest 5
  const chartMax = useMemo(() => {
    const values = chartData.map(d => d[chartType] || 0);
    const maxVal = Math.max(...values, 1);
    return Math.ceil(maxVal / 5) * 5 || 5; // Round up to nearest 5, minimum 5
  }, [chartData, chartType]);

  // ============ PENDING TASKS ANALYSIS - Việc chưa xong ============
  const pendingAnalysis = useMemo(() => {
    const pendingTasks = tasks.filter(t => t.status !== 'completed');

    const normal = pendingTasks.filter(t => t.priority === 'normal').length;
    const urgent = pendingTasks.filter(t => t.priority === 'urgent').length;
    const veryUrgent = pendingTasks.filter(t => t.priority === 'very-urgent').length;

    const total = pendingTasks.length;
    const criticalPercent = total > 0 ? Math.round(((urgent + veryUrgent) / total) * 100) : 0;

    // Tính số ngày trung bình đã chờ
    const avgWaitingDays = total > 0
      ? Math.round(pendingTasks.reduce((sum, t) => sum + differenceInDays(new Date(), new Date(t.createdAt)), 0) / total)
      : 0;

    return {
      total,
      normal,
      urgent,
      veryUrgent,
      criticalPercent,
      avgWaitingDays
    };
  }, [tasks]);

  // ============ BASIC STATS ============
  const stats = useMemo(() => {
    const completed = filteredTasks.filter(t => t.status === 'completed');
    const pending = filteredTasks.filter(t => t.status !== 'completed');
    const totalAmount = filteredTasks.reduce((sum, t) => sum + (t.amount || 0), 0);
    const paidAmount = filteredTasks.filter(t => t.isPaid).reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      total: filteredTasks.length,
      completed: completed.length,
      pending: pending.length,
      completionRate: filteredTasks.length > 0 ? Math.round((completed.length / filteredTasks.length) * 100) : 0,
      totalAmount,
      paidAmount,
      unpaidAmount: totalAmount - paidAmount
    };
  }, [filteredTasks]);

  // ============ DEADLINE STATS - Completed tasks analysis ============
  const deadlineStats = useMemo(() => {
    const completedTasks = filteredTasks.filter(t => t.status === 'completed');

    const doneNormal = completedTasks.filter(t => {
      const original = t.originalPriority || t.priority;
      return original === 'normal' && !t.autoUpgraded;
    }).length;

    const doneUrgent = completedTasks.filter(t => {
      const original = t.originalPriority || t.priority;
      return original === 'urgent' || (original === 'normal' && t.autoUpgraded && t.priority === 'urgent');
    }).length;

    const doneVeryUrgent = completedTasks.filter(t => t.priority === 'very-urgent').length;

    const avgDaysToComplete = completedTasks.length > 0
      ? Math.round(completedTasks.reduce((sum, t) => {
          return sum + differenceInDays(new Date(t.completedAt || t.updatedAt), new Date(t.createdAt));
        }, 0) / completedTasks.length)
      : 0;

    const autoUpgraded = filteredTasks.filter(t => t.autoUpgraded).length;

    return { doneNormal, doneUrgent, doneVeryUrgent, avgDaysToComplete, autoUpgraded, total: completedTasks.length };
  }, [filteredTasks]);

  // ============ STREAK & ACHIEVEMENTS ============
  const streakData = useMemo(() => {
    // Tính streak - số ngày liên tiếp có hoàn thành việc
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.completedAt);

    // Nhóm theo ngày
    const completedByDay = {};
    completedTasks.forEach(t => {
      const day = format(new Date(t.completedAt), 'yyyy-MM-dd');
      completedByDay[day] = (completedByDay[day] || 0) + 1;
    });

    // Tính current streak
    let currentStreak = 0;
    let checkDate = startOfDay(new Date());

    // Nếu hôm nay chưa xong việc nào, bắt đầu từ hôm qua
    const todayKey = format(checkDate, 'yyyy-MM-dd');
    if (!completedByDay[todayKey]) {
      checkDate = subDays(checkDate, 1);
    }

    while (true) {
      const dayKey = format(checkDate, 'yyyy-MM-dd');
      if (completedByDay[dayKey]) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    // Tính best streak (all time)
    const sortedDays = Object.keys(completedByDay).sort();
    let bestStreak = 0;
    let tempStreak = 0;
    let prevDate = null;

    sortedDays.forEach(day => {
      if (prevDate) {
        const diff = differenceInDays(new Date(day), new Date(prevDate));
        if (diff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      bestStreak = Math.max(bestStreak, tempStreak);
      prevDate = day;
    });

    // Số việc xong hôm nay
    const todayCompleted = completedByDay[format(new Date(), 'yyyy-MM-dd')] || 0;

    return { currentStreak, bestStreak, todayCompleted };
  }, [tasks]);

  // ============ ACHIEVEMENTS/BADGES ============
  const achievements = useMemo(() => {
    const allCompleted = tasks.filter(t => t.status === 'completed');
    const allPending = tasks.filter(t => t.status !== 'completed');
    const totalAmount = tasks.reduce((sum, t) => sum + (t.amount || 0), 0);
    const paidAmount = tasks.filter(t => t.isPaid).reduce((sum, t) => sum + (t.amount || 0), 0);

    const badges = [];

    // Badge: Người mới bắt đầu (1 việc đầu tiên)
    if (allCompleted.length >= 1) {
      badges.push({
        id: 'first_task',
        icon: '🎉',
        title: 'Khởi đầu!',
        desc: 'Hoàn thành việc đầu tiên',
        earned: true,
        color: 'bg-green-500'
      });
    }

    // Badge: 5 việc hoàn thành
    if (allCompleted.length >= 5) {
      badges.push({
        id: 'five_done',
        icon: '⭐',
        title: 'Siêng năng',
        desc: 'Hoàn thành 5 công việc',
        earned: true,
        color: 'bg-yellow-500'
      });
    }

    // Badge: 20 việc hoàn thành
    if (allCompleted.length >= 20) {
      badges.push({
        id: 'twenty_done',
        icon: '🏆',
        title: 'Chuyên nghiệp',
        desc: 'Hoàn thành 20 công việc',
        earned: true,
        color: 'bg-amber-500'
      });
    }

    // Badge: 50 việc hoàn thành
    if (allCompleted.length >= 50) {
      badges.push({
        id: 'fifty_done',
        icon: '💎',
        title: 'Bậc thầy',
        desc: 'Hoàn thành 50 công việc',
        earned: true,
        color: 'bg-purple-500'
      });
    }

    // Badge: Streak 3 ngày
    if (streakData.currentStreak >= 3) {
      badges.push({
        id: 'streak_3',
        icon: '🔥',
        title: 'Đang cháy!',
        desc: `Streak ${streakData.currentStreak} ngày`,
        earned: true,
        color: 'bg-orange-500'
      });
    }

    // Badge: Streak 7 ngày
    if (streakData.currentStreak >= 7) {
      badges.push({
        id: 'streak_7',
        icon: '💪',
        title: 'Kiên trì!',
        desc: 'Streak 7 ngày liên tiếp',
        earned: true,
        color: 'bg-red-500'
      });
    }

    // Badge: No pending urgent
    const urgentPending = allPending.filter(t => t.priority === 'urgent' || t.priority === 'very-urgent');
    if (urgentPending.length === 0 && allCompleted.length > 0) {
      badges.push({
        id: 'no_urgent',
        icon: '😌',
        title: 'Thư thái',
        desc: 'Không có việc gấp đang chờ',
        earned: true,
        color: 'bg-teal-500'
      });
    }

    // Badge: Thu nhập 10 triệu
    if (paidAmount >= 10000000) {
      badges.push({
        id: 'money_10m',
        icon: '💰',
        title: 'Thu nhập khủng',
        desc: 'Đã nhận trên 10 triệu',
        earned: true,
        color: 'bg-emerald-500'
      });
    }

    // Badge: Hoàn thành 3 việc trong 1 ngày
    if (streakData.todayCompleted >= 3) {
      badges.push({
        id: 'productive_day',
        icon: '⚡',
        title: 'Ngày năng suất',
        desc: `${streakData.todayCompleted} việc xong hôm nay`,
        earned: true,
        color: 'bg-blue-500'
      });
    }

    return badges;
  }, [tasks, streakData]);

  // ============ MOTIVATIONAL MESSAGE ============
  const motivationalMessage = useMemo(() => {
    const completionRate = stats.completionRate;
    const pendingUrgent = pendingAnalysis.urgent + pendingAnalysis.veryUrgent;
    const todayDone = streakData.todayCompleted;

    // Ưu tiên các message theo tình trạng
    if (pendingAnalysis.criticalPercent >= 50) {
      return {
        type: 'warning',
        icon: '😰',
        title: 'Đừng lo lắng!',
        message: 'Bạn có nhiều việc gấp, hãy tập trung từng việc một. Bắt đầu từ việc quan trọng nhất!',
        color: 'from-red-500 to-orange-500'
      };
    }

    if (todayDone >= 5) {
      return {
        type: 'praise',
        icon: '🌟',
        title: 'XUẤT SẮC!',
        message: `Wow! ${todayDone} việc xong trong hôm nay! Bạn thật sự là siêu nhân!`,
        color: 'from-yellow-400 to-orange-500'
      };
    }

    if (todayDone >= 3) {
      return {
        type: 'praise',
        icon: '💪',
        title: 'Tuyệt vời!',
        message: 'Bạn đang làm rất tốt! Tiếp tục phát huy nhé!',
        color: 'from-green-400 to-emerald-500'
      };
    }

    if (streakData.currentStreak >= 7) {
      return {
        type: 'praise',
        icon: '🔥',
        title: 'ĐÁM CHÁY!',
        message: `${streakData.currentStreak} ngày liên tiếp hoàn thành việc! Bạn là huyền thoại!`,
        color: 'from-orange-500 to-red-500'
      };
    }

    if (streakData.currentStreak >= 3) {
      return {
        type: 'encourage',
        icon: '✨',
        title: 'Tuyệt vời!',
        message: `Streak ${streakData.currentStreak} ngày! Đừng dừng lại nhé!`,
        color: 'from-purple-500 to-pink-500'
      };
    }

    if (completionRate >= 80) {
      return {
        type: 'praise',
        icon: '🏆',
        title: 'Xuất sắc!',
        message: `Tỷ lệ hoàn thành ${completionRate}%! Bạn đang quản lý công việc rất tốt!`,
        color: 'from-amber-400 to-yellow-500'
      };
    }

    if (pendingUrgent === 0 && stats.pending > 0) {
      return {
        type: 'calm',
        icon: '😊',
        title: 'Rất tốt!',
        message: 'Không có việc gấp! Bạn có thể làm việc một cách thoải mái.',
        color: 'from-teal-400 to-cyan-500'
      };
    }

    if (todayDone >= 1) {
      return {
        type: 'encourage',
        icon: '👍',
        title: 'Tiếp tục nào!',
        message: 'Bạn đã bắt đầu tốt rồi, cố gắng thêm chút nữa nhé!',
        color: 'from-blue-400 to-indigo-500'
      };
    }

    if (stats.pending > 0) {
      return {
        type: 'nudge',
        icon: '💡',
        title: 'Hãy bắt đầu!',
        message: `Bạn có ${stats.pending} việc đang chờ. Hãy hoàn thành 1 việc để tạo đà!`,
        color: 'from-gray-400 to-gray-500'
      };
    }

    return {
      type: 'empty',
      icon: '🎯',
      title: 'Sẵn sàng!',
      message: 'Tạo công việc mới và bắt đầu hành trình của bạn!',
      color: 'from-primary-400 to-primary-600'
    };
  }, [stats, pendingAnalysis, streakData]);

  // Stats by category
  const categoryStats = useMemo(() => {
    return categories.map(cat => {
      const catTasks = filteredTasks.filter(t => t.categoryId === cat.id);
      const completed = catTasks.filter(t => t.status === 'completed').length;
      const totalAmount = catTasks.reduce((sum, t) => sum + (t.amount || 0), 0);
      const paidAmount = catTasks.filter(t => t.isPaid).reduce((sum, t) => sum + (t.amount || 0), 0);
      const autoUpgraded = catTasks.filter(t => t.autoUpgraded).length;

      return {
        ...cat, total: catTasks.length, completed, pending: catTasks.length - completed,
        completionRate: catTasks.length > 0 ? Math.round((completed / catTasks.length) * 100) : 0,
        totalAmount, paidAmount, unpaidAmount: totalAmount - paidAmount, autoUpgraded
      };
    }).filter(cat => cat.total > 0);
  }, [categories, filteredTasks]);

  // Format money for Y-axis (short form, always in selected currency)
  const formatMoneyAxis = (amount) => {
    return formatMoneyShort(amount);
  };

  // Export data to file (full backup with Tauri dialog)
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const data = exportData();
      const jsonString = JSON.stringify(data, null, 2);

      const filePath = await save({
        defaultPath: `hubogo-backup-${new Date().toISOString().split('T')[0]}.json`,
        filters: [{
          name: 'JSON',
          extensions: ['json']
        }]
      });

      if (filePath) {
        await writeTextFile(filePath, jsonString);
        const successMsg = language === 'vi'
          ? `✅ ${t('export_success')}\n\nĐã lưu tại:\n${filePath}\n\nTổng: ${data.tasks.length} công việc, ${data.categories.length} danh mục`
          : `✅ ${t('export_success')}\n\nSaved to:\n${filePath}\n\nTotal: ${data.tasks.length} tasks, ${data.categories.length} categories`;
        alert(successMsg);
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert(`❌ ${t('export_failed')}: ${err.message}`);
    } finally {
      setExportLoading(false);
    }
  };

  // Import data from file
  const handleImport = async () => {
    setImportLoading(true);
    try {
      const filePath = await open({
        multiple: false,
        filters: [{
          name: 'JSON',
          extensions: ['json']
        }]
      });

      if (filePath) {
        const content = await readTextFile(filePath);
        const data = JSON.parse(content);

        // Validate data structure
        if (!data.tasks || !data.categories) {
          throw new Error(t('invalid_backup'));
        }

        const confirmMsg = language === 'vi'
          ? `⚠️ ${t('import_warning')}\n\nFile backup chứa:\n• ${data.tasks.length} công việc\n• ${data.categories.length} danh mục\n\n${t('import_confirm')}`
          : `⚠️ ${t('import_warning')}\n\nBackup file contains:\n• ${data.tasks.length} tasks\n• ${data.categories.length} categories\n\n${t('import_confirm')}`;

        const confirmImport = confirm(confirmMsg);

        if (confirmImport) {
          importData(data);
          alert(`✅ ${t('import_success')}\n\n${t('restart_required')}`);
          window.location.reload();
        }
      }
    } catch (err) {
      console.error('Import failed:', err);
      alert(`❌ ${t('import_failed')}: ${err.message}`);
    } finally {
      setImportLoading(false);
    }
  };

  // Export to CSV (quick stats export)
  const handleExportCSV = () => {
    const headers = language === 'vi'
      ? ['Tên', 'Danh mục', 'Mức độ ban đầu', 'Mức độ hiện tại', 'Tự động nâng cấp', 'Trạng thái', 'Số ngày', 'Số tiền', 'Đã thanh toán', 'Hạn chót', 'Ngày nhận', 'Ngày xong']
      : ['Name', 'Category', 'Original Priority', 'Current Priority', 'Auto Upgraded', 'Status', 'Days', 'Amount', 'Paid', 'Deadline', 'Created', 'Completed'];
    const rows = filteredTasks.map(task => {
      const cat = categories.find(c => c.id === task.categoryId);
      const daysToComplete = task.completedAt
        ? differenceInDays(new Date(task.completedAt), new Date(task.createdAt))
        : differenceInDays(new Date(), new Date(task.createdAt));
      return [
        task.title, cat ? cat.name : (language === 'vi' ? 'Khác' : 'Other'),
        task.originalPriority === 'very-urgent' ? (language === 'vi' ? 'Rất gấp' : 'Very Urgent') : task.originalPriority === 'urgent' ? (language === 'vi' ? 'Gấp' : 'Urgent') : (language === 'vi' ? 'Bình thường' : 'Normal'),
        task.priority === 'very-urgent' ? (language === 'vi' ? 'Rất gấp' : 'Very Urgent') : task.priority === 'urgent' ? (language === 'vi' ? 'Gấp' : 'Urgent') : (language === 'vi' ? 'Bình thường' : 'Normal'),
        task.autoUpgraded ? (language === 'vi' ? 'Có' : 'Yes') : (language === 'vi' ? 'Không' : 'No'),
        task.status === 'completed' ? (language === 'vi' ? 'Hoàn thành' : 'Completed') : (language === 'vi' ? 'Đang làm' : 'In Progress'),
        daysToComplete, task.amount || 0, task.isPaid ? (language === 'vi' ? 'Đã' : 'Yes') : (language === 'vi' ? 'Chưa' : 'No'),
        task.deadline ? format(new Date(task.deadline), 'dd/MM/yyyy') : '',
        format(new Date(task.createdAt), 'dd/MM/yyyy HH:mm'),
        task.completedAt ? format(new Date(task.completedAt), 'dd/MM/yyyy HH:mm') : ''
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${language === 'vi' ? 'thongke' : 'statistics'}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDeadlinePercentage = (value) => {
    if (deadlineStats.total === 0) return 0;
    return Math.round((value / deadlineStats.total) * 100);
  };

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('statistics')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {format(dateRange.start, 'dd/MM/yyyy', { locale: dateLocale })} - {format(dateRange.end, 'dd/MM/yyyy', { locale: dateLocale })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2 text-gray-700 dark:text-gray-300 transition-colors">
            <FiDownload size={16} /> CSV
          </button>
        </div>
      </div>

      {/* Data Backup Section */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 mb-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-2 mb-3">
          <FiDatabase className="text-purple-500" size={20} />
          <span className="font-semibold text-gray-800 dark:text-white">{t('data_backup')}</span>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          {t('backup_description')}
        </p>

        <div className="grid grid-cols-2 gap-3">
          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border-2 border-dashed border-green-300 dark:border-green-700 rounded-xl transition-colors group"
          >
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiDownload className="text-white" size={20} />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-800 dark:text-white">
                {exportLoading ? t('exporting') : t('export_data')}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('save_backup')}
              </div>
            </div>
          </button>

          {/* Import button */}
          <button
            onClick={handleImport}
            disabled={importLoading}
            className="flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiUpload className="text-white" size={20} />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-800 dark:text-white">
                {importLoading ? t('importing') : t('import_data')}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('restore_backup')}
              </div>
            </div>
          </button>
        </div>

        <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            💡 <strong>{language === 'vi' ? 'Mẹo:' : 'Tip:'}</strong> {t('backup_tip')}
          </p>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'today', label: t('period_today') },
          { id: 'week', label: t('period_week') },
          { id: 'month', label: t('period_month') },
          { id: 'custom', label: t('period_custom') }
        ].map(item => (
          <button key={item.id} onClick={() => setPeriod(item.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === item.id ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {item.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range */}
      {period === 'custom' && (
        <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <FiCalendar className="text-gray-400" />
          <input type="date" value={customRange.start} onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          <span className="text-gray-400">{t('date_to')}</span>
          <input type="date" value={customRange.end} onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
      )}

      {/* ============ LINE CHART ============ */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FiActivity className="text-primary-500" size={20} />
            <span className="font-semibold text-gray-800 dark:text-white">{t('trend_chart')}</span>
          </div>
          <div className="flex gap-1">
            {[{ id: 'total', label: t('total'), color: 'blue' }, { id: 'completed', label: t('done'), color: 'green' }, { id: 'money', label: t('money'), color: 'yellow' }].map(type => (
              <button key={type.id} onClick={() => setChartType(type.id)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${chartType === type.id
                  ? `bg-${type.color}-500 text-white`
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="relative ml-10">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-6 w-10 -ml-10 flex flex-col justify-between text-xs text-gray-400">
            {[...Array(6)].map((_, i) => {
              const val = chartMax - (chartMax / 5) * i;
              return (
                <span key={i} className="text-right pr-2">
                  {chartType === 'money' ? formatMoneyAxis(val) : Math.round(val)}
                </span>
              );
            })}
          </div>

          {/* Grid lines */}
          <div className="absolute left-0 right-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border-t border-gray-200 dark:border-gray-700" style={{ opacity: i === 5 ? 1 : 0.5 }} />
            ))}
          </div>

          {/* Chart area */}
          <div className="h-48 relative">
            {/* SVG for line chart - lines layer */}
            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" style={{ zIndex: 5 }}>
              {/* Line connections */}
              {chartData.map((data, index) => {
                if (index === 0) return null;
                const value = data[chartType] || 0;
                const prevValue = chartData[index - 1][chartType] || 0;
                const height = chartMax > 0 ? (value / chartMax) * 100 : 0;
                const prevHeight = chartMax > 0 ? (prevValue / chartMax) * 100 : 0;

                const totalPoints = chartData.length;
                const segmentWidth = 100 / totalPoints;
                const x1 = segmentWidth * (index - 1) + segmentWidth / 2;
                const x2 = segmentWidth * index + segmentWidth / 2;
                const y1 = 100 - prevHeight;
                const y2 = 100 - height;

                return (
                  <line
                    key={`line-${index}`}
                    x1={`${x1}%`} y1={`${y1}%`}
                    x2={`${x2}%`} y2={`${y2}%`}
                    stroke="#22c55e"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>

            {/* Data points layer - highest z-index */}
            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" style={{ zIndex: 20 }}>
              {chartData.map((data, index) => {
                const value = data[chartType] || 0;
                const height = chartMax > 0 ? (value / chartMax) * 100 : 0;
                const totalPoints = chartData.length;
                const segmentWidth = 100 / totalPoints;
                const cx = segmentWidth * index + segmentWidth / 2;
                const cy = 100 - height;
                const isHovered = hoveredPoint === index;

                return (
                  <g key={`point-${index}`}>
                    {/* Shadow/glow effect when hovered */}
                    {isHovered && (
                      <circle
                        cx={`${cx}%`}
                        cy={`${cy}%`}
                        r="12"
                        fill="#22c55e"
                        opacity="0.3"
                      />
                    )}
                    <circle
                      cx={`${cx}%`}
                      cy={`${cy}%`}
                      r={isHovered ? "8" : "6"}
                      fill="#22c55e"
                      stroke="white"
                      strokeWidth={isHovered ? "3" : "2"}
                      style={{
                        cursor: 'pointer',
                        filter: isHovered ? 'drop-shadow(0 4px 6px rgba(34, 197, 94, 0.5))' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={() => setHoveredPoint(index)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover areas for tooltip */}
            <div className="absolute inset-0 flex" style={{ zIndex: 25 }}>
              {chartData.map((data, index) => {
                const value = data[chartType] || 0;
                const height = chartMax > 0 ? (value / chartMax) * 100 : 0;
                const isHovered = hoveredPoint === index;

                // Generate tooltip text
                const getTooltipText = () => {
                  if (chartType === 'total') {
                    return `${value} ${t('chart_jobs')}`;
                  } else if (chartType === 'completed') {
                    return `${value} ${t('chart_done')}`;
                  } else {
                    return formatMoney(value);
                  }
                };

                return (
                  <div
                    key={index}
                    className="flex-1 relative h-full"
                    onMouseEnter={() => setHoveredPoint(index)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none"
                        style={{ bottom: `${height}%`, marginBottom: '16px' }}
                      >
                        <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl whitespace-nowrap animate-fade-in">
                          <div className="font-semibold">{data.label}</div>
                          <div className="text-green-400">{getTooltipText()}</div>
                        </div>
                        {/* Arrow */}
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-900 rotate-45" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bars */}
            <div className="absolute inset-0 flex items-end gap-1" style={{ zIndex: 10 }}>
              {chartData.map((data, index) => {
                const value = data[chartType] || 0;
                const height = chartMax > 0 ? (value / chartMax) * 100 : 0;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center relative h-full justify-end">
                    <div className="w-full flex justify-center">
                      <div
                        className={`w-3/4 rounded-t transition-all ${
                          chartType === 'total' ? 'bg-blue-200 dark:bg-blue-900/50' :
                          chartType === 'completed' ? 'bg-green-200 dark:bg-green-900/50' : 'bg-yellow-200 dark:bg-yellow-900/50'
                        }`}
                        style={{ height: `${height}%`, minHeight: value > 0 ? '4px' : '0' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-axis labels - below chart */}
          <div className="flex gap-1 border-t border-gray-300 dark:border-gray-600 pt-2">
            {chartData.map((data, index) => (
              <div key={index} className="flex-1 text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">{data.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiPieChart className="text-white" size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-blue-600 dark:text-blue-400 truncate">{t('total_tasks_label')}</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiCheckCircle className="text-white" size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-green-600 dark:text-green-400 truncate">{t('completed_label')}</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiClock className="text-white" size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-orange-600 dark:text-orange-400 truncate">{t('in_progress_label')}</p>
              <p className="text-xl font-bold text-orange-700 dark:text-orange-300">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiTrendingUp className="text-white" size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-purple-600 dark:text-purple-400 truncate">{t('rate_label')}</p>
              <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{stats.completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* DEADLINE STATS - Completed tasks */}
      {deadlineStats.total > 0 && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4 mb-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <FiTrendingUp size={20} />
            <span className="font-medium">{t('completed_analysis')}</span>
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> {t('done_normal')}</span>
                <span>{deadlineStats.doneNormal} ({getDeadlinePercentage(deadlineStats.doneNormal)}%)</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${getDeadlinePercentage(deadlineStats.doneNormal)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500"></span> {t('done_urgent')}</span>
                <span>{deadlineStats.doneUrgent} ({getDeadlinePercentage(deadlineStats.doneUrgent)}%)</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${getDeadlinePercentage(deadlineStats.doneUrgent)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> {t('done_very_urgent')}</span>
                <span>{deadlineStats.doneVeryUrgent} ({getDeadlinePercentage(deadlineStats.doneVeryUrgent)}%)</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${getDeadlinePercentage(deadlineStats.doneVeryUrgent)}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{deadlineStats.avgDaysToComplete}</p>
              <p className="text-xs text-gray-400">{t('avg_days')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{deadlineStats.autoUpgraded}</p>
              <p className="text-xs text-gray-400">{t('upgraded_tasks')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Money Stats */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-4 mb-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <FiDollarSign size={20} />
          <span className="font-medium">{t('finance')}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-primary-100 text-xs sm:text-sm">{t('total_money')}</p>
            <p className="text-lg sm:text-xl font-bold truncate">{formatMoney(stats.totalAmount)}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-primary-100 text-xs sm:text-sm">{t('received')}</p>
            <p className="text-lg sm:text-xl font-bold text-green-300 truncate">{formatMoney(stats.paidAmount)}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-primary-100 text-xs sm:text-sm">{t('not_received')}</p>
            <p className="text-lg sm:text-xl font-bold text-yellow-300 truncate">{formatMoney(stats.unpaidAmount)}</p>
          </div>
        </div>
      </div>

      {/* Category Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('by_category')}</h2>
        {categoryStats.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t('no_data')}</p>
        ) : (
          <div className="space-y-3">
            {categoryStats.map(cat => (
              <div key={cat.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-medium text-gray-800 dark:text-white">{cat.icon} {cat.name}</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{cat.total} {t('tasks_label')}</span>
                </div>
                <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                  <div className="absolute left-0 top-0 h-full rounded-full transition-all" style={{ width: `${cat.completionRate}%`, backgroundColor: cat.color }} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    ✅ {cat.completed} {t('cat_done')} • ⏳ {cat.pending} {t('cat_in_progress')}
                    {cat.autoUpgraded > 0 && <span className="text-orange-500 ml-2">• ⬆️ {cat.autoUpgraded}</span>}
                  </span>
                  <span className="font-medium" style={{ color: cat.color }}>{cat.completionRate}%</span>
                </div>
                {cat.totalAmount > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">💰 {formatMoney(cat.totalAmount)}</span>
                    <span className="text-green-600 dark:text-green-400">✅ {formatMoney(cat.paidAmount)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Statistics;
