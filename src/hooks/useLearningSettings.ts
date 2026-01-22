import { useState, useEffect, useCallback } from 'react';

interface LearningSettings {
  showFurigana: boolean;
  showRomaji: boolean;
  autoPlayAudio: boolean;
  exampleContext: 'daily' | 'work';
}

const STORAGE_KEY = 'jlpt-learning-settings';

const defaultSettings: LearningSettings = {
  showFurigana: true,
  showRomaji: true,
  autoPlayAudio: false,
  exampleContext: 'daily',
};

export function useLearningSettings() {
  const [settings, setSettings] = useState<LearningSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return { ...defaultSettings, ...JSON.parse(saved) };
        } catch {
          return defaultSettings;
        }
      }
    }
    return defaultSettings;
  });
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);
  
  const updateSetting = useCallback(<K extends keyof LearningSettings>(
    key: K,
    value: LearningSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const toggleFurigana = useCallback(() => {
    setSettings(prev => ({ ...prev, showFurigana: !prev.showFurigana }));
  }, []);
  
  const toggleRomaji = useCallback(() => {
    setSettings(prev => ({ ...prev, showRomaji: !prev.showRomaji }));
  }, []);
  
  const toggleAutoPlay = useCallback(() => {
    setSettings(prev => ({ ...prev, autoPlayAudio: !prev.autoPlayAudio }));
  }, []);
  
  const setExampleContext = useCallback((context: 'daily' | 'work') => {
    setSettings(prev => ({ ...prev, exampleContext: context }));
  }, []);
  
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);
  
  return {
    settings,
    updateSetting,
    toggleFurigana,
    toggleRomaji,
    toggleAutoPlay,
    setExampleContext,
    resetSettings,
  };
}
