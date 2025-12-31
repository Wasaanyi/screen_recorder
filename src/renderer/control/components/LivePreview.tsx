import React, { useRef, useEffect } from 'react';

interface LivePreviewProps {
  sourceId: string | null;
  isRecording: boolean;
}

const LivePreview: React.FC<LivePreviewProps> = ({ sourceId, isRecording }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!sourceId) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
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
      <video
        ref={videoRef}
        autoPlay
        muted
        className="max-w-full max-h-full"
      />
      {isRecording && (
        <div className="absolute top-4 left-4 bg-danger px-3 py-1 rounded-full flex items-center space-x-2">
          <div className="recording-indicator" />
          <span className="text-white text-sm font-medium">Recording</span>
        </div>
      )}
    </div>
  );
};

export default LivePreview;
