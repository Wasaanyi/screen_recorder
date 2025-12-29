export const IPC_CHANNELS = {
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
} as const;

export type IPCChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];
