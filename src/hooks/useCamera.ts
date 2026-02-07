import { useState, useCallback, useRef } from 'react';

interface UseCameraOptions {
  facingMode?: 'user' | 'environment';
}

export function useCamera(options: UseCameraOptions = {}) {
  const { facingMode = 'environment' } = options;
  
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isSupported = !!(
    navigator.mediaDevices && 
    navigator.mediaDevices.getUserMedia
  );

  const start = useCallback(async (videoElement: HTMLVideoElement) => {
    if (!isSupported) {
      setError('Camera tidak didukung di browser ini');
      return false;
    }

    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      videoRef.current = videoElement;
      videoElement.srcObject = stream;
      await videoElement.play();
      
      setIsActive(true);
      setHasPermission(true);
      return true;
    } catch (err: any) {
      const message = err.name === 'NotAllowedError' 
        ? 'Izin kamera ditolak. Aktifkan di pengaturan browser.'
        : err.name === 'NotFoundError'
        ? 'Kamera tidak ditemukan'
        : 'Gagal mengakses kamera';
      
      setError(message);
      setHasPermission(err.name === 'NotAllowedError' ? false : null);
      return false;
    }
  }, [facingMode, isSupported]);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current = null;
    }
    
    setIsActive(false);
  }, []);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !isActive) return null;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, [isActive]);

  const captureBlob = useCallback(async (): Promise<Blob | null> => {
    if (!videoRef.current || !isActive) return null;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
    });
  }, [isActive]);

  return {
    isSupported,
    isActive,
    hasPermission,
    error,
    start,
    stop,
    captureFrame,
    captureBlob
  };
}
