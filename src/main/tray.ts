import { Tray, Menu, app, nativeImage } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createControlWindow } from './windows';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let tray: Tray | null = null;

export function createTray(): Tray {
  const iconPath = join(__dirname, '../../assets/icons/icon-16.png');
  const icon = nativeImage.createFromPath(iconPath);

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        createControlWindow();
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Start Recording',
      click: () => {
        // This would trigger recording from tray
        console.log('Start recording from tray');
      }
    },
    {
      label: 'Stop Recording',
      enabled: false,
      click: () => {
        console.log('Stop recording from tray');
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Screen Recorder');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    createControlWindow();
  });

  return tray;
}

export function updateTrayRecordingState(isRecording: boolean): void {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        createControlWindow();
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Start Recording',
      enabled: !isRecording,
      click: () => {
        console.log('Start recording from tray');
      }
    },
    {
      label: 'Stop Recording',
      enabled: isRecording,
      click: () => {
        console.log('Stop recording from tray');
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
}
