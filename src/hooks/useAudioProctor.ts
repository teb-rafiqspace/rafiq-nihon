import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAudioProctorOptions {
  addViolation: (type: 'speech_detected', detail: string) => void;
  enabled: boolean;
}

interface UseAudioProctorReturn {
  isMicActive: boolean;
  audioLevel: number;
  startAudioMonitor: () => Promise<void>;
  stopAudioMonitor: () => void;
}

// How often to sample the frequency data (ms)
const SAMPLE_INTERVAL_MS = 500;

// Frequency bin range for speech detection (~85-255 Hz)
// With a 48kHz sample rate and 2048-point FFT, each bin = ~23.4 Hz
// Bin 4 ~ 93 Hz, Bin 11 ~ 257 Hz (approximate speech fundamental range)
const SPEECH_BIN_START = 3;
const SPEECH_BIN_END = 11;

// Volume threshold (0-255 byte frequency data scale)
// Values above this in the speech band indicate significant audio
const VOLUME_THRESHOLD = 60;

// How long sustained volume must persist before flagging as speech (ms)
const SUSTAINED_DURATION_MS = 2000;

export function useAudioProctor(options: UseAudioProctorOptions): UseAudioProctorReturn {
  const { addViolation, enabled } = options;

  const [isMicActive, setIsMicActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const activeRef = useRef(false);
  const addViolationRef = useRef(addViolation);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track how long volume has been above threshold continuously
  const sustainedStartRef = useRef<number | null>(null);
  // Track whether we already fired a violation for the current sustained period
  const violationFiredRef = useRef(false);

  // Keep the addViolation ref fresh
  useEffect(() => {
    addViolationRef.current = addViolation;
  }, [addViolation]);

  // Analyze frequency data and detect speech
  const analyzeAudio = useCallback(() => {
    if (!activeRef.current || !analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyser.getByteFrequencyData(dataArray);

    // Calculate average level in the speech frequency range
    let speechSum = 0;
    let speechBinCount = 0;

    const endBin = Math.min(SPEECH_BIN_END, bufferLength - 1);
    for (let i = SPEECH_BIN_START; i <= endBin; i++) {
      speechSum += dataArray[i];
      speechBinCount++;
    }

    const avgSpeechLevel = speechBinCount > 0 ? speechSum / speechBinCount : 0;

    // Also compute overall average for the audioLevel indicator
    let overallSum = 0;
    for (let i = 0; i < bufferLength; i++) {
      overallSum += dataArray[i];
    }
    const overallAvg = bufferLength > 0 ? overallSum / bufferLength : 0;

    // Normalize to 0-1 range
    const normalizedLevel = Math.min(overallAvg / 255, 1);
    setAudioLevel(normalizedLevel);

    // Speech detection logic with sustained threshold
    const now = Date.now();

    if (avgSpeechLevel > VOLUME_THRESHOLD) {
      // Volume is above threshold
      if (sustainedStartRef.current === null) {
        // Start tracking sustained period
        sustainedStartRef.current = now;
        violationFiredRef.current = false;
      } else if (
        now - sustainedStartRef.current >= SUSTAINED_DURATION_MS &&
        !violationFiredRef.current
      ) {
        // Sustained for long enough -- fire violation
        violationFiredRef.current = true;
        addViolationRef.current(
          'speech_detected',
          `Speech detected for ${SUSTAINED_DURATION_MS / 1000}+ seconds. Average speech band level: ${avgSpeechLevel.toFixed(1)}/255.`
        );

        // Reset so we can detect again if it continues
        sustainedStartRef.current = now;
        violationFiredRef.current = false;
      }
    } else {
      // Volume dropped below threshold -- reset sustained tracker
      sustainedStartRef.current = null;
      violationFiredRef.current = false;
    }
  }, []);

  // Start microphone monitoring
  const startAudioMonitor = useCallback(async () => {
    if (activeRef.current) return;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = mediaStream;

      // Create AudioContext and AnalyserNode
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.3;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(mediaStream);
      source.connect(analyser);
      sourceRef.current = source;

      // Do NOT connect analyser to audioContext.destination
      // (we don't want to play the microphone audio back through speakers)

      activeRef.current = true;
      setIsMicActive(true);
      sustainedStartRef.current = null;
      violationFiredRef.current = false;

      // Start periodic sampling
      intervalRef.current = setInterval(analyzeAudio, SAMPLE_INTERVAL_MS);

      console.info('[AudioProctor] Microphone monitoring started.');
    } catch (err) {
      console.error('[AudioProctor] Failed to access microphone:', err);
      setIsMicActive(false);
    }
  }, [analyzeAudio]);

  // Stop microphone monitoring
  const stopAudioMonitor = useCallback(() => {
    activeRef.current = false;

    // Clear sampling interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Disconnect audio nodes
    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch (_) {}
      sourceRef.current = null;
    }

    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch (_) {}
      analyserRef.current = null;
    }

    // Close AudioContext
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    // Stop all media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsMicActive(false);
    setAudioLevel(0);
    sustainedStartRef.current = null;
    violationFiredRef.current = false;

    console.info('[AudioProctor] Microphone monitoring stopped.');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activeRef.current) {
        activeRef.current = false;

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        if (sourceRef.current) {
          try {
            sourceRef.current.disconnect();
          } catch (_) {}
          sourceRef.current = null;
        }

        if (analyserRef.current) {
          try {
            analyserRef.current.disconnect();
          } catch (_) {}
          analyserRef.current = null;
        }

        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      }
    };
  }, []);

  return {
    isMicActive,
    audioLevel,
    startAudioMonitor,
    stopAudioMonitor,
  };
}

export default useAudioProctor;
