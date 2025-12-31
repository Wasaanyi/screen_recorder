import React from 'react';
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
}) => {
  return (
    <div className="bg-dark-panel border-b border-dark-border px-3 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Timer - responsive sizing */}
        <div className="text-lg sm:text-2xl font-mono font-bold text-dark-text min-w-[70px] sm:min-w-[100px] shrink-0">
          {formatDuration(duration)}
        </div>

        {/* Center Controls - can wrap and grow to fill space */}
        <div className="flex items-center gap-2 flex-wrap justify-center flex-1">
          <button
            onClick={onSourceClick}
            disabled={isRecording}
            className={'toolbar-button text-sm whitespace-nowrap ' + (selectedSourceId ? 'active' : '')}
          >
            <span>Source</span>
          </button>

          <button
            onClick={() => onAnnotateToggle(!annotateEnabled)}
            className={'toolbar-button text-sm whitespace-nowrap ' + (annotateEnabled ? 'active' : '')}
          >
            <span>Annotate</span>
          </button>

          <DeviceDropdown
            type="video"
            enabled={webcamEnabled}
            selectedDeviceId={selectedWebcamDevice}
            onToggle={onWebcamToggle}
            onDeviceSelect={onWebcamDeviceSelect}
            icon=""
            label="Webcam"
          />

          <DeviceDropdown
            type="audio"
            enabled={micEnabled}
            selectedDeviceId={selectedMicDevice}
            onToggle={onMicToggle}
            onDeviceSelect={onMicDeviceSelect}
            icon=""
            label="Mic"
          />

          <button
            onClick={onSettingsClick}
            className="toolbar-button text-sm whitespace-nowrap"
            disabled={isRecording}
          >
            <span>Settings</span>
          </button>
        </div>

        {/* Start/Stop Button - responsive text and padding */}
        <button
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={!isRecording && !selectedSourceId}
          className={'px-3 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 whitespace-nowrap shrink-0 ' + (isRecording ? 'bg-danger hover:bg-danger-dark text-white' : 'bg-primary hover:bg-primary-dark text-white disabled:opacity-50 disabled:cursor-not-allowed')}
        >
          {isRecording ? (
            <span>Stop</span>
          ) : (
            <>
              <span className="hidden lg:inline">Start Recording</span>
              <span className="lg:hidden">Start</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
