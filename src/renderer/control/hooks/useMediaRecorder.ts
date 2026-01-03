import { useEffect, useRef } from 'react';
import type { RecordingSettings } from '../../../shared/types';

/**
 * Mix multiple audio tracks into a single track using Web Audio API
 * This is necessary because MediaRecorder only records one audio track
 * Returns both the mixed track and the AudioContext (which must be kept alive)
 */
function mixAudioTracks(audioTracks: MediaStreamTrack[]): { track: MediaStreamTrack | null; audioContext: AudioContext | null } {
  if (audioTracks.length === 0) {
    return { track: null, audioContext: null };
  }

  if (audioTracks.length === 1) {
    return { track: audioTracks[0], audioContext: null };
  }

  // Create audio context for mixing
  const audioContext = new AudioContext();
  const destination = audioContext.createMediaStreamDestination();

  // Connect each audio track to the destination
  for (const track of audioTracks) {
    const source = audioContext.createMediaStreamSource(new MediaStream([track]));
    source.connect(destination);
  }

  console.log(`Mixed ${audioTracks.length} audio tracks into one`);
  return { track: destination.stream.getAudioTracks()[0], audioContext };
}

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
 * Calculate webcam position based on settings
 */
function getWebcamPosition(
  position: RecordingSettings['webcamPosition'],
  canvasWidth: number,
  canvasHeight: number,
  webcamSize: number,
  padding: number
): { x: number; y: number } {
  switch (position) {
    case 'bottom-right':
      return { x: canvasWidth - webcamSize - padding, y: canvasHeight - webcamSize - padding };
    case 'bottom-left':
      return { x: padding, y: canvasHeight - webcamSize - padding };
    case 'top-right':
      return { x: canvasWidth - webcamSize - padding, y: padding };
    case 'top-left':
      return { x: padding, y: padding };
    default:
      return { x: canvasWidth - webcamSize - padding, y: canvasHeight - webcamSize - padding };
  }
}

/**
 * Custom hook to handle MediaRecorder functionality
 * Listens to IPC events from main process and manages MediaRecorder lifecycle
 */
export function useMediaRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isRecordingRef = useRef<boolean>(false);

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
      isRecordingRef.current = true;
      const audioTracks: MediaStreamTrack[] = [];

      // Try to capture system audio along with video if enabled
      // On Windows, system audio capture requires specific handling
      let videoStream: MediaStream;

      if (settings.includeSystemAudio) {
        try {
          // Try to get both video and system audio in one call
          videoStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              // @ts-ignore - Electron specific property
              mandatory: {
                chromeMediaSource: 'desktop'
              }
            },
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
          // Add any audio tracks from the desktop capture
          videoStream.getAudioTracks().forEach(track => {
            audioTracks.push(track);
            console.log('Added system audio track:', track.label);
          });
        } catch (err) {
          console.warn('Could not capture with system audio, trying video only:', err);
          // Fallback to video only
          videoStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
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
        }
      } else {
        // Video only capture
        videoStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
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
      }

      // Capture microphone if enabled
      if (settings.includeMicrophone) {
        try {
          const micConstraints: MediaStreamConstraints = {
            audio: settings.microphoneSource
              ? { deviceId: { exact: settings.microphoneSource } }
              : true,
            video: false
          };
          const micStream = await navigator.mediaDevices.getUserMedia(micConstraints);
          micStream.getAudioTracks().forEach(track => {
            audioTracks.push(track);
            console.log('Added microphone track:', track.label);
          });
        } catch (err) {
          console.warn('Could not capture microphone:', err);
        }
      }

      // Capture webcam if enabled
      let webcamStream: MediaStream | null = null;
      if (settings.includeWebcam) {
        try {
          const webcamConstraints: MediaStreamConstraints = {
            video: settings.webcamDeviceId
              ? { deviceId: { exact: settings.webcamDeviceId }, width: { ideal: 640 }, height: { ideal: 480 } }
              : { width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false
          };
          webcamStream = await navigator.mediaDevices.getUserMedia(webcamConstraints);
          webcamStreamRef.current = webcamStream;
          console.log('Webcam stream captured');
        } catch (err) {
          console.warn('Could not capture webcam:', err);
        }
      }

      // Mix audio tracks using Web Audio API (MediaRecorder only supports one audio track)
      const { track: mixedAudioTrack, audioContext } = mixAudioTracks(audioTracks);

      // Store audio context reference to keep it alive during recording
      audioContextRef.current = audioContext;

      // Determine if we need canvas compositing (for webcam overlay)
      let finalVideoStream: MediaStream;

      if (webcamStream) {
        // Create canvas for compositing screen + webcam
        const canvas = document.createElement('canvas');
        const screenVideo = document.createElement('video');
        const webcamVideo = document.createElement('video');

        // Get video track settings to determine dimensions
        const videoTrack = videoStream.getVideoTracks()[0];
        const videoSettings = videoTrack.getSettings();
        const canvasWidth = videoSettings.width || 1920;
        const canvasHeight = videoSettings.height || 1080;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        canvasRef.current = canvas;
        screenVideoRef.current = screenVideo;
        webcamVideoRef.current = webcamVideo;

        // Set up screen video
        screenVideo.srcObject = videoStream;
        screenVideo.muted = true;
        await screenVideo.play();

        // Set up webcam video
        webcamVideo.srcObject = webcamStream;
        webcamVideo.muted = true;
        await webcamVideo.play();

        // Calculate webcam size and position
        const webcamSizePercent = settings.webcamSize || 15;
        const webcamSize = Math.round((canvasWidth * webcamSizePercent) / 100);
        const padding = 30;
        const webcamPosition = getWebcamPosition(
          settings.webcamPosition || 'bottom-right',
          canvasWidth,
          canvasHeight,
          webcamSize,
          padding
        );

        const ctx = canvas.getContext('2d')!;
        const isCircle = settings.webcamShape === 'circle';
        const borderWidth = 4;

        // Start drawing loop
        const draw = () => {
          if (!isRecordingRef.current) return;

          // Draw screen capture
          ctx.drawImage(screenVideo, 0, 0, canvasWidth, canvasHeight);

          // Draw webcam overlay
          if (isCircle) {
            const centerX = webcamPosition.x + webcamSize / 2;
            const centerY = webcamPosition.y + webcamSize / 2;
            const radius = webcamSize / 2;

            // Draw drop shadow
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX + 4, centerY + 4, radius + borderWidth / 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.filter = 'blur(8px)';
            ctx.fill();
            ctx.restore();

            // Circular webcam
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            // Draw webcam video (mirrored)
            ctx.translate(webcamPosition.x + webcamSize, webcamPosition.y);
            ctx.scale(-1, 1);
            ctx.drawImage(webcamVideo, 0, 0, webcamSize, webcamSize);

            ctx.restore();

            // Draw border
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = borderWidth;
            ctx.stroke();
          } else {
            // Draw drop shadow for square
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.filter = 'blur(8px)';
            ctx.fillRect(
              webcamPosition.x + 4,
              webcamPosition.y + 4,
              webcamSize + borderWidth,
              webcamSize + borderWidth
            );
            ctx.restore();

            // Square webcam
            ctx.save();

            // Draw webcam video (mirrored)
            ctx.translate(webcamPosition.x + webcamSize, webcamPosition.y);
            ctx.scale(-1, 1);
            ctx.drawImage(webcamVideo, 0, 0, webcamSize, webcamSize);

            ctx.restore();

            // Draw border
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = borderWidth;
            ctx.strokeRect(webcamPosition.x, webcamPosition.y, webcamSize, webcamSize);
          }

          animationFrameRef.current = requestAnimationFrame(draw);
        };

        // Start drawing
        draw();

        // Get stream from canvas
        const fps = settings.fps || 30;
        finalVideoStream = canvas.captureStream(fps);
        console.log('Using canvas composited stream with webcam overlay');
      } else {
        // No webcam, use screen video directly
        finalVideoStream = new MediaStream(videoStream.getVideoTracks());
      }

      // Create combined stream with video and mixed audio
      const combinedStream = new MediaStream([
        ...finalVideoStream.getVideoTracks(),
        ...(mixedAudioTrack ? [mixedAudioTrack] : [])
      ]);

      streamRef.current = combinedStream;

      console.log('Combined stream tracks:', combinedStream.getTracks().map(t => `${t.kind}: ${t.label}`));
      console.log('Audio tracks before mixing:', audioTracks.length);
      console.log('Has mixed audio track:', !!mixedAudioTrack);
      console.log('Webcam enabled:', !!webcamStream);

      // Configure MediaRecorder with proper MIME type
      const mimeType = getSupportedMimeType();
      const options: MediaRecorderOptions = {
        mimeType,
        videoBitsPerSecond: 2500000 // 2.5 Mbps
      };

      const mediaRecorder = new MediaRecorder(combinedStream, options);
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
    isRecordingRef.current = false;
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
   * Cleanup streams, recorder, canvas, and audio context
   */
  const cleanup = () => {
    isRecordingRef.current = false;

    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop webcam stream
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach(track => track.stop());
      webcamStreamRef.current = null;
    }

    // Clean up video elements
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
      screenVideoRef.current = null;
    }
    if (webcamVideoRef.current) {
      webcamVideoRef.current.srcObject = null;
      webcamVideoRef.current = null;
    }

    // Clean up canvas
    canvasRef.current = null;

    // Stop main stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(err => console.warn('Error closing AudioContext:', err));
      audioContextRef.current = null;
    }

    mediaRecorderRef.current = null;
  };

  return null; // This hook doesn't need to return anything
}
