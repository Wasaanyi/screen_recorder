import React from 'react';
import type { RecordingSettings } from '../../../shared/types';

interface SettingsProps {
  settings: RecordingSettings;
  onUpdateSettings: (settings: Partial<RecordingSettings>) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings }) => {
  const handleOutputFolderSelect = async () => {
    const folder = await window.electronAPI.selectOutputFolder();
    if (folder) {
      onUpdateSettings({ outputPath: folder });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Settings</h2>

      {/* Output folder */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Output Folder
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={settings.outputPath}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            placeholder="Select output folder..."
          />
          <button
            onClick={handleOutputFolderSelect}
            className="btn btn-secondary"
          >
            Browse
          </button>
        </div>
      </div>

      {/* Video quality */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Video Quality
        </label>
        <select
          value={settings.videoQuality}
          onChange={(e) => onUpdateSettings({ videoQuality: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="low">Low (720p, 15fps)</option>
          <option value="medium">Medium (1080p, 30fps)</option>
          <option value="high">High (1080p, 60fps)</option>
          <option value="ultra">Ultra (1440p, 60fps)</option>
        </select>
      </div>

      {/* FPS */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Frame Rate (FPS)
        </label>
        <input
          type="number"
          value={settings.fps}
          onChange={(e) => onUpdateSettings({ fps: parseInt(e.target.value) })}
          min="15"
          max="60"
          step="15"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Audio settings */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Audio Settings
        </label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.includeSystemAudio}
              onChange={(e) => onUpdateSettings({ includeSystemAudio: e.target.checked })}
              className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <span className="text-sm">Include System Audio</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.includeMicrophone}
              onChange={(e) => onUpdateSettings({ includeMicrophone: e.target.checked })}
              className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <span className="text-sm">Include Microphone</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Settings;
