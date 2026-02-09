import { useState, useEffect, useCallback, useRef } from 'react';
import { useGoogleTTS, GoogleTTSVoice } from './useGoogleTTS';

interface UseJapaneseAudioOptions {
  rate?: number;
  pitch?: number;
  preferFemaleVoice?: boolean;
  preferGoogleTTS?: boolean; // New: prefer Google Cloud TTS over Web Speech
  googleVoice?: GoogleTTSVoice;
}

interface UseJapaneseAudioReturn {
  speak: (text: string, slow?: boolean) => void;
  stop: () => void;
  playAudioUrl: (url: string, fallbackText?: string) => void;
  isSpeaking: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  hasJapaneseVoice: boolean;
  selectedVoice: SpeechSynthesisVoice | null;
  ttsSource: 'google' | 'web-speech' | 'audio-url' | null;
  googleVoice: GoogleTTSVoice;
  setGoogleVoice: (voice: GoogleTTSVoice) => void;
  availableGoogleVoices: GoogleTTSVoice[];
}

const FEMALE_VOICE_KEYWORDS = [
  'haruka',
  'nanami',
  'ayumi',
  'kyoko',
  'o-ren',
  'mizuki',
  'female',
  'woman',
  '女性',
];

/**
 * Enhanced hook for Japanese audio playback.
 * Prioritizes: 1) Audio URL 2) Google Cloud TTS 3) Web Speech API
 */
export function useJapaneseAudio(options: UseJapaneseAudioOptions = {}): UseJapaneseAudioReturn {
  const { 
    rate = 0.9, 
    pitch = 1.1, 
    preferFemaleVoice = true,
    preferGoogleTTS = true,
    googleVoice: initialGoogleVoice = 'ja-JP-Neural2-C',
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [hasJapaneseVoice, setHasJapaneseVoice] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [ttsSource, setTtsSource] = useState<'google' | 'web-speech' | 'audio-url' | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Google TTS hook
  const googleTTS = useGoogleTTS({
    defaultVoice: initialGoogleVoice,
    enableCache: true,
  });

  // Find the best Web Speech API voice on mount
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
        bestVoice = japaneseVoices.find(voice => {
          const nameLower = voice.name.toLowerCase();
          return FEMALE_VOICE_KEYWORDS.some(keyword => nameLower.includes(keyword));
        });
      }
      
      if (!bestVoice) {
        bestVoice = japaneseVoices.find(v => v.name.includes('Google')) || japaneseVoices[0];
      }
      
      setSelectedVoice(bestVoice || null);
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
  }, [preferFemaleVoice]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
      googleTTS.stop();
    };
  }, []);

  const stop = useCallback(() => {
    // Stop audio element
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    
    // Stop Web Speech API
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    // Stop Google TTS
    googleTTS.stop();
    
    setIsSpeaking(false);
    setIsAudioPlaying(false);
    setTtsSource(null);
  }, [googleTTS]);

  // Web Speech API fallback
  const speakWithWebSpeech = useCallback((text: string, slow = false) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = slow ? rate * 0.65 : rate;
    utterance.pitch = pitch;
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setTtsSource('web-speech');
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setTtsSource(null);
    };
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
      setTtsSource(null);
    };
    
    speechSynthesis.speak(utterance);
  }, [rate, pitch, selectedVoice]);

  const speak = useCallback((text: string, slow = false) => {
    // Cancel any ongoing playback
    stop();
    
    if (preferGoogleTTS) {
      // Try Google TTS first
      setTtsSource('google');
      googleTTS.speak(text, { slow }).catch((error) => {
        console.warn('Google TTS failed, falling back to Web Speech:', error.message);
        // Fallback to Web Speech API
        speakWithWebSpeech(text, slow);
      });
    } else {
      // Use Web Speech API directly
      speakWithWebSpeech(text, slow);
    }
  }, [preferGoogleTTS, googleTTS, speakWithWebSpeech, stop]);

  const playAudioUrl = useCallback((url: string, fallbackText?: string) => {
    stop();
    
    setIsAudioPlaying(true);
    setTtsSource('audio-url');
    
    const audio = new Audio(url);
    audioRef.current = audio;
    
    audio.onended = () => {
      setIsAudioPlaying(false);
      setTtsSource(null);
      audioRef.current = null;
    };
    
    audio.onerror = () => {
      setIsAudioPlaying(false);
      setTtsSource(null);
      audioRef.current = null;
      
      // Fallback chain: Audio URL -> Google TTS -> Web Speech
      if (fallbackText) {
        speak(fallbackText);
      }
    };
    
    audio.play().catch((error) => {
      console.error('Audio playback error:', error);
      setIsAudioPlaying(false);
      setTtsSource(null);
      audioRef.current = null;
      
      if (fallbackText) {
        speak(fallbackText);
      }
    });
  }, [speak, stop]);

  // Combined isPlaying state
  const isPlaying = isSpeaking || isAudioPlaying || googleTTS.isPlaying;
  const isLoading = googleTTS.isLoading;

  return {
    speak,
    stop,
    playAudioUrl,
    isSpeaking,
    isPlaying,
    isLoading,
    hasJapaneseVoice: hasJapaneseVoice || preferGoogleTTS, // Google TTS always available
    selectedVoice,
    ttsSource,
    googleVoice: googleTTS.currentVoice,
    setGoogleVoice: googleTTS.setVoice,
    availableGoogleVoices: googleTTS.availableVoices,
  };
}

/**
 * Simple utility to speak Japanese text without hook lifecycle
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
