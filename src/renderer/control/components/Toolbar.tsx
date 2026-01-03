import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop, faPen, faGear, faPlay, faStop, faPause } from '@fortawesome/free-solid-svg-icons';
import { formatDuration } from '../hooks/useRecordingState';
import DeviceDropdown from './DeviceDropdown';

interface ToolbarProps {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  selectedSourceId: string | null;
  webcamEnabled: boolean;
  micEnabled: boolean;
  annotateEnabled: boolean;
  selectedWebcamDevice: string | null;
  selectedMicDevice: string | null;
  onSourceClick: () => void;
  onSettingsClick: () => void;
  onAnnotateToggle: (enabled: boolean) => void;
  onWebcamToggle: (enabled: boolean) => void;
  onMicToggle: (enabled: boolean) => void;
  onWebcamDeviceSelect: (deviceId: string) => void;
  onMicDeviceSelect: (deviceId: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseResume: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  isRecording,
  isPaused,
  duration,
  selectedSourceId,
  webcamEnabled,
  micEnabled,
  annotateEnabled,
  selectedWebcamDevice,
  selectedMicDevice,
  onSourceClick,
  onSettingsClick,
  onAnnotateToggle,
  onWebcamToggle,
  onMicToggle,
  onWebcamDeviceSelect,
  onMicDeviceSelect,
  onStartRecording,
  onStopRecording,
  onPauseResume,
}) => {
  return (
    <div className="bg-dark-panel border-b border-dark-border px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Timer with recording indicator */}
        <div className="flex items-center gap-2 min-w-[120px] shrink-0">
          {isRecording && (
            <div className={`recording-indicator ${isPaused ? 'paused' : ''}`} />
          )}
          <div className="text-2xl font-mono font-bold text-dark-text">
            {formatDuration(duration)}
          </div>
        </div>

        {/* Center Controls */}
        <div className="flex items-center gap-3 justify-center flex-1">
          {/* Source button */}
          <button
            onClick={onSourceClick}
            disabled={isRecording}
            className={`toolbar-button-with-text ${selectedSourceId ? 'active' : ''}`}
            title="Select source"
          >
            <FontAwesomeIcon icon={faDesktop} className="w-4 h-4" />
            <span>Source</span>
          </button>

          {/* Annotate button - icon only */}
          <button
            onClick={() => onAnnotateToggle(!annotateEnabled)}
            className={`toolbar-button-icon ${annotateEnabled ? 'active' : ''}`}
            title="Toggle annotations"
          >
            <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
          </button>

          {/* Webcam dropdown */}
          <DeviceDropdown
            type="video"
            enabled={webcamEnabled}
            selectedDeviceId={selectedWebcamDevice}
            onToggle={onWebcamToggle}
            onDeviceSelect={onWebcamDeviceSelect}
          />

          {/* Mic dropdown */}
          <DeviceDropdown
            type="audio"
            enabled={micEnabled}
            selectedDeviceId={selectedMicDevice}
            onToggle={onMicToggle}
            onDeviceSelect={onMicDeviceSelect}
          />

          {/* Settings button - icon only */}
          <button
            onClick={onSettingsClick}
            className="toolbar-button-icon"
            disabled={isRecording}
            title="Settings"
          >
            <FontAwesomeIcon icon={faGear} className="w-4 h-4" />
          </button>
        </div>

        {/* Recording controls */}
        <div className="flex items-center gap-2 shrink-0">
          {isRecording && (
            <button
              onClick={onPauseResume}
              className="toolbar-button-with-text"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              <FontAwesomeIcon icon={isPaused ? faPlay : faPause} className="w-4 h-4" />
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          )}

          <button
            onClick={isRecording ? onStopRecording : onStartRecording}
            disabled={!isRecording && !selectedSourceId}
            className={`px-5 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              isRecording
                ? 'bg-danger hover:bg-danger-dark text-white'
                : 'bg-primary hover:bg-primary-dark text-white disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <FontAwesomeIcon icon={isRecording ? faStop : faPlay} className="w-4 h-4" />
            <span>{isRecording ? 'Stop' : 'Start'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
