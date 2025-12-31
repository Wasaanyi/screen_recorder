import React from 'react';
import { formatDuration } from '../hooks/useRecordingState';

interface FloatingToolbarProps {
  duration: number;
  isPaused: boolean;
  webcamEnabled: boolean;
  micEnabled: boolean;
  annotateEnabled: boolean;
  onPauseResume: () => void;
  onStop: () => void;
  onWebcamToggle: (enabled: boolean) => void;
  onMicToggle: (enabled: boolean) => void;
  onAnnotateToggle: (enabled: boolean) => void;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = (props) => {
  const {
    duration,
    isPaused,
    webcamEnabled,
    micEnabled,
    annotateEnabled,
    onPauseResume,
    onStop,
    onWebcamToggle,
    onMicToggle,
    onAnnotateToggle,
  } = props;
  
  const activeClass = 'bg-primary text-white';
  const inactiveClass = 'bg-dark-hover text-dark-text hover:bg-dark-border';

  return (
    <div className="floating-toolbar max-w-4xl">
      <div className="flex items-center justify-between space-x-6">
        <div className="flex items-center space-x-3">
          <div className="recording-indicator" />
          <div className="text-xl font-mono font-bold text-dark-text">
            {formatDuration(duration)}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onAnnotateToggle(!annotateEnabled)}
            className={'px-3 py-2 rounded-lg text-sm transition-colors ' + (annotateEnabled ? activeClass : inactiveClass)}
          >
            Annotate
          </button>

          <button
            onClick={() => onWebcamToggle(!webcamEnabled)}
            className={'px-3 py-2 rounded-lg text-sm transition-colors ' + (webcamEnabled ? activeClass : inactiveClass)}
          >
            Webcam
          </button>

          <button
            onClick={() => onMicToggle(!micEnabled)}
            className={'px-3 py-2 rounded-lg text-sm transition-colors ' + (micEnabled ? activeClass : inactiveClass)}
          >
            Mic
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onPauseResume}
            className="px-4 py-2 rounded-lg bg-dark-hover text-dark-text hover:bg-dark-border transition-colors"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>

          <button
            onClick={onStop}
            className="px-4 py-2 rounded-lg bg-danger text-white hover:bg-danger-dark transition-colors font-semibold"
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingToolbar;
