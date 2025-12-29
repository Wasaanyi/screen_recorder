import type {
  ScreenSource,
  RecordingSettings,
  WebcamSettings,
  AnnotationSettings,
  AudioDevice,
  VideoDevice,
  TrimSettings
} from '../shared/types';

export interface ElectronAPI {
  // Screen sources
  getScreenSources: () => Promise<ScreenSource[]>;

  // Recording controls
  startRecording: (sourceId: string, settings: RecordingSettings) => Promise<void>;
  stopRecording: () => Promise<string>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;

  // Recording state listeners
  onRecordingStateChanged: (callback: (state: any) => void) => () => void;
  onRecordingError: (callback: (error: string) => void) => () => void;

  // MediaRecorder control listeners
  onStartMediaRecorder: (callback: (data: { sourceId: string; settings: RecordingSettings }) => void) => () => void;
  onStopMediaRecorder: (callback: () => void) => () => void;
  onPauseMediaRecorder: (callback: () => void) => () => void;
  onResumeMediaRecorder: (callback: () => void) => () => void;
  sendRecordingChunk: (chunk: Uint8Array) => void;

  // Webcam controls
  toggleWebcam: (enabled: boolean) => Promise<void>;
  updateWebcamSettings: (settings: WebcamSettings) => Promise<void>;
  getVideoDevices: () => Promise<VideoDevice[]>;

  // Overlay controls
  toggleOverlay: (enabled: boolean) => Promise<void>;
  updateAnnotationSettings: (settings: AnnotationSettings) => Promise<void>;
  saveAnnotation: (data: any) => Promise<void>;
  clearAnnotations: () => Promise<void>;

  // Settings
  getSettings: () => Promise<RecordingSettings>;
  updateSettings: (settings: Partial<RecordingSettings>) => Promise<void>;
  getAudioDevices: () => Promise<AudioDevice[]>;
  selectOutputFolder: () => Promise<string | null>;

  // Editor
  openEditor: (videoPath: string) => Promise<void>;
  trimVideo: (videoPath: string, settings: TrimSettings) => Promise<string>;
  exportVideo: (videoPath: string, outputPath: string) => Promise<void>;

  // Window management
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;

  // App controls
  quitApp: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
