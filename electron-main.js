// Load .env.electron before anything else
import dotenv from 'dotenv';
dotenv.config({ path: '.env.electron' });
console.log('Environment variables loaded from .env.electron');


import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import log from 'electron-log';
import electronUpdater from 'electron-updater';
const { autoUpdater } = electronUpdater;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const win = new BrowserWindow({
    width: 1320,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
      devTools: false, // Disable DevTools in production
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
    },
  });

  // Disable right-click context menu and F12
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' ||
        (input.control && input.shift && input.key === 'I') ||
        (input.control && input.shift && input.key === 'C') ||
        (input.control && input.shift && input.key === 'J')) {
      event.preventDefault();
    }
  });

  // Disable right-click context menu
  win.webContents.on('context-menu', (event) => {
    event.preventDefault();
  });

  win.loadFile(path.join(__dirname, 'dist', 'index.html'));

  // Auto-update events
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = 'info';
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    log.info('Update available. Downloading...');
    win.webContents.send('update_available');
  });
  autoUpdater.on('update-downloaded', () => {
    log.info('Update downloaded. Will install on quit.');
    win.webContents.send('update_downloaded');
  });
  autoUpdater.on('error', (err) => {
    log.error('Update error:', err);
    win.webContents.send('update_error', err == null ? '' : err.toString());
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});