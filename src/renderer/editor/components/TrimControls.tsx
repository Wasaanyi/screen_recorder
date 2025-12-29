import React from 'react';

interface TrimControlsProps {
  startTime: number;
  endTime: number;
  duration: number;
  onStartTimeChange: (time: number) => void;
  onEndTimeChange: (time: number) => void;
  onTrim: () => void;
  onExport: () => void;
}

const TrimControls: React.FC<TrimControlsProps> = ({
  startTime,
  endTime,
  duration,
  onStartTimeChange,
  onEndTimeChange,
  onTrim,
  onExport
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const trimmedDuration = endTime - startTime;

  return (
    <div className="bg-white rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold">Trim Controls</h3>

      {/* Start time */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Start Time: {formatTime(startTime)}
        </label>
        <input
          type="range"
          min="0"
          max={endTime}
          step="0.1"
          value={startTime}
          onChange={(e) => onStartTimeChange(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* End time */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          End Time: {formatTime(endTime)}
        </label>
        <input
          type="range"
          min={startTime}
          max={duration}
          step="0.1"
          value={endTime}
          onChange={(e) => onEndTimeChange(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Info */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Original Duration:</span>
          <span className="font-medium">{formatTime(duration)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Trimmed Duration:</span>
          <span className="font-medium">{formatTime(trimmedDuration)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={onTrim}
          className="btn btn-primary w-full"
        >
          Apply Trim
        </button>
        <button
          onClick={onExport}
          className="btn btn-success w-full"
        >
          Export Video
        </button>
      </div>
    </div>
  );
};

export default TrimControls;
