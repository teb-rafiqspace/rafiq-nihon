import { useState, useEffect, useCallback, useRef } from 'react';

type FaceStatus = 'ok' | 'no_face' | 'multiple_faces' | 'checking';

interface UseFaceProctorOptions {
  addViolation: (type: 'no_face' | 'multiple_faces', detail: string) => void;
  enabled: boolean;
}

interface UseFaceProctorReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  isCameraActive: boolean;
  faceStatus: FaceStatus;
  lastSnapshot: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

const CHECK_INTERVAL_MS = 15_000;
const VIDEO_WIDTH = 320;
const VIDEO_HEIGHT = 240;

// Skin tone detection thresholds (RGB-based heuristic)
// Based on common skin color models in normalized RGB space
function isSkinTonePixel(r: number, g: number, b: number): boolean {
  // Rule-based skin detection (works across a range of skin tones)
  return (
    r > 95 &&
    g > 40 &&
    b > 20 &&
    r > g &&
    r > b &&
    Math.abs(r - g) > 15 &&
    r - b > 15
  );
}

// Count skin-tone pixel regions as a rough face proxy
function detectFaceBasic(
  imageData: ImageData
): { faceDetected: boolean; regionCount: number } {
  const { data, width, height } = imageData;
  const totalPixels = width * height;
  let skinPixels = 0;

  // Sample every 4th pixel for performance
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (isSkinTonePixel(r, g, b)) {
      skinPixels++;
    }
  }

  const sampledTotal = totalPixels / 4;
  const skinRatio = skinPixels / sampledTotal;

  // If skin-tone pixels make up between 5% and 60% of the image,
  // we assume a face is present. Below 5% = no face. Above 60% = too close / hand.
  const faceDetected = skinRatio > 0.05 && skinRatio < 0.6;

  // Basic detection cannot count faces, so regionCount is 0 or 1
  return {
    faceDetected,
    regionCount: faceDetected ? 1 : 0,
  };
}

// Check if the FaceDetector API is available (Chrome/Edge with flags or built-in)
function isFaceDetectorAvailable(): boolean {
  return typeof (window as any).FaceDetector === 'function';
}

export function useFaceProctor(options: UseFaceProctorOptions): UseFaceProctorReturn {
  const { addViolation, enabled } = options;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRef = useRef(false);
  const addViolationRef = useRef(addViolation);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceStatus, setFaceStatus] = useState<FaceStatus>('checking');
  const [lastSnapshot, setLastSnapshot] = useState<string | null>(null);

  // Keep the addViolation ref fresh
  useEffect(() => {
    addViolationRef.current = addViolation;
  }, [addViolation]);

  // Lazily create an offscreen canvas for frame analysis
  const getCanvas = useCallback((): HTMLCanvasElement => {
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = VIDEO_WIDTH;
      canvas.height = VIDEO_HEIGHT;
      canvasRef.current = canvas;
    }
    return canvasRef.current;
  }, []);

  // Capture a snapshot from the video as a data URL
  const captureSnapshot = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;

    const canvas = getCanvas();
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
    return canvas.toDataURL('image/jpeg', 0.7);
  }, [getCanvas]);

  // Perform a single face check
  const performFaceCheck = useCallback(async () => {
    if (!activeRef.current) return;

    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      setFaceStatus('checking');
      return;
    }

    const canvas = getCanvas();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

    setFaceStatus('checking');

    // Try native FaceDetector API first (Chrome/Edge)
    if (isFaceDetectorAvailable()) {
      try {
        const detector = new (window as any).FaceDetector({
          fastMode: true,
          maxDetectedFaces: 5,
        });
        const faces = await detector.detect(canvas);

        if (faces.length === 0) {
          setFaceStatus('no_face');
          const snapshot = captureSnapshot();
          if (snapshot) setLastSnapshot(snapshot);
          addViolationRef.current(
            'no_face',
            'No face detected in camera feed.'
          );
        } else if (faces.length > 1) {
          setFaceStatus('multiple_faces');
          const snapshot = captureSnapshot();
          if (snapshot) setLastSnapshot(snapshot);
          addViolationRef.current(
            'multiple_faces',
            `${faces.length} faces detected in camera feed.`
          );
        } else {
          setFaceStatus('ok');
        }

        return;
      } catch (err) {
        // FaceDetector failed; fall through to basic detection
        console.warn('[FaceProctor] FaceDetector API failed, using fallback:', err);
      }
    }

    // Fallback: basic skin-tone detection
    const imageData = ctx.getImageData(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
    const result = detectFaceBasic(imageData);

    if (!result.faceDetected) {
      setFaceStatus('no_face');
      const snapshot = captureSnapshot();
      if (snapshot) setLastSnapshot(snapshot);
      addViolationRef.current(
        'no_face',
        'No face detected in camera feed (basic detection).'
      );
    } else {
      setFaceStatus('ok');
    }
  }, [getCanvas, captureSnapshot]);

  // Start the camera and begin periodic face checks
  const startCamera = useCallback(async () => {
    if (activeRef.current) return;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: VIDEO_WIDTH },
          height: { ideal: VIDEO_HEIGHT },
        },
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      activeRef.current = true;
      setIsCameraActive(true);
      setFaceStatus('checking');

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }

      // Start periodic face checks
      // Initial check after a short delay to let the camera warm up
      const initialTimeout = setTimeout(() => {
        performFaceCheck();
      }, 2000);

      intervalRef.current = setInterval(() => {
        performFaceCheck();
      }, CHECK_INTERVAL_MS);

      // Store the initial timeout for cleanup
      // We clear it via the interval cleanup mechanism
      const existingInterval = intervalRef.current;
      const originalClear = () => {
        clearTimeout(initialTimeout);
        if (existingInterval) clearInterval(existingInterval);
      };
      // Override interval ref to also clear the timeout
      intervalRef.current = {
        [Symbol.toPrimitive]: () => existingInterval,
        __clear: originalClear,
      } as any;

      console.info('[FaceProctor] Camera started.');
    } catch (err) {
      console.error('[FaceProctor] Failed to access camera:', err);
      setIsCameraActive(false);
      setFaceStatus('no_face');
    }
  }, [performFaceCheck]);

  // Stop the camera and all tracks
  const stopCamera = useCallback(() => {
    activeRef.current = false;

    // Stop interval
    if (intervalRef.current) {
      if (typeof (intervalRef.current as any).__clear === 'function') {
        (intervalRef.current as any).__clear();
      } else {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = null;
    }

    // Stop all media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Detach from video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setStream(null);
    setIsCameraActive(false);
    setFaceStatus('checking');

    console.info('[FaceProctor] Camera stopped.');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activeRef.current) {
        activeRef.current = false;

        if (intervalRef.current) {
          if (typeof (intervalRef.current as any).__clear === 'function') {
            (intervalRef.current as any).__clear();
          } else {
            clearInterval(intervalRef.current);
          }
          intervalRef.current = null;
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    };
  }, []);

  return {
    videoRef: videoRef as React.RefObject<HTMLVideoElement>,
    stream,
    isCameraActive,
    faceStatus,
    lastSnapshot,
    startCamera,
    stopCamera,
  };
}

export default useFaceProctor;
