import { Tray, Menu, app, nativeImage } from 'electron';
import { createControlWindow } from './windows';

let tray: Tray | null = null;

export function createTray(): Tray {
  // Create a simple icon for the tray (you'll want to replace this with an actual icon)
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFJSURBVDiNpZKxSgNBEIa/2b1EUESwsBELsbHyAWy0srGxsfQJfAIfwMrGVkGwEKy0EBUETYKFhY2FhY2FjYWFYGGRy+3O/hZ7uXBJQPDgY2B35v9ndmYW/lMEQCmlgBlgElgDeoAKcAecA0fAqZRy6F8AAhgANoCdnJwCPIAe0AGugENgX0rZ/hVAaw14AzaBZWAN6I4aMMBX4AZ4BA6klK1fALTWC8AjMAWMAf3ZdguoAt/Z9gxYlFI+dwDQWs8Dh8BkzncAo0ANmAfGpZRvNYDWugm8AIvAI3APdANNYCbXbwF7UsrBTwCt9QbwDvjAEzALLGV9C9gGvP/TgAlgO4PPZtsOIIA14CS/Zs/1LOArcAy0Mrgf2JFSfuScHC/kdNTEjJTyI/cEQGu9CrwCfq5ZAW6BL0ADM8CdXMufWCnl078BpZQjVz3/AydFe25d/xdxAAAAAElFTkSuQmCC'
  );

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
