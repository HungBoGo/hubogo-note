// Backup utilities
import { format } from 'date-fns';

const BACKUP_KEY = 'sticky_backup_history';
const MAX_BACKUPS = 10;

// Get backup history
export function getBackupHistory() {
  const history = localStorage.getItem(BACKUP_KEY);
  return history ? JSON.parse(history) : [];
}

// Save backup to history
export function saveBackupToHistory(data) {
  const history = getBackupHistory();
  const backup = {
    id: Date.now(),
    date: new Date().toISOString(),
    taskCount: data.tasks?.length || 0,
    categoryCount: data.categories?.length || 0,
    data: data
  };

  history.unshift(backup);

  // Keep only last MAX_BACKUPS
  if (history.length > MAX_BACKUPS) {
    history.pop();
  }

  localStorage.setItem(BACKUP_KEY, JSON.stringify(history));
  return backup;
}

// Auto backup (saves to localStorage history)
export function autoBackup(exportData) {
  const data = exportData();
  return saveBackupToHistory(data);
}

// Start auto backup (every hour)
let autoBackupInterval = null;

export function startAutoBackup(exportData) {
  if (autoBackupInterval) {
    clearInterval(autoBackupInterval);
  }

  // Backup immediately
  autoBackup(exportData);

  // Then backup every hour
  autoBackupInterval = setInterval(() => {
    autoBackup(exportData);
    console.log('Auto backup completed at', new Date().toISOString());
  }, 60 * 60 * 1000);

  return () => {
    if (autoBackupInterval) {
      clearInterval(autoBackupInterval);
    }
  };
}

export function stopAutoBackup() {
  if (autoBackupInterval) {
    clearInterval(autoBackupInterval);
    autoBackupInterval = null;
  }
}

// Restore from backup
export function restoreFromBackup(backupId, importData) {
  const history = getBackupHistory();
  const backup = history.find(b => b.id === backupId);

  if (backup && backup.data) {
    importData(backup.data);
    return true;
  }

  return false;
}

// Delete backup
export function deleteBackup(backupId) {
  const history = getBackupHistory();
  const filtered = history.filter(b => b.id !== backupId);
  localStorage.setItem(BACKUP_KEY, JSON.stringify(filtered));
  return true;
}

// Export to file
export function exportToFile(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `backup_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Import from file
export function importFromFile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          resolve(data);
        } catch (err) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };

    input.click();
  });
}
