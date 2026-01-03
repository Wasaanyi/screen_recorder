export const APP_NAME = 'Screen Recorder';
export const APP_VERSION = '1.0.0';

export const WINDOW_SIZES = {
  CONTROL: {
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400
  },
  EDITOR: {
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600
  },
  WEBCAM: {
    defaultWidth: 200,
    defaultHeight: 200,
    minWidth: 100,
    minHeight: 100
  }
};

export const VIDEO_QUALITY_PRESETS = {
  low: {
    bitrate: '1000k',
    fps: 15,
    scale: '1280:720'
  },
  medium: {
    bitrate: '2500k',
    fps: 30,
    scale: '1920:1080'
  },
  high: {
    bitrate: '5000k',
    fps: 60,
    scale: '1920:1080'
  },
  ultra: {
    bitrate: '8000k',
    fps: 60,
    scale: '2560:1440'
  }
};

export const DEFAULT_SETTINGS = {
  outputPath: '',
  videoQuality: 'medium' as const,
  fps: 30,
  audioSource: null,
  microphoneSource: null,
  includeSystemAudio: true,
  includeMicrophone: false,
  includeWebcam: false,
  webcamDeviceId: null,
  webcamPosition: 'bottom-right' as const,
  webcamSize: 15,
  webcamShape: 'circle' as const
};

export const ANNOTATION_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#000000', // black
  '#ffffff'  // white
];

export const ANNOTATION_THICKNESS = [2, 4, 6, 8, 12];
