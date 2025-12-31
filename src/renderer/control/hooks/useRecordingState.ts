import { useState, useEffect } from 'react';

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
}

export function useRecordingState() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!window.electronAPI?.onRecordingStateChanged) {
      console.error('electronAPI not available');
      return;
    }

    const removeListener = window.electronAPI.onRecordingStateChanged((state: RecordingState) => {
      setIsRecording(state.isRecording);
      setIsPaused(state.isPaused);
      setDuration(state.duration);
    });

    return () => removeListener();
  }, []);

  return { isRecording, isPaused, duration };
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const h = hours.toString().padStart(2, '0');
  const m = minutes.toString().padStart(2, '0');
  const s = secs.toString().padStart(2, '0');
  return h + ':' + m + ':' + s;
}
