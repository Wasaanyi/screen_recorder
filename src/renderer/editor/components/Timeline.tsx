import React from 'react';

interface TimelineProps {
  duration: number;
  currentTime: number;
  startTime: number;
  endTime: number;
  onStartTimeChange: (time: number) => void;
  onEndTimeChange: (time: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({
  duration,
  currentTime,
  startTime,
  endTime,
  onStartTimeChange: _onStartTimeChange,
  onEndTimeChange: _onEndTimeChange
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold">Timeline</h3>

      {/* Visual timeline */}
      <div className="relative h-20 bg-gray-100 rounded-lg overflow-hidden">
        {/* Trim region */}
        <div
          className="absolute top-0 bottom-0 bg-blue-200"
          style={{
            left: `${(startTime / duration) * 100}%`,
            right: `${100 - (endTime / duration) * 100}%`
          }}
        />

        {/* Current time indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500"
          style={{
            left: `${(currentTime / duration) * 100}%`
          }}
        />

        {/* Start marker */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-blue-500 cursor-ew-resize"
          style={{
            left: `${(startTime / duration) * 100}%`
          }}
        />

        {/* End marker */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-blue-500 cursor-ew-resize"
          style={{
            left: `${(endTime / duration) * 100}%`
          }}
        />
      </div>

      {/* Time markers */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>0:00</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default Timeline;
