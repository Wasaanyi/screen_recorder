import { app, BrowserWindow } from 'electron';
import { createControlWindow } from './windows';
import { setupIPCHandlers } from './ipc-handlers';
import { createTray } from './tray';
import squirrelStartup from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrelStartup) {
  app.quit();
}


async function initialize() {
  // Set up IPC handlers
  setupIPCHandlers();

  // Create the main control window
  createControlWindow();

  // Create system tray
  createTray();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(initialize);

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createControlWindow();
  }
});

// Disable hardware acceleration for better compatibility
app.disableHardwareAcceleration();
