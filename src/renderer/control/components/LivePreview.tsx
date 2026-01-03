import React, { useRef, useEffect, useState } from 'react';

interface LivePreviewProps {
  sourceId: string | null;
  isRecording: boolean;
  webcamEnabled: boolean;
  webcamDeviceId: string | null;
  webcamPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  webcamSize?: number;
  webcamShape?: 'circle' | 'square';
}

const LivePreview: React.FC<LivePreviewProps> = ({
  sourceId,
  isRecording: _isRecording,
  webcamEnabled,
  webcamDeviceId,
  webcamPosition = 'bottom-right',
  webcamSize = 15,
  webcamShape = 'circle',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const webcamRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Handle screen source stream
  useEffect(() => {
    if (!sourceId) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setVideoLoaded(false);
      return;
    }

    const getStream = async () => {
      try {
        const stream = await (navigator.mediaDevices.getUserMedia as any)({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sourceId,
              minWidth: 1280,
              maxWidth: 1920,
              minHeight: 720,
              maxHeight: 1080,
            }
          }
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setVideoLoaded(true);
        }
      } catch (error) {
        console.error('Preview error:', error);
      }
    };

    getStream();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [sourceId]);

  // Handle webcam stream
  useEffect(() => {
    if (!webcamEnabled) {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(track => track.stop());
        webcamStreamRef.current = null;
      }
      if (webcamRef.current) {
        webcamRef.current.srcObject = null;
      }
      return;
    }

    const getWebcamStream = async () => {
      try {
        const constraints: MediaStreamConstraints = {
          video: webcamDeviceId
            ? { deviceId: { exact: webcamDeviceId }, width: { ideal: 640 }, height: { ideal: 480 } }
            : { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        webcamStreamRef.current = stream;

        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Webcam preview error:', error);
      }
    };

    getWebcamStream();

    return () => {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(track => track.stop());
        webcamStreamRef.current = null;
      }
    };
  }, [webcamEnabled, webcamDeviceId]);

  // Calculate webcam position styles
  const getWebcamStyles = (): React.CSSProperties => {
    const size = `${webcamSize}%`;
    const padding = '20px';

    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      width: size,
      aspectRatio: '1',
      border: '3px solid #3b82f6',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
    };

    if (webcamShape === 'circle') {
      baseStyles.borderRadius = '50%';
    } else {
      baseStyles.borderRadius = '8px';
    }

    switch (webcamPosition) {
      case 'bottom-right':
        return { ...baseStyles, bottom: padding, right: padding };
      case 'bottom-left':
        return { ...baseStyles, bottom: padding, left: padding };
      case 'top-right':
        return { ...baseStyles, top: padding, right: padding };
      case 'top-left':
        return { ...baseStyles, top: padding, left: padding };
      default:
        return { ...baseStyles, bottom: padding, right: padding };
    }
  };

  if (!sourceId) {
    return (
      <div className="preview-container">
        <div className="text-dark-text-muted text-center">
          <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-lg">Select a source to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-container">
      {/* Main video preview */}
      <div className="relative inline-block max-w-full max-h-full">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="max-w-full max-h-full rounded-lg"
        />

        {/* Webcam overlay preview */}
        {webcamEnabled && videoLoaded && (
          <div style={getWebcamStyles()}>
            <video
              ref={webcamRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LivePreview;
