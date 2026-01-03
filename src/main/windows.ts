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
let recordingBorderWindow: BrowserWindow | null = null;

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

/**
 * Create a transparent window that shows a red border around the recording source
 * This window is excluded from capture and only serves as a visual indicator
 */
export function showRecordingBorder(sourceId: string, displayId?: string): void {
  // Close existing border window if any
  closeRecordingBorder();

  // Get the display/window bounds based on source ID
  let bounds: Electron.Rectangle;
  const displays = screen.getAllDisplays();

  console.log('showRecordingBorder called with:', { sourceId, displayId });
  console.log('Available displays:', displays.map(d => ({ id: d.id, bounds: d.bounds })));

  if (sourceId.startsWith('screen:')) {
    // It's a screen capture - find the display
    let targetDisplay = screen.getPrimaryDisplay();

    if (displayId) {
      // Use the display_id from the source if provided
      const found = displays.find(d => d.id.toString() === displayId);
      if (found) {
        targetDisplay = found;
        console.log('Found display by displayId:', displayId);
      }
    } else {
      // Try to parse from sourceId format: "screen:INDEX:0"
      const parts = sourceId.split(':');
      if (parts.length >= 2) {
        const screenIndex = parseInt(parts[1], 10);
        if (!isNaN(screenIndex) && screenIndex < displays.length) {
          targetDisplay = displays[screenIndex];
          console.log('Found display by index:', screenIndex);
        }
      }
    }

    bounds = targetDisplay.bounds;
    console.log('Using display bounds:', bounds);
  } else {
    // It's a window capture - for now, use primary display
    // Window bounds tracking is complex and would require native modules
    const primaryDisplay = screen.getPrimaryDisplay();
    bounds = primaryDisplay.bounds;
  }

  const borderWidth = 4;

  recordingBorderWindow = new BrowserWindow({
    x: bounds.x - borderWidth,
    y: bounds.y - borderWidth,
    width: bounds.width + borderWidth * 2,
    height: bounds.height + borderWidth * 2,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    focusable: false,
    resizable: false,
    movable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Make the window click-through so it doesn't interfere with user interaction
  recordingBorderWindow.setIgnoreMouseEvents(true);
  recordingBorderWindow.setAlwaysOnTop(true, 'screen-saver');

  // Exclude from capture (this prevents the border from appearing in the recording)
  recordingBorderWindow.setContentProtection(true);

  // Load a simple HTML that just draws a red border
  const borderHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; }
        html, body {
          width: 100%;
          height: 100%;
          background: transparent;
          overflow: hidden;
        }
        .border {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border: ${borderWidth}px solid #ef4444;
          box-sizing: border-box;
          pointer-events: none;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { border-color: rgba(239, 68, 68, 1); }
          50% { border-color: rgba(239, 68, 68, 0.6); }
        }
      </style>
    </head>
    <body>
      <div class="border"></div>
    </body>
    </html>
  `;

  recordingBorderWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(borderHTML)}`);

  recordingBorderWindow.on('closed', () => {
    recordingBorderWindow = null;
  });
}

export function closeRecordingBorder(): void {
  if (recordingBorderWindow && !recordingBorderWindow.isDestroyed()) {
    recordingBorderWindow.close();
    recordingBorderWindow = null;
  }
}
