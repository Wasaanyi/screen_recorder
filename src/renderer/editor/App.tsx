import React, { useState, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import Timeline from './components/Timeline';
import TrimControls from './components/TrimControls';

const App: React.FC = () => {
  const [videoPath, setVideoPath] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  useEffect(() => {
    // Get video path from URL params
    const params = new URLSearchParams(window.location.search);
    const video = params.get('video');
    if (video) {
      setVideoPath(decodeURIComponent(video));
    }
  }, []);

  useEffect(() => {
    if (duration > 0 && endTime === 0) {
      setEndTime(duration);
    }
  }, [duration]);

  const handleTimeUpdate = (current: number, total: number) => {
    setCurrentTime(current);
    if (duration === 0) {
      setDuration(total);
    }
  };

  const handleTrim = async () => {
    try {
      const trimmedPath = await window.electronAPI.trimVideo(videoPath, {
        startTime,
        endTime
      });
      alert(`Video trimmed successfully!\nSaved to: ${trimmedPath}`);
    } catch (error) {
      console.error('Error trimming video:', error);
      alert('Failed to trim video: ' + (error as Error).message);
    }
  };

  const handleExport = async () => {
    try {
      const outputPath = await window.electronAPI.selectOutputFolder();
      if (!outputPath) return;

      await window.electronAPI.exportVideo(videoPath, outputPath);
      alert(`Video exported successfully to: ${outputPath}`);
    } catch (error) {
      console.error('Error exporting video:', error);
      alert('Failed to export video: ' + (error as Error).message);
    }
  };

  if (!videoPath) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-gray-500">No video selected</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold text-gray-800">Video Editor</h1>
        <p className="text-sm text-gray-600 truncate">{videoPath}</p>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Video player */}
          <VideoPlayer
            videoPath={videoPath}
            onTimeUpdate={handleTimeUpdate}
          />

          {/* Timeline */}
          <Timeline
            duration={duration}
            currentTime={currentTime}
            startTime={startTime}
            endTime={endTime}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
          />

          {/* Trim controls */}
          <TrimControls
            startTime={startTime}
            endTime={endTime}
            duration={duration}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
            onTrim={handleTrim}
            onExport={handleExport}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
