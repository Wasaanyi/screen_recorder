import React, { useState, useEffect } from 'react';
import type { RecordingSettings } from '../../../shared/types';

interface RecordingControlsProps {
  selectedSourceId: string | null;
  settings: RecordingSettings;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onToggleWebcam: (enabled: boolean) => void;
  onToggleOverlay: (enabled: boolean) => void;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  selectedSourceId,
  settings,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onToggleWebcam,
  onToggleOverlay
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [overlayEnabled, setOverlayEnabled] = useState(false);

  useEffect(() => {
    if (!window.electronAPI?.onRecordingStateChanged) {
      console.error('electronAPI not available');
      return;
    }

    const removeListener = window.electronAPI.onRecordingStateChanged((state) => {
      setIsRecording(state.isRecording);
      setIsPaused(state.isPaused);
      setDuration(state.duration);
    });

    return () => removeListener();
  }, []);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleWebcamToggle = () => {
    const newState = !webcamEnabled;
    setWebcamEnabled(newState);
    onToggleWebcam(newState);
  };

  const handleOverlayToggle = () => {
    const newState = !overlayEnabled;
    setOverlayEnabled(newState);
    onToggleOverlay(newState);
  };

  return (
    <div className="space-y-6">
      {/* Recording status */}
      {isRecording && (
        <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="recording-indicator"></div>
            <span className="font-medium">
              {isPaused ? 'Paused' : 'Recording'}
            </span>
          </div>
          <div className="text-2xl font-mono font-bold">
            {formatDuration(duration)}
          </div>
        </div>
      )}

      {/* Feature toggles */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleWebcamToggle}
          disabled={isRecording}
          className={`btn ${webcamEnabled ? 'btn-primary' : 'btn-secondary'} ${isRecording ? 'btn-disabled' : ''}`}
        >
          {webcamEnabled ? '✓ ' : ''}Webcam
        </button>
        <button
          onClick={handleOverlayToggle}
          disabled={isRecording}
          className={`btn ${overlayEnabled ? 'btn-primary' : 'btn-secondary'} ${isRecording ? 'btn-disabled' : ''}`}
        >
          {overlayEnabled ? '✓ ' : ''}Annotations
        </button>
      </div>

      {/* Main recording controls */}
      <div className="space-y-3">
        {!isRecording ? (
          <button
            onClick={onStartRecording}
            disabled={!selectedSourceId}
            className={`btn btn-primary w-full py-4 text-lg ${!selectedSourceId ? 'btn-disabled' : ''}`}
          >
            Start Recording
          </button>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={isPaused ? onResumeRecording : onPauseRecording}
                className="btn btn-secondary py-3"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={onStopRecording}
                className="btn btn-danger py-3"
              >
                Stop Recording
              </button>
            </div>
          </>
        )}
      </div>

      {/* Output info */}
      {!isRecording && (
        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          <div><strong>Output:</strong> {settings.outputPath || 'Not set'}</div>
          <div><strong>Quality:</strong> {settings.videoQuality}</div>
          <div><strong>FPS:</strong> {settings.fps}</div>
        </div>
      )}
    </div>
  );
};

export default RecordingControls;
