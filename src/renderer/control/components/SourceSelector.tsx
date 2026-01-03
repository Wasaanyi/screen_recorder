import React, { useEffect, useState } from 'react';
import type { ScreenSource } from '../../../shared/types';

interface SourceSelectorProps {
  onSourceSelect: (sourceId: string, displayId?: string) => void;
  selectedSourceId: string | null;
}

const SourceSelector: React.FC<SourceSelectorProps> = ({ onSourceSelect, selectedSourceId }) => {
  const [sources, setSources] = useState<ScreenSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'screen' | 'window'>('screen');

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

  const filterSources = (type: 'screen' | 'window') => {
    if (type === 'screen') {
      return sources.filter(s => s.id.startsWith('screen:'));
    } else {
      return sources.filter(s => !s.id.startsWith('screen:'));
    }
  };

  const filteredSources = filterSources(activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-dark-text-muted">Loading sources...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 border-b border-dark-border">
        <button
          onClick={() => setActiveTab('window')}
          className={'px-4 py-2 font-medium transition-colors border-b-2 ' + (activeTab === 'window' ? 'border-primary text-primary' : 'border-transparent text-dark-text-muted hover:text-dark-text')}
        >
          Window
        </button>
        <button
          onClick={() => setActiveTab('screen')}
          className={'px-4 py-2 font-medium transition-colors border-b-2 ' + (activeTab === 'screen' ? 'border-primary text-primary' : 'border-transparent text-dark-text-muted hover:text-dark-text')}
        >
          Entire Screen
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {filteredSources.map((source) => (
          <div
            key={source.id}
            onClick={() => onSourceSelect(source.id, source.display_id)}
            className={'border-2 rounded-lg p-3 cursor-pointer transition-all ' + (selectedSourceId === source.id ? 'border-primary bg-primary/10' : 'border-dark-border hover:border-primary/50')}
          >
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                checked={selectedSourceId === source.id}
                onChange={() => {}}
                className="w-4 h-4"
              />
              <img
                src={source.thumbnail}
                alt={source.name}
                className="w-24 h-16 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  {source.appIcon && (
                    <img src={source.appIcon} alt="" className="w-5 h-5 flex-shrink-0" />
                  )}
                  <p className="text-sm font-medium truncate text-dark-text">{source.name}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSources.length === 0 && (
        <div className="text-center py-8 text-dark-text-muted">
          No {activeTab === 'screen' ? 'screens' : 'windows'} available.
        </div>
      )}

      <button
        onClick={loadSources}
        className="w-full btn btn-secondary-dark text-sm mt-4"
      >
        Refresh Sources
      </button>
    </div>
  );
};

export default SourceSelector;
