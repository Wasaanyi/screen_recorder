export interface ScreenSource {
  id: string;
  name: string;
  thumbnail: string;
  display_id?: string;
  appIcon?: string;
}

export interface RecordingSettings {
  outputPath: string;
  videoQuality: 'low' | 'medium' | 'high' | 'ultra';
  fps: number;
  audioSource: string | null;
  microphoneSource: string | null;
  includeSystemAudio: boolean;
  includeMicrophone: boolean;
  // Webcam overlay settings
  includeWebcam: boolean;
  webcamDeviceId: string | null;
  webcamPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  webcamSize: number; // Size as percentage of video width (e.g., 20 = 20%)
  webcamShape: 'circle' | 'square';
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  outputFile: string | null;
}

export interface WebcamSettings {
  enabled: boolean;
  deviceId: string | null;
  position: { x: number; y: number };
  size: { width: number; height: number };
  shape: 'circle' | 'square';
}

export interface AnnotationSettings {
  enabled: boolean;
  tool: 'pen' | 'highlighter' | 'arrow' | 'rectangle' | 'circle' | 'text';
  color: string;
  thickness: number;
}

export interface VideoProject {
  id: string;
  name: string;
  videoPath: string;
  duration: number;
  createdAt: Date;
  thumbnail: string;
}

export interface TrimSettings {
  startTime: number;
  endTime: number;
}

export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
}

export interface VideoDevice {
  deviceId: string;
  label: string;
  kind: 'videoinput';
}
