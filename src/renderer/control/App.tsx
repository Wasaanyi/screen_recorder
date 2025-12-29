import React, { useState, useEffect } from 'react';
import SourcePicker from './components/SourcePicker';
import RecordingControls from './components/RecordingControls';
import Settings from './components/Settings';
import type { RecordingSettings } from '../../shared/types';
import { DEFAULT_SETTINGS } from '../../shared/constants';
import { useMediaRecorder } from './hooks/useMediaRecorder';

const App: React.FC = () => {
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [settings, setSettings] = useState<RecordingSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'source' | 'settings'>('source');

  // Initialize MediaRecorder hook to handle recording
  useMediaRecorder();

  useEffect(() => {
    loadSettings();
  }, []);

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
      await window.electronAPI.startRecording(selectedSourceId, settings);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording: ' + (error as Error).message);
    }
  };

  const handleStopRecording = async () => {
    try {
      const outputFile = await window.electronAPI.stopRecording();
      alert(`Recording saved to: ${outputFile}`);
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
    try {
      await window.electronAPI.toggleWebcam(enabled);
    } catch (error) {
      console.error('Error toggling webcam:', error);
    }
  };

  const handleToggleOverlay = async (enabled: boolean) => {
    try {
      await window.electronAPI.toggleOverlay(enabled);
    } catch (error) {
      console.error('Error toggling overlay:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">Screen Recorder</h1>
        </div>

        <nav className="flex-1 p-4">
          <button
            onClick={() => setActiveTab('source')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === 'source'
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Recording
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'settings'
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Settings
          </button>
        </nav>

        <div className="p-4 border-t text-xs text-gray-500">
          <p>Version 1.0.0</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'source' ? (
            <div className="space-y-6">
              <SourcePicker
                onSourceSelect={setSelectedSourceId}
                selectedSourceId={selectedSourceId}
              />
            </div>
          ) : (
            <Settings
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}
        </div>

        {/* Control panel - always visible at bottom */}
        <div className="bg-white border-t shadow-lg p-6">
          <RecordingControls
            selectedSourceId={selectedSourceId}
            settings={settings}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onPauseRecording={handlePauseRecording}
            onResumeRecording={handleResumeRecording}
            onToggleWebcam={handleToggleWebcam}
            onToggleOverlay={handleToggleOverlay}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
