// Notification utilities
const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

// Show Windows notification
export function showNotification(title, body) {
  if (ipcRenderer) {
    ipcRenderer.invoke('show-notification', { title, body });
  } else if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}

// Request notification permission (for web)
export async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}

// Check tasks for upcoming deadlines
export function checkDeadlines(tasks) {
  const now = new Date();
  const notifications = [];

  tasks.forEach(task => {
    if (!task.reminderEnabled || task.status === 'completed' || !task.deadline) {
      return;
    }

    const deadline = new Date(task.deadline);
    const timeDiff = deadline.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    // Notify if deadline is within 24 hours
    if (hoursDiff > 0 && hoursDiff <= 24) {
      notifications.push({
        type: 'warning',
        title: '⚠️ Deadline sắp đến!',
        body: `"${task.title}" cần hoàn thành trong ${Math.round(hoursDiff)} giờ nữa`,
        taskId: task.id
      });
    }

    // Notify if deadline is within 1 hour
    if (hoursDiff > 0 && hoursDiff <= 1) {
      notifications.push({
        type: 'urgent',
        title: '🚨 Deadline rất gần!',
        body: `"${task.title}" cần hoàn thành trong ${Math.round(hoursDiff * 60)} phút nữa`,
        taskId: task.id
      });
    }

    // Notify if overdue
    if (hoursDiff < 0 && hoursDiff > -24) {
      notifications.push({
        type: 'overdue',
        title: '❌ Đã quá hạn!',
        body: `"${task.title}" đã quá hạn ${Math.abs(Math.round(hoursDiff))} giờ`,
        taskId: task.id
      });
    }
  });

  return notifications;
}

// Start deadline checker (runs every 30 minutes)
let deadlineCheckerInterval = null;
const notifiedTasks = new Set(); // Track which tasks we've notified about

export function startDeadlineChecker(getTasks) {
  if (deadlineCheckerInterval) {
    clearInterval(deadlineCheckerInterval);
  }

  const check = () => {
    const tasks = getTasks();
    const notifications = checkDeadlines(tasks);

    notifications.forEach(notif => {
      // Only notify once per task per hour
      const notifKey = `${notif.taskId}-${notif.type}-${Math.floor(Date.now() / (1000 * 60 * 60))}`;
      if (!notifiedTasks.has(notifKey)) {
        showNotification(notif.title, notif.body);
        notifiedTasks.add(notifKey);

        // Clean up old entries
        if (notifiedTasks.size > 100) {
          const entries = Array.from(notifiedTasks);
          entries.slice(0, 50).forEach(key => notifiedTasks.delete(key));
        }
      }
    });
  };

  // Check immediately
  check();

  // Then check every 30 minutes
  deadlineCheckerInterval = setInterval(check, 30 * 60 * 1000);

  return () => {
    if (deadlineCheckerInterval) {
      clearInterval(deadlineCheckerInterval);
    }
  };
}

export function stopDeadlineChecker() {
  if (deadlineCheckerInterval) {
    clearInterval(deadlineCheckerInterval);
    deadlineCheckerInterval = null;
  }
}
