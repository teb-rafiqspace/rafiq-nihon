import { useState, useEffect, useCallback, useRef } from 'react';

interface UseJapaneseAudioOptions {
  rate?: number;
  pitch?: number;
  preferFemaleVoice?: boolean;
}

interface UseJapaneseAudioReturn {
  speak: (text: string, slow?: boolean) => void;
  stop: () => void;
  playAudioUrl: (url: string, fallbackText?: string) => void;
  isSpeaking: boolean;
  isPlaying: boolean;
  hasJapaneseVoice: boolean;
  selectedVoice: SpeechSynthesisVoice | null;
}

const FEMALE_VOICE_KEYWORDS = [
  'haruka',    // Windows - female, natural
  'nanami',    // Azure - female, cheerful
  'ayumi',     // Windows - female
  'kyoko',     // macOS/iOS - female
  'o-ren',     // Some systems
  'mizuki',    // AWS Polly style
  'female',
  'woman',
  '女性',       // Japanese for "female"
];

/**
 * A reusable hook for Japanese audio playback using Web Speech API.
 * Prioritizes female Japanese voices for a lively learning companion experience.
 */
export function useJapaneseAudio(options: UseJapaneseAudioOptions = {}): UseJapaneseAudioReturn {
  const { 
    rate = 0.9, 
    pitch = 1.1, 
    preferFemaleVoice = true 
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasJapaneseVoice, setHasJapaneseVoice] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Find the best Japanese voice on mount
  useEffect(() => {
    const findBestVoice = () => {
      if (!('speechSynthesis' in window)) {
        setHasJapaneseVoice(false);
        return;
      }

      const voices = speechSynthesis.getVoices();
      const japaneseVoices = voices.filter(voice => voice.lang.startsWith('ja'));
      
      if (japaneseVoices.length === 0) {
        setHasJapaneseVoice(false);
        return;
      }
      
      setHasJapaneseVoice(true);
      
      let bestVoice: SpeechSynthesisVoice | undefined;
      
      if (preferFemaleVoice) {
        // Try to find a female voice
        bestVoice = japaneseVoices.find(voice => {
          const nameLower = voice.name.toLowerCase();
          return FEMALE_VOICE_KEYWORDS.some(keyword => nameLower.includes(keyword));
        });
      }
      
      // If no specific female voice found, prefer Google Japanese or first available
      if (!bestVoice) {
        bestVoice = japaneseVoices.find(v => v.name.includes('Google')) || japaneseVoices[0];
      }
      
      setSelectedVoice(bestVoice || null);
      console.log('Selected Japanese voice:', bestVoice?.name);
    };
    
    findBestVoice();
    
    // Chrome loads voices asynchronously
    if ('speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = findBestVoice;
    }
    
    return () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [preferFemaleVoice]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    // Stop audio element if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    
    // Stop speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    setIsSpeaking(false);
    setIsPlaying(false);
  }, []);

  const speak = useCallback((text: string, slow = false) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    stop();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = slow ? rate * 0.65 : rate; // Slower rate for slow mode
    utterance.pitch = pitch;
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
    };
    
    speechSynthesis.speak(utterance);
  }, [rate, pitch, selectedVoice, stop]);

  const playAudioUrl = useCallback((url: string, fallbackText?: string) => {
    // Stop any current playback
    stop();
    
    setIsPlaying(true);
    
    const audio = new Audio(url);
    audioRef.current = audio;
    
    audio.onended = () => {
      setIsPlaying(false);
      audioRef.current = null;
    };
    
    audio.onerror = () => {
      setIsPlaying(false);
      audioRef.current = null;
      
      // Fallback to speech synthesis if audio URL fails
      if (fallbackText) {
        speak(fallbackText);
      }
    };
    
    audio.play().catch((error) => {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
      audioRef.current = null;
      
      // Fallback to speech synthesis
      if (fallbackText) {
        speak(fallbackText);
      }
    });
  }, [speak, stop]);

  return {
    speak,
    stop,
    playAudioUrl,
    isSpeaking,
    isPlaying: isSpeaking || isPlaying,
    hasJapaneseVoice,
    selectedVoice,
  };
}

/**
 * Simple utility to speak Japanese text without hook lifecycle
 * Useful for one-off pronunciations outside of components
 */
export function speakJapanese(text: string, options: { slow?: boolean; rate?: number; pitch?: number } = {}) {
  const { slow = false, rate = 0.9, pitch = 1.1 } = options;
  
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return;
  }

  speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = slow ? rate * 0.65 : rate;
  utterance.pitch = pitch;
  
  const voices = speechSynthesis.getVoices();
  const japaneseVoice = voices.find(
    (v) => v.lang.startsWith('ja') && v.name.toLowerCase().includes('female')
  ) || voices.find((v) => v.lang.startsWith('ja'));
  
  if (japaneseVoice) {
    utterance.voice = japaneseVoice;
  }
  
  speechSynthesis.speak(utterance);
}
