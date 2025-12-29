import { useEffect, useRef } from 'react';
import type { RecordingSettings } from '../../../shared/types';

/**
 * Get the best supported MIME type for MediaRecorder
 */
function getSupportedMimeType(): string {
  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm'
  ];

  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      console.log('Using MIME type:', mimeType);
      return mimeType;
    }
  }

  console.warn('No preferred MIME type supported, using default');
  return 'video/webm';
}

/**
 * Custom hook to handle MediaRecorder functionality
 * Listens to IPC events from main process and manages MediaRecorder lifecycle
 */
export function useMediaRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!window.electronAPI?.onStartMediaRecorder) {
      console.error('electronAPI not available for MediaRecorder');
      return;
    }

    // Listen for start command from main process
    const removeStartListener = window.electronAPI.onStartMediaRecorder(
      async ({ sourceId, settings }) => {
        console.log('Starting MediaRecorder for source:', sourceId);
        await startRecording(sourceId, settings);
      }
    );

    // Listen for stop command from main process
    const removeStopListener = window.electronAPI.onStopMediaRecorder(() => {
      console.log('Stopping MediaRecorder');
      stopRecording();
    });

    // Listen for pause command from main process
    const removePauseListener = window.electronAPI.onPauseMediaRecorder(() => {
      console.log('Pausing MediaRecorder');
      pauseRecording();
    });

    // Listen for resume command from main process
    const removeResumeListener = window.electronAPI.onResumeMediaRecorder(() => {
      console.log('Resuming MediaRecorder');
      resumeRecording();
    });

    return () => {
      removeStartListener();
      removeStopListener();
      removePauseListener();
      removeResumeListener();
      cleanup();
    };
  }, []);

  /**
   * Start recording with MediaRecorder
   */
  const startRecording = async (sourceId: string, settings: RecordingSettings) => {
    try {
      // Get screen stream from Electron desktopCapturer
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false, // We'll handle audio separately if needed
        video: {
          // @ts-ignore - Electron specific property
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId,
            minWidth: 1280,
            maxWidth: 3840,
            minHeight: 720,
            maxHeight: 2160
          }
        }
      });

      streamRef.current = stream;

      // Configure MediaRecorder with proper MIME type
      const mimeType = getSupportedMimeType();
      const options: MediaRecorderOptions = {
        mimeType,
        videoBitsPerSecond: 2500000 // 2.5 Mbps
      };

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      // Handle data available event
      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          console.log(`Chunk received: ${event.data.size} bytes`);

          // Convert blob to ArrayBuffer then to Uint8Array for proper IPC serialization
          // ArrayBuffer doesn't serialize correctly over Electron IPC, but Uint8Array does
          event.data.arrayBuffer().then((arrayBuffer) => {
            if (window.electronAPI?.sendRecordingChunk) {
              const uint8Array = new Uint8Array(arrayBuffer);
              console.log(`Sending chunk: ${uint8Array.byteLength} bytes`);
              window.electronAPI.sendRecordingChunk(uint8Array);
            }
          }).catch((error) => {
            console.error('Error converting chunk to ArrayBuffer:', error);
          });
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped');
        cleanup();
      };

      // Handle errors
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
      };

      // Start recording with timeslice (request data every 1 second)
      // This ensures chunks are sent regularly rather than all at once at the end
      mediaRecorder.start(1000);

      console.log('MediaRecorder started successfully');
      console.log('MIME type:', mimeType);
      console.log('Video bitrate:', options.videoBitsPerSecond);
    } catch (error) {
      console.error('Error starting MediaRecorder:', error);
      throw error;
    }
  };

  /**
   * Stop recording
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  /**
   * Pause recording
   */
  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
    }
  };

  /**
   * Resume recording
   */
  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
    }
  };

  /**
   * Cleanup streams and recorder
   */
  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  };

  return null; // This hook doesn't need to return anything
}
