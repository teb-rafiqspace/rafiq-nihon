import { useState, useEffect, useCallback, useRef } from 'react';

interface UseEnglishAudioReturn {
  speak: (text: string, slow?: boolean) => void;
  stop: () => void;
  isPlaying: boolean;
  hasEnglishVoice: boolean;
}

export function useEnglishAudio(): UseEnglishAudioReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEnglishVoice, setHasEnglishVoice] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const findBestVoice = () => {
      if (!('speechSynthesis' in window)) {
        setHasEnglishVoice(false);
        return;
      }

      const voices = speechSynthesis.getVoices();
      const englishVoices = voices.filter(v => v.lang.startsWith('en'));

      if (englishVoices.length === 0) {
        setHasEnglishVoice(false);
        return;
      }

      setHasEnglishVoice(true);

      // Prefer natural-sounding voices
      let bestVoice =
        englishVoices.find(v => v.name.includes('Google') && v.lang === 'en-US') ||
        englishVoices.find(v => v.name.includes('Google')) ||
        englishVoices.find(v => v.lang === 'en-US') ||
        englishVoices.find(v => v.lang === 'en-GB') ||
        englishVoices[0];

      setSelectedVoice(bestVoice);
    };

    findBestVoice();

    if ('speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = findBestVoice;
    }

    return () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  const speak = useCallback((text: string, slow = false) => {
    if (!('speechSynthesis' in window)) return;

    stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = slow ? 0.6 : 0.9;
    utterance.pitch = 1.0;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [selectedVoice, stop]);

  return {
    speak,
    stop,
    isPlaying,
    hasEnglishVoice,
  };
}
