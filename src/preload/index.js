const { contextBridge, ipcRenderer } = require('electron');

// IPC Channels - inlined to avoid module issues
const IPC_CHANNELS = {
  // Screen sources
  GET_SCREEN_SOURCES: 'get-screen-sources',

  // Recording controls
  START_RECORDING: 'start-recording',
  STOP_RECORDING: 'stop-recording',
  PAUSE_RECORDING: 'pause-recording',
  RESUME_RECORDING: 'resume-recording',

  // Recording state
  RECORDING_STATE_CHANGED: 'recording-state-changed',
  RECORDING_ERROR: 'recording-error',

  // Recording data transfer
  RECORDING_DATA_CHUNK: 'recording-data-chunk',
  START_MEDIA_RECORDER: 'start-media-recorder',
  STOP_MEDIA_RECORDER: 'stop-media-recorder',
  PAUSE_MEDIA_RECORDER: 'pause-media-recorder',
  RESUME_MEDIA_RECORDER: 'resume-media-recorder',

  // Webcam controls
  TOGGLE_WEBCAM: 'toggle-webcam',
  UPDATE_WEBCAM_SETTINGS: 'update-webcam-settings',
  GET_VIDEO_DEVICES: 'get-video-devices',

  // Overlay controls
  TOGGLE_OVERLAY: 'toggle-overlay',
  UPDATE_ANNOTATION_SETTINGS: 'update-annotation-settings',
  SAVE_ANNOTATION: 'save-annotation',
  CLEAR_ANNOTATIONS: 'clear-annotations',

  // Settings
  GET_SETTINGS: 'get-settings',
  UPDATE_SETTINGS: 'update-settings',
  GET_AUDIO_DEVICES: 'get-audio-devices',
  SELECT_OUTPUT_FOLDER: 'select-output-folder',

  // Editor
  OPEN_EDITOR: 'open-editor',
  TRIM_VIDEO: 'trim-video',
  EXPORT_VIDEO: 'export-video',

  // Window management
  MINIMIZE_WINDOW: 'minimize-window',
  MAXIMIZE_WINDOW: 'maximize-window',
  CLOSE_WINDOW: 'close-window',

  // App controls
  QUIT_APP: 'quit-app'
};

const api = {
  // Screen sources
  getScreenSources: () =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_SCREEN_SOURCES),

  // Recording controls
  startRecording: (sourceId, settings) =>
    ipcRenderer.invoke(IPC_CHANNELS.START_RECORDING, sourceId, settings),

  stopRecording: () =>
    ipcRenderer.invoke(IPC_CHANNELS.STOP_RECORDING),

  pauseRecording: () =>
    ipcRenderer.invoke(IPC_CHANNELS.PAUSE_RECORDING),

  resumeRecording: () =>
    ipcRenderer.invoke(IPC_CHANNELS.RESUME_RECORDING),

  // Recording state listener
  onRecordingStateChanged: (callback) => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on(IPC_CHANNELS.RECORDING_STATE_CHANGED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.RECORDING_STATE_CHANGED, listener);
  },

  onRecordingError: (callback) => {
    const listener = (_event, error) => callback(error);
    ipcRenderer.on(IPC_CHANNELS.RECORDING_ERROR, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.RECORDING_ERROR, listener);
  },

  // MediaRecorder control listeners
  onStartMediaRecorder: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.START_MEDIA_RECORDER, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.START_MEDIA_RECORDER, listener);
  },

  onStopMediaRecorder: (callback) => {
    const listener = (_event) => callback();
    ipcRenderer.on(IPC_CHANNELS.STOP_MEDIA_RECORDER, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.STOP_MEDIA_RECORDER, listener);
  },

  onPauseMediaRecorder: (callback) => {
    const listener = (_event) => callback();
    ipcRenderer.on(IPC_CHANNELS.PAUSE_MEDIA_RECORDER, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.PAUSE_MEDIA_RECORDER, listener);
  },

  onResumeMediaRecorder: (callback) => {
    const listener = (_event) => callback();
    ipcRenderer.on(IPC_CHANNELS.RESUME_MEDIA_RECORDER, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.RESUME_MEDIA_RECORDER, listener);
  },

  // Send recording data chunk to main process
  sendRecordingChunk: (chunk) => {
    ipcRenderer.send(IPC_CHANNELS.RECORDING_DATA_CHUNK, chunk);
  },

  // Webcam controls
  toggleWebcam: (enabled) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOGGLE_WEBCAM, enabled),

  updateWebcamSettings: (settings) =>
    ipcRenderer.invoke(IPC_CHANNELS.UPDATE_WEBCAM_SETTINGS, settings),

  getVideoDevices: () =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_VIDEO_DEVICES),

  // Overlay controls
  toggleOverlay: (enabled) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOGGLE_OVERLAY, enabled),

  updateAnnotationSettings: (settings) =>
    ipcRenderer.invoke(IPC_CHANNELS.UPDATE_ANNOTATION_SETTINGS, settings),

  saveAnnotation: (data) =>
    ipcRenderer.invoke(IPC_CHANNELS.SAVE_ANNOTATION, data),

  clearAnnotations: () =>
    ipcRenderer.invoke(IPC_CHANNELS.CLEAR_ANNOTATIONS),

  // Settings
  getSettings: () =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_SETTINGS),

  updateSettings: (settings) =>
    ipcRenderer.invoke(IPC_CHANNELS.UPDATE_SETTINGS, settings),

  getAudioDevices: () =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_AUDIO_DEVICES),

  selectOutputFolder: () =>
    ipcRenderer.invoke(IPC_CHANNELS.SELECT_OUTPUT_FOLDER),

  // Editor
  openEditor: (videoPath) =>
    ipcRenderer.invoke(IPC_CHANNELS.OPEN_EDITOR, videoPath),

  trimVideo: (videoPath, settings) =>
    ipcRenderer.invoke(IPC_CHANNELS.TRIM_VIDEO, videoPath, settings),

  exportVideo: (videoPath, outputPath) =>
    ipcRenderer.invoke(IPC_CHANNELS.EXPORT_VIDEO, videoPath, outputPath),

  // Window management
  minimizeWindow: () =>
    ipcRenderer.send(IPC_CHANNELS.MINIMIZE_WINDOW),

  maximizeWindow: () =>
    ipcRenderer.send(IPC_CHANNELS.MAXIMIZE_WINDOW),

  closeWindow: () =>
    ipcRenderer.send(IPC_CHANNELS.CLOSE_WINDOW),

  // App controls
  quitApp: () =>
    ipcRenderer.send(IPC_CHANNELS.QUIT_APP)
};

contextBridge.exposeInMainWorld('electronAPI', api);
