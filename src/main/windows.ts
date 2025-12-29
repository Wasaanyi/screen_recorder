import { BrowserWindow, screen } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { WINDOW_SIZES } from '../shared/constants';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let controlWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let webcamWindow: BrowserWindow | null = null;
let editorWindow: BrowserWindow | null = null;

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

export function createControlWindow(): BrowserWindow {
  if (controlWindow && !controlWindow.isDestroyed()) {
    controlWindow.focus();
    return controlWindow;
  }

  controlWindow = new BrowserWindow({
    width: WINDOW_SIZES.CONTROL.width,
    height: WINDOW_SIZES.CONTROL.height,
    minWidth: WINDOW_SIZES.CONTROL.minWidth,
    minHeight: WINDOW_SIZES.CONTROL.minHeight,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: 'Screen Recorder',
    autoHideMenuBar: true
  });

  if (VITE_DEV_SERVER_URL) {
    controlWindow.loadURL(VITE_DEV_SERVER_URL);
    controlWindow.webContents.openDevTools();
  } else {
    controlWindow.loadFile(join(__dirname, '../dist/control/index.html'));
  }

  controlWindow.on('closed', () => {
    controlWindow = null;
  });

  return controlWindow;
}

export function createOverlayWindow(): BrowserWindow {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.show();
    return overlayWindow;
  }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  overlayWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  overlayWindow.setIgnoreMouseEvents(false);
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');

  if (VITE_DEV_SERVER_URL) {
    overlayWindow.loadURL(`${VITE_DEV_SERVER_URL}/src/renderer/overlay/index.html`);
  } else {
    overlayWindow.loadFile(join(__dirname, '../dist/overlay/index.html'));
  }

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  return overlayWindow;
}

export function createWebcamWindow(): BrowserWindow {
  if (webcamWindow && !webcamWindow.isDestroyed()) {
    webcamWindow.show();
    return webcamWindow;
  }

  webcamWindow = new BrowserWindow({
    width: WINDOW_SIZES.WEBCAM.defaultWidth,
    height: WINDOW_SIZES.WEBCAM.defaultHeight,
    minWidth: WINDOW_SIZES.WEBCAM.minWidth,
    minHeight: WINDOW_SIZES.WEBCAM.minHeight,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  webcamWindow.setAlwaysOnTop(true, 'floating');

  if (VITE_DEV_SERVER_URL) {
    webcamWindow.loadURL(`${VITE_DEV_SERVER_URL}/src/renderer/webcam/index.html`);
  } else {
    webcamWindow.loadFile(join(__dirname, '../dist/webcam/index.html'));
  }

  webcamWindow.on('closed', () => {
    webcamWindow = null;
  });

  return webcamWindow;
}

export function createEditorWindow(videoPath: string): BrowserWindow {
  if (editorWindow && !editorWindow.isDestroyed()) {
    editorWindow.focus();
    return editorWindow;
  }

  editorWindow = new BrowserWindow({
    width: WINDOW_SIZES.EDITOR.width,
    height: WINDOW_SIZES.EDITOR.height,
    minWidth: WINDOW_SIZES.EDITOR.minWidth,
    minHeight: WINDOW_SIZES.EDITOR.minHeight,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: 'Video Editor',
    autoHideMenuBar: true
  });

  if (VITE_DEV_SERVER_URL) {
    editorWindow.loadURL(`${VITE_DEV_SERVER_URL}/src/renderer/editor/index.html?video=${encodeURIComponent(videoPath)}`);
  } else {
    editorWindow.loadFile(join(__dirname, '../dist/editor/index.html'), {
      query: { video: videoPath }
    });
  }

  editorWindow.on('closed', () => {
    editorWindow = null;
  });

  return editorWindow;
}

export function getControlWindow(): BrowserWindow | null {
  return controlWindow;
}

export function getOverlayWindow(): BrowserWindow | null {
  return overlayWindow;
}

export function getWebcamWindow(): BrowserWindow | null {
  return webcamWindow;
}

export function getEditorWindow(): BrowserWindow | null {
  return editorWindow;
}

export function closeOverlayWindow(): void {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close();
  }
}

export function closeWebcamWindow(): void {
  if (webcamWindow && !webcamWindow.isDestroyed()) {
    webcamWindow.close();
  }
}
