import React, { useState, useEffect } from 'react';
import type { RecordingSettings } from '../../shared/types';
import { DEFAULT_SETTINGS } from '../../shared/constants';
import { useMediaRecorder } from './hooks/useMediaRecorder';
import { useRecordingState } from './hooks/useRecordingState';
import Toolbar from './components/Toolbar';
import LivePreview from './components/LivePreview';
import RightPanel from './components/RightPanel';
import SourceSelector from './components/SourceSelector';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [selectedDisplayId, setSelectedDisplayId] = useState<string | null>(null);
  const [settings, setSettings] = useState<RecordingSettings>(DEFAULT_SETTINGS);
  const [panelMode, setPanelMode] = useState<'source' | 'settings' | null>(null);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [annotateEnabled, setAnnotateEnabled] = useState(false);
  const [selectedWebcamDevice, setSelectedWebcamDevice] = useState<string | null>(null);
  const [selectedMicDevice, setSelectedMicDevice] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
        includeMicrophone: micEnabled,
        microphoneSource: selectedMicDevice,
        includeWebcam: webcamEnabled,
        webcamDeviceId: selectedWebcamDevice,
      };
      await window.electronAPI.startRecording(selectedSourceId, recordingSettings, selectedDisplayId || undefined);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording: ' + (error as Error).message);
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsProcessing(true);
      const outputFile = await window.electronAPI.stopRecording();
      setIsProcessing(false);
      alert('Recording saved to: ' + outputFile);
    } catch (error) {
      setIsProcessing(false);
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

  const handlePauseResume = () => {
    if (isPaused) {
      handleResumeRecording();
    } else {
      handlePauseRecording();
    }
  };

  const handleToggleWebcam = (enabled: boolean) => {
    setWebcamEnabled(enabled);
  };

  const handleToggleOverlay = async (enabled: boolean) => {
    setAnnotateEnabled(enabled);
    try {
      await window.electronAPI.toggleOverlay(enabled);
    } catch (error) {
      console.error('Error toggling overlay:', error);
    }
  };

  const handleSourceSelect = (sourceId: string, displayId?: string) => {
    setSelectedSourceId(sourceId);
    setSelectedDisplayId(displayId || null);
    setPanelMode(null);
  };

  return (
    <div className="flex flex-col h-screen bg-dark-bg">
      {/* Processing overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-dark-panel rounded-xl p-8 text-center max-w-sm mx-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-dark-text mb-2">Processing Recording</h3>
            <p className="text-dark-text-muted">
              Please wait while your video is being processed and converted...
            </p>
          </div>
        </div>
      )}

      {/* Toolbar - always visible */}
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
        onPauseResume={handlePauseResume}
      />

      {/* Preview area - always visible */}
      <div className="flex-1 relative">
        <LivePreview
          sourceId={selectedSourceId}
          isRecording={isRecording}
          webcamEnabled={webcamEnabled}
          webcamDeviceId={selectedWebcamDevice}
          webcamPosition={settings.webcamPosition}
          webcamSize={settings.webcamSize}
          webcamShape={settings.webcamShape}
        />
      </div>

      {/* Right panel for source/settings - hidden during recording */}
      {!isRecording && (
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
      )}
    </div>
  );
};

export default App;
