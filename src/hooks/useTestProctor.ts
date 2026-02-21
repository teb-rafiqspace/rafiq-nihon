import { useState, useEffect, useCallback, useRef } from 'react';

export interface Violation {
  type:
    | 'tab_switch'
    | 'window_blur'
    | 'fullscreen_exit'
    | 'copy_paste'
    | 'devtools'
    | 'no_face'
    | 'multiple_faces'
    | 'speech_detected';
  timestamp: string;
  detail: string;
}

interface UseTestProctorOptions {
  onAutoSubmit: () => void;
  enabled: boolean;
}

interface UseTestProctorReturn {
  violations: Violation[];
  warningCount: number;
  isFullscreen: boolean;
  latestViolation: Violation | null;
  startProctoring: () => void;
  stopProctoring: () => void;
  addViolation: (type: Violation['type'], detail: string) => void;
  dismissWarning: () => void;
}

const MAX_WARNINGS = 3;
const DEVTOOLS_THRESHOLD = 200;

export function useTestProctor(options: UseTestProctorOptions): UseTestProctorReturn {
  const { onAutoSubmit, enabled } = options;

  const [violations, setViolations] = useState<Violation[]>([]);
  const [warningCount, setWarningCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [latestViolation, setLatestViolation] = useState<Violation | null>(null);

  // Refs to avoid stale closures in event listeners
  const activeRef = useRef(false);
  const warningCountRef = useRef(0);
  const onAutoSubmitRef = useRef(onAutoSubmit);
  const devtoolsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep the callback ref fresh
  useEffect(() => {
    onAutoSubmitRef.current = onAutoSubmit;
  }, [onAutoSubmit]);

  // Sync warningCount state to ref
  useEffect(() => {
    warningCountRef.current = warningCount;
  }, [warningCount]);

  const addViolation = useCallback(
    (type: Violation['type'], detail: string) => {
      if (!activeRef.current) return;

      const violation: Violation = {
        type,
        timestamp: new Date().toISOString(),
        detail,
      };

      setViolations((prev) => [...prev, violation]);
      setLatestViolation(violation);

      const newCount = warningCountRef.current + 1;
      setWarningCount(newCount);
      warningCountRef.current = newCount;

      console.warn(`[Proctor] Violation #${newCount}: ${type} - ${detail}`);

      if (newCount >= MAX_WARNINGS) {
        console.warn('[Proctor] Max warnings reached. Auto-submitting test.');
        onAutoSubmitRef.current();
      }
    },
    []
  );

  const dismissWarning = useCallback(() => {
    setLatestViolation(null);
  }, []);

  // --- Event Handlers ---

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      addViolation('tab_switch', 'User switched to another tab or minimized the window.');
    }
  }, [addViolation]);

  const handleWindowBlur = useCallback(() => {
    // Avoid double-counting with visibilitychange: only fire if document is not hidden
    // (blur can fire when clicking browser chrome, address bar, etc.)
    if (!document.hidden) {
      addViolation('window_blur', 'Browser window lost focus.');
    }
  }, [addViolation]);

  const handleFullscreenChange = useCallback(() => {
    const isFs = !!document.fullscreenElement;
    setIsFullscreen(isFs);

    if (!isFs && activeRef.current) {
      addViolation('fullscreen_exit', 'User exited fullscreen mode.');
    }
  }, [addViolation]);

  const handleCopyPaste = useCallback(
    (e: Event) => {
      e.preventDefault();
      const eventType = e.type; // 'copy', 'cut', or 'paste'
      addViolation('copy_paste', `User attempted to ${eventType} content.`);
    },
    [addViolation]
  );

  const handleContextMenu = useCallback(
    (e: Event) => {
      e.preventDefault();
    },
    []
  );

  const startDevtoolsDetection = useCallback(() => {
    // Check window dimensions periodically to detect devtools
    devtoolsIntervalRef.current = setInterval(() => {
      if (!activeRef.current) return;

      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;

      if (widthDiff > DEVTOOLS_THRESHOLD || heightDiff > DEVTOOLS_THRESHOLD) {
        addViolation(
          'devtools',
          `Developer tools detected. Width diff: ${widthDiff}px, Height diff: ${heightDiff}px.`
        );
      }
    }, 2000);
  }, [addViolation]);

  const stopDevtoolsDetection = useCallback(() => {
    if (devtoolsIntervalRef.current) {
      clearInterval(devtoolsIntervalRef.current);
      devtoolsIntervalRef.current = null;
    }
  }, []);

  // --- Start / Stop Proctoring ---

  const startProctoring = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;

    // Request fullscreen
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.warn('[Proctor] Fullscreen request denied:', err);
      });
    }

    // Attach event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('contextmenu', handleContextMenu);

    // Start devtools detection
    startDevtoolsDetection();

    console.info('[Proctor] Proctoring started.');
  }, [
    handleVisibilityChange,
    handleWindowBlur,
    handleFullscreenChange,
    handleCopyPaste,
    handleContextMenu,
    startDevtoolsDetection,
  ]);

  const stopProctoring = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;

    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.warn('[Proctor] Failed to exit fullscreen:', err);
      });
    }

    // Remove event listeners
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleWindowBlur);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('copy', handleCopyPaste);
    document.removeEventListener('cut', handleCopyPaste);
    document.removeEventListener('paste', handleCopyPaste);
    document.removeEventListener('contextmenu', handleContextMenu);

    // Stop devtools detection
    stopDevtoolsDetection();

    console.info('[Proctor] Proctoring stopped.');
  }, [
    handleVisibilityChange,
    handleWindowBlur,
    handleFullscreenChange,
    handleCopyPaste,
    handleContextMenu,
    stopDevtoolsDetection,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activeRef.current) {
        activeRef.current = false;

        // Exit fullscreen
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }

        // Remove all listeners
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleWindowBlur);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('copy', handleCopyPaste);
        document.removeEventListener('cut', handleCopyPaste);
        document.removeEventListener('paste', handleCopyPaste);
        document.removeEventListener('contextmenu', handleContextMenu);

        stopDevtoolsDetection();
      }
    };
  }, [
    handleVisibilityChange,
    handleWindowBlur,
    handleFullscreenChange,
    handleCopyPaste,
    handleContextMenu,
    stopDevtoolsDetection,
  ]);

  return {
    violations,
    warningCount,
    isFullscreen,
    latestViolation,
    startProctoring,
    stopProctoring,
    addViolation,
    dismissWarning,
  };
}

export default useTestProctor;
