import { useState, useEffect } from 'react';

export function useMediaDevices(kind: 'videoinput' | 'audioinput') {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const enumerateDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      // Request permissions first to get device labels
      const constraints = kind === 'videoinput' 
        ? { video: true } 
        : { audio: true };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Now enumerate (will have labels after permission granted)
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const filtered = allDevices.filter(d => d.kind === kind);
      setDevices(filtered);
      
      // Stop permission stream immediately
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Device enumeration error:', err);
      
      // Try to enumerate without permissions (will have empty labels)
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const filtered = allDevices.filter(d => d.kind === kind);
        setDevices(filtered);
      } catch (enumErr) {
        console.error('Failed to enumerate devices:', enumErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    enumerateDevices();
    
    // Listen for device changes (e.g., user plugs in/unplugs device)
    const handleDeviceChange = () => {
      enumerateDevices();
    };
    
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [kind]);

  return { devices, error, loading, refresh: enumerateDevices };
}
