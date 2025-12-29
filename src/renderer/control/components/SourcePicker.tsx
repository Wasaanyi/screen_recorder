import React, { useEffect, useState } from 'react';
import type { ScreenSource } from '../../../shared/types';

interface SourcePickerProps {
  onSourceSelect: (sourceId: string) => void;
  selectedSourceId: string | null;
}

const SourcePicker: React.FC<SourcePickerProps> = ({ onSourceSelect, selectedSourceId }) => {
  const [sources, setSources] = useState<ScreenSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    setLoading(true);
    try {
      if (!window.electronAPI?.getScreenSources) {
        console.error('electronAPI not available');
        return;
      }
      const screenSources = await window.electronAPI.getScreenSources();
      setSources(screenSources);
    } catch (error) {
      console.error('Error loading screen sources:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading sources...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Select Screen or Window</h2>
        <button
          onClick={loadSources}
          className="btn btn-secondary text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
        {sources.map((source) => (
          <div
            key={source.id}
            onClick={() => onSourceSelect(source.id)}
            className={`source-card ${selectedSourceId === source.id ? 'selected' : ''}`}
          >
            <img
              src={source.thumbnail}
              alt={source.name}
              className="w-full h-32 object-cover rounded mb-2"
            />
            <div className="flex items-start space-x-2">
              {source.appIcon && (
                <img
                  src={source.appIcon}
                  alt=""
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                />
              )}
              <p className="text-sm font-medium truncate flex-1">{source.name}</p>
            </div>
          </div>
        ))}
      </div>

      {sources.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No sources available. Click Refresh to try again.
        </div>
      )}
    </div>
  );
};

export default SourcePicker;
