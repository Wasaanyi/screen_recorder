import React, { useState, useEffect } from 'react';
import type { RecordingSettings } from '../../shared/types';
import { DEFAULT_SETTINGS } from '../../shared/constants';
import { useMediaRecorder } from './hooks/useMediaRecorder';
import { useRecordingState } from './hooks/useRecordingState';
import Toolbar from './components/Toolbar';
import FloatingToolbar from './components/FloatingToolbar';
import LivePreview from './components/LivePreview';
import RightPanel from './components/RightPanel';
import SourceSelector from './components/SourceSelector';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [settings, setSettings] = useState<RecordingSettings>(DEFAULT_SETTINGS);
  const [panelMode, setPanelMode] = useState<'source' | 'settings' | null>(null);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [annotateEnabled, setAnnotateEnabled] = useState(false);
  const [selectedWebcamDevice, setSelectedWebcamDevice] = useState<string | null>(null);
  const [selectedMicDevice, setSelectedMicDevice] = useState<string | null>(null);

  const { isRecording, isPaused, duration } = useRecordingState();
  useMediaRecorder();

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (isRecording) {
      setPanelMode(null);
    }
  }, [isRecording]);

  const loadSettings = async () => {
    try {
      if (!window.electronAPI?.getSettings) {
        console.error('electronAPI not available');
        return;
      }
      const loadedSettings = await window.electronAPI.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleUpdateSettings = async (updatedSettings: Partial<RecordingSettings>) => {
    const newSettings = { ...settings, ...updatedSettings };
    setSettings(newSettings);
    try {
      await window.electronAPI.updateSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleStartRecording = async () => {
    if (!selectedSourceId) return;

    try {
      const recordingSettings = {
        ...settings,
        microphoneSource: selectedMicDevice,
      };
      await window.electronAPI.startRecording(selectedSourceId, recordingSettings);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording: ' + (error as Error).message);
    }
  };

  const handleStopRecording = async () => {
    try {
      const outputFile = await window.electronAPI.stopRecording();
      alert('Recording saved to: ' + outputFile);
    } catch (error) {
      console.error('Error stopping recording:', error);
      alert('Failed to stop recording: ' + (error as Error).message);
    }
  };

  const handlePauseRecording = async () => {
    try {
      await window.electronAPI.pauseRecording();
    } catch (error) {
      console.error('Error pausing recording:', error);
    }
  };

  const handleResumeRecording = async () => {
    try {
      await window.electronAPI.resumeRecording();
    } catch (error) {
      console.error('Error resuming recording:', error);
    }
  };

  const handleToggleWebcam = async (enabled: boolean) => {
    setWebcamEnabled(enabled);
    try {
      await window.electronAPI.toggleWebcam(enabled);
    } catch (error) {
      console.error('Error toggling webcam:', error);
    }
  };

  const handleToggleOverlay = async (enabled: boolean) => {
    setAnnotateEnabled(enabled);
    try {
      await window.electronAPI.toggleOverlay(enabled);
    } catch (error) {
      console.error('Error toggling overlay:', error);
    }
  };

  const handleSourceSelect = (sourceId: string) => {
    setSelectedSourceId(sourceId);
    setPanelMode(null);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      handleResumeRecording();
    } else {
      handlePauseRecording();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-dark-bg">
      {!isRecording && (
        <>
          <Toolbar
            isRecording={isRecording}
            isPaused={isPaused}
            duration={duration}
            selectedSourceId={selectedSourceId}
            webcamEnabled={webcamEnabled}
            micEnabled={micEnabled}
            annotateEnabled={annotateEnabled}
            selectedWebcamDevice={selectedWebcamDevice}
            selectedMicDevice={selectedMicDevice}
            onSourceClick={() => setPanelMode(panelMode === 'source' ? null : 'source')}
            onSettingsClick={() => setPanelMode(panelMode === 'settings' ? null : 'settings')}
            onAnnotateToggle={handleToggleOverlay}
            onWebcamToggle={handleToggleWebcam}
            onMicToggle={setMicEnabled}
            onWebcamDeviceSelect={setSelectedWebcamDevice}
            onMicDeviceSelect={setSelectedMicDevice}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
          />
          <div className="flex-1 relative">
            <LivePreview sourceId={selectedSourceId} isRecording={false} />
          </div>
        </>
      )}

      {isRecording && (
        <div className="flex items-center justify-center h-full">
          <FloatingToolbar
            duration={duration}
            isPaused={isPaused}
            webcamEnabled={webcamEnabled}
            micEnabled={micEnabled}
            annotateEnabled={annotateEnabled}
            onPauseResume={handlePauseResume}
            onStop={handleStopRecording}
            onWebcamToggle={handleToggleWebcam}
            onMicToggle={setMicEnabled}
            onAnnotateToggle={handleToggleOverlay}
          />
        </div>
      )}

      <RightPanel mode={panelMode} onClose={() => setPanelMode(null)}>
        {panelMode === 'source' && (
          <SourceSelector
            onSourceSelect={handleSourceSelect}
            selectedSourceId={selectedSourceId}
          />
        )}
        {panelMode === 'settings' && (
          <Settings
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </RightPanel>
    </div>
  );
};

export default App;
