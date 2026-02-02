import { ipcMain, desktopCapturer, dialog, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import { startRecording, stopRecording, pauseRecording, resumeRecording, handleRecordingChunk } from './recorder';
import { createOverlayWindow, createWebcamWindow, closeOverlayWindow, closeWebcamWindow, createEditorWindow } from './windows';
import type { RecordingSettings, ScreenSource } from '../shared/types';
import { homedir, platform } from 'os';
import { join } from 'path';

function getDefaultOutputPath(): string {
  const home = homedir();
  switch (platform()) {
    case 'darwin':
      return join(home, 'Movies', 'Screen Recordings');
    case 'win32':
      return join(home, 'Videos', 'Screen Recordings');
    default:
      return join(home, 'Videos', 'Screen Recordings');
  }
}

let currentSettings: RecordingSettings = {
  outputPath: getDefaultOutputPath(),
  videoQuality: 'medium',
  fps: 30,
  audioSource: null,
  microphoneSource: null,
  includeSystemAudio: true,
  includeMicrophone: false,
  includeWebcam: false,
  webcamDeviceId: null,
  webcamPosition: 'bottom-right',
  webcamSize: 15,
  webcamShape: 'circle'
};

export function setupIPCHandlers(): void {
  // Get screen sources
  ipcMain.handle(IPC_CHANNELS.GET_SCREEN_SOURCES, async (): Promise<ScreenSource[]> => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['window', 'screen'],
        thumbnailSize: { width: 300, height: 200 }
      });

      return sources.map(source => ({
        id: source.id,
        name: source.name,
        thumbnail: source.thumbnail.toDataURL(),
        display_id: source.display_id,
        appIcon: source.appIcon?.toDataURL()
      }));
    } catch (error) {
      console.error('Error getting screen sources:', error);
      return [];
    }
  });

  // Recording controls
  ipcMain.handle(IPC_CHANNELS.START_RECORDING, async (_event, sourceId: string, settings: RecordingSettings) => {
    try {
      currentSettings = { ...currentSettings, ...settings };
      await startRecording(sourceId, currentSettings);
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  });

  ipcMain.handle(IPC_CHANNELS.STOP_RECORDING, async (): Promise<string> => {
    try {
      const outputPath = await stopRecording();
      return outputPath;
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  });

  ipcMain.handle(IPC_CHANNELS.PAUSE_RECORDING, async () => {
    await pauseRecording();
  });

  ipcMain.handle(IPC_CHANNELS.RESUME_RECORDING, async () => {
    await resumeRecording();
  });

  // Recording data transfer
  // Receives Uint8Array from renderer (Uint8Array serializes properly over IPC, ArrayBuffer doesn't)
  ipcMain.on(IPC_CHANNELS.RECORDING_DATA_CHUNK, (_event, chunk: Uint8Array) => {
    handleRecordingChunk(chunk);
  });

  // Webcam controls
  ipcMain.handle(IPC_CHANNELS.TOGGLE_WEBCAM, async (_event, enabled: boolean) => {
    if (enabled) {
      createWebcamWindow();
    } else {
      closeWebcamWindow();
    }
  });

  ipcMain.handle(IPC_CHANNELS.GET_VIDEO_DEVICES, async () => {
    // This will be called from renderer with navigator.mediaDevices
    return [];
  });

  // Overlay controls
  ipcMain.handle(IPC_CHANNELS.TOGGLE_OVERLAY, async (_event, enabled: boolean) => {
    if (enabled) {
      createOverlayWindow();
    } else {
      closeOverlayWindow();
    }
  });

  ipcMain.handle(IPC_CHANNELS.UPDATE_ANNOTATION_SETTINGS, async (_event, settings) => {
    // Store annotation settings and send to overlay window
    console.log('Annotation settings updated:', settings);
  });

  ipcMain.handle(IPC_CHANNELS.CLEAR_ANNOTATIONS, async () => {
    // Clear annotations in overlay window
    console.log('Clearing annotations');
  });

  // Settings
  ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, async (): Promise<RecordingSettings> => {
    return currentSettings;
  });

  ipcMain.handle(IPC_CHANNELS.UPDATE_SETTINGS, async (_event, settings: Partial<RecordingSettings>) => {
    currentSettings = { ...currentSettings, ...settings };
  });

  ipcMain.handle(IPC_CHANNELS.GET_AUDIO_DEVICES, async () => {
    // This will be called from renderer with navigator.mediaDevices
    return [];
  });

  ipcMain.handle(IPC_CHANNELS.SELECT_OUTPUT_FOLDER, async (): Promise<string | null> => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      defaultPath: currentSettings.outputPath
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });

  // Editor
  ipcMain.handle(IPC_CHANNELS.OPEN_EDITOR, async (_event, videoPath: string) => {
    createEditorWindow(videoPath);
  });

  ipcMain.handle(IPC_CHANNELS.TRIM_VIDEO, async (_event, videoPath: string, settings) => {
    // Implement video trimming with FFmpeg
    console.log('Trimming video:', videoPath, settings);
    return videoPath;
  });

  ipcMain.handle(IPC_CHANNELS.EXPORT_VIDEO, async (_event, videoPath: string, outputPath: string) => {
    // Implement video export
    console.log('Exporting video:', videoPath, 'to', outputPath);
  });

  // Window management
  ipcMain.on(IPC_CHANNELS.MINIMIZE_WINDOW, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.minimize();
  });

  ipcMain.on(IPC_CHANNELS.MAXIMIZE_WINDOW, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window?.isMaximized()) {
      window.unmaximize();
    } else {
      window?.maximize();
    }
  });

  ipcMain.on(IPC_CHANNELS.CLOSE_WINDOW, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.close();
  });
}
