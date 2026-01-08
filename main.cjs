const { app, BrowserWindow, ipcMain, Notification, Tray, Menu, screen } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();
let mainWindow;
let tray;

// Kiểm tra single instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

function createWindow() {
  // Lấy kích thước màn hình
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  // Kích thước cửa sổ
  const windowWidth = 420;
  const windowHeight = screenHeight - 100;

  // Vị trí góc phải
  const x = screenWidth - windowWidth - 10;
  const y = 50;

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: x,
    y: y,
    frame: false,
    transparent: false,
    resizable: true,
    alwaysOnTop: store.get('alwaysOnTop', false),
    skipTaskbar: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    show: false
  });

  // Load URL dựa vào môi trường
  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools(); // Bỏ comment để debug
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

// Tạo system tray
function createTray() {
  tray = new Tray(path.join(__dirname, 'assets/icon.png'));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Mở ứng dụng',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Luôn hiện trên cùng',
      type: 'checkbox',
      checked: store.get('alwaysOnTop', false),
      click: (menuItem) => {
        store.set('alwaysOnTop', menuItem.checked);
        mainWindow.setAlwaysOnTop(menuItem.checked);
      }
    },
    { type: 'separator' },
    {
      label: 'Thoát',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Sticky Task Manager');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });
}

// Auto start với Windows
function setAutoStart(enable) {
  app.setLoginItemSettings({
    openAtLogin: enable,
    path: app.getPath('exe')
  });
}

// IPC handlers
ipcMain.handle('get-settings', () => {
  return {
    alwaysOnTop: store.get('alwaysOnTop', false),
    autoStart: store.get('autoStart', true),
    theme: store.get('theme', 'light'),
    backupPath: store.get('backupPath', app.getPath('documents'))
  };
});

ipcMain.handle('save-settings', (event, settings) => {
  Object.keys(settings).forEach(key => {
    store.set(key, settings[key]);
  });

  if (settings.alwaysOnTop !== undefined) {
    mainWindow.setAlwaysOnTop(settings.alwaysOnTop);
  }

  if (settings.autoStart !== undefined) {
    setAutoStart(settings.autoStart);
  }

  return true;
});

ipcMain.handle('show-notification', (event, { title, body }) => {
  const notification = new Notification({
    title: title,
    body: body,
    icon: path.join(__dirname, 'assets/icon.png')
  });
  notification.show();

  notification.on('click', () => {
    mainWindow.show();
  });
});

ipcMain.handle('minimize-window', () => {
  mainWindow.minimize();
});

ipcMain.handle('close-window', () => {
  mainWindow.hide();
});

ipcMain.handle('toggle-always-on-top', () => {
  const current = mainWindow.isAlwaysOnTop();
  mainWindow.setAlwaysOnTop(!current);
  store.set('alwaysOnTop', !current);
  return !current;
});

// App events
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Set auto start mặc định
  if (store.get('autoStart', true)) {
    setAutoStart(true);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});
