const { contextBridge, ipcRenderer } = require('electron');
const { IPC_CHANNELS } = require('../shared/ipc-channels');

import type {
  ScreenSource,
  RecordingSettings,
  WebcamSettings,
  AnnotationSettings,
  AudioDevice,
  VideoDevice,
  TrimSettings
} from '../shared/types';

const api = {
  // Screen sources
  getScreenSources: (): Promise<ScreenSource[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_SCREEN_SOURCES),

  // Recording controls
  startRecording: (sourceId: string, settings: RecordingSettings, displayId?: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.START_RECORDING, sourceId, settings, displayId),

  stopRecording: (): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.STOP_RECORDING),

  pauseRecording: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.PAUSE_RECORDING),

  resumeRecording: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.RESUME_RECORDING),

  // Recording state listener
  onRecordingStateChanged: (callback: (state: any) => void) => {
    const listener = (_event: any, state: any) => callback(state);
    ipcRenderer.on(IPC_CHANNELS.RECORDING_STATE_CHANGED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.RECORDING_STATE_CHANGED, listener);
  },

  onRecordingError: (callback: (error: string) => void) => {
    const listener = (_event: any, error: string) => callback(error);
    ipcRenderer.on(IPC_CHANNELS.RECORDING_ERROR, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.RECORDING_ERROR, listener);
  },

  // MediaRecorder control listeners
  onStartMediaRecorder: (callback: (data: { sourceId: string; settings: RecordingSettings }) => void) => {
    const listener = (_event: any, data: { sourceId: string; settings: RecordingSettings }) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.START_MEDIA_RECORDER, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.START_MEDIA_RECORDER, listener);
  },

  onStopMediaRecorder: (callback: () => void) => {
    const listener = (_event: any) => callback();
    ipcRenderer.on(IPC_CHANNELS.STOP_MEDIA_RECORDER, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.STOP_MEDIA_RECORDER, listener);
  },

  onPauseMediaRecorder: (callback: () => void) => {
    const listener = (_event: any) => callback();
    ipcRenderer.on(IPC_CHANNELS.PAUSE_MEDIA_RECORDER, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.PAUSE_MEDIA_RECORDER, listener);
  },

  onResumeMediaRecorder: (callback: () => void) => {
    const listener = (_event: any) => callback();
    ipcRenderer.on(IPC_CHANNELS.RESUME_MEDIA_RECORDER, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.RESUME_MEDIA_RECORDER, listener);
  },

  // Send recording data chunk to main process
  // Using Uint8Array instead of ArrayBuffer for proper IPC serialization
  sendRecordingChunk: (chunk: Uint8Array): void => {
    ipcRenderer.send(IPC_CHANNELS.RECORDING_DATA_CHUNK, chunk);
  },

  // Webcam controls
  toggleWebcam: (enabled: boolean): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.TOGGLE_WEBCAM, enabled),

  updateWebcamSettings: (settings: WebcamSettings): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.UPDATE_WEBCAM_SETTINGS, settings),

  getVideoDevices: (): Promise<VideoDevice[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_VIDEO_DEVICES),

  // Overlay controls
  toggleOverlay: (enabled: boolean): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.TOGGLE_OVERLAY, enabled),

  updateAnnotationSettings: (settings: AnnotationSettings): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.UPDATE_ANNOTATION_SETTINGS, settings),

  saveAnnotation: (data: any): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.SAVE_ANNOTATION, data),

  clearAnnotations: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.CLEAR_ANNOTATIONS),

  // Settings
  getSettings: (): Promise<RecordingSettings> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_SETTINGS),

  updateSettings: (settings: Partial<RecordingSettings>): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.UPDATE_SETTINGS, settings),

  getAudioDevices: (): Promise<AudioDevice[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_AUDIO_DEVICES),

  selectOutputFolder: (): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.SELECT_OUTPUT_FOLDER),

  // Editor
  openEditor: (videoPath: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.OPEN_EDITOR, videoPath),

  trimVideo: (videoPath: string, settings: TrimSettings): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.TRIM_VIDEO, videoPath, settings),

  exportVideo: (videoPath: string, outputPath: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.EXPORT_VIDEO, videoPath, outputPath),

  // Window management
  minimizeWindow: (): void =>
    ipcRenderer.send(IPC_CHANNELS.MINIMIZE_WINDOW),

  maximizeWindow: (): void =>
    ipcRenderer.send(IPC_CHANNELS.MAXIMIZE_WINDOW),

  closeWindow: (): void =>
    ipcRenderer.send(IPC_CHANNELS.CLOSE_WINDOW),

  // App controls
  quitApp: (): void =>
    ipcRenderer.send(IPC_CHANNELS.QUIT_APP)
};

export type ElectronAPI = typeof api;

contextBridge.exposeInMainWorld('electronAPI', api);
