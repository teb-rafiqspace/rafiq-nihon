import { useState, useEffect, useCallback } from 'react';

export interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
}

const STORAGE_KEY = 'rafiq-accessibility-settings';

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  fontSize: 'medium',
  reducedMotion: false,
  screenReaderOptimized: false,
};

const FONT_SIZE_SCALE: Record<AccessibilitySettings['fontSize'], string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
  xlarge: '20px',
};

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return { ...defaultSettings, ...JSON.parse(saved) };
        } catch {
          return defaultSettings;
        }
      }
      // Check system preference for reduced motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        return { ...defaultSettings, reducedMotion: true };
      }
    }
    return defaultSettings;
  });

  // Apply settings to DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // High Contrast Mode
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Font Size
    root.style.fontSize = FONT_SIZE_SCALE[settings.fontSize];
    
    // Reduced Motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // Screen Reader Optimization
    if (settings.screenReaderOptimized) {
      root.classList.add('sr-optimized');
      root.setAttribute('aria-live', 'polite');
    } else {
      root.classList.remove('sr-optimized');
      root.removeAttribute('aria-live');
    }
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Listen to system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches && !settings.reducedMotion) {
        setSettings(prev => ({ ...prev, reducedMotion: true }));
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.reducedMotion]);

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  }, []);

  const toggleScreenReaderOptimized = useCallback(() => {
    setSettings(prev => ({ ...prev, screenReaderOptimized: !prev.screenReaderOptimized }));
  }, []);

  const setFontSize = useCallback((size: AccessibilitySettings['fontSize']) => {
    setSettings(prev => ({ ...prev, fontSize: size }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  return {
    settings,
    updateSetting,
    toggleHighContrast,
    toggleReducedMotion,
    toggleScreenReaderOptimized,
    setFontSize,
    resetSettings,
  };
}
