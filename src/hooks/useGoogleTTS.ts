import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// IndexedDB configuration for TTS cache
const DB_NAME = 'rafiq-nihon-audio';
const DB_VERSION = 2;
const TTS_STORE_NAME = 'tts-cache';

interface TTSCacheEntry {
  id: string; // hash of text + voiceId + speed
  text: string;
  voiceId: string;
  speed: number;
  audioBase64: string;
  createdAt: number;
  size: number;
}

export type GoogleTTSVoice = 
  | 'ja-JP-Neural2-B' // Male
  | 'ja-JP-Neural2-C' // Female (recommended)
  | 'ja-JP-Neural2-D'; // Male

interface UseGoogleTTSOptions {
  defaultVoice?: GoogleTTSVoice;
  defaultSpeed?: number;
  enableCache?: boolean;
}

interface UseGoogleTTSReturn {
  speak: (text: string, options?: { slow?: boolean; voiceId?: GoogleTTSVoice }) => Promise<void>;
  stop: () => void;
  isLoading: boolean;
  isPlaying: boolean;
  error: string | null;
  availableVoices: GoogleTTSVoice[];
  currentVoice: GoogleTTSVoice;
  setVoice: (voice: GoogleTTSVoice) => void;
  clearCache: () => Promise<void>;
  getCacheSize: () => Promise<number>;
}

// Generate a unique cache key for TTS requests
function generateCacheKey(text: string, voiceId: string, speed: number): string {
  const data = `${text}|${voiceId}|${speed}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `tts_${Math.abs(hash).toString(36)}`;
}

// Initialize or get IndexedDB instance
async function openTTSDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create TTS cache store if it doesn't exist
      if (!db.objectStoreNames.contains(TTS_STORE_NAME)) {
        const store = db.createObjectStore(TTS_STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('text', 'text', { unique: false });
      }
    };
  });
}

// Get cached TTS audio
async function getCachedTTS(cacheKey: string): Promise<string | null> {
  try {
    const db = await openTTSDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction([TTS_STORE_NAME], 'readonly');
      const store = transaction.objectStore(TTS_STORE_NAME);
      const request = store.get(cacheKey);

      request.onsuccess = () => {
        const result = request.result as TTSCacheEntry | undefined;
        resolve(result?.audioBase64 || null);
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// Save TTS audio to cache
async function cacheTTS(entry: TTSCacheEntry): Promise<void> {
  try {
    const db = await openTTSDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TTS_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(TTS_STORE_NAME);
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to cache TTS:', error);
  }
}

// Clear all TTS cache
async function clearTTSCache(): Promise<void> {
  try {
    const db = await openTTSDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction([TTS_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(TTS_STORE_NAME);
      store.clear();
      resolve();
    });
  } catch {
    // Ignore errors
  }
}

// Get total cache size
async function getTTSCacheSize(): Promise<number> {
  try {
    const db = await openTTSDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction([TTS_STORE_NAME], 'readonly');
      const store = transaction.objectStore(TTS_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result as TTSCacheEntry[];
        const totalSize = items.reduce((acc, item) => acc + item.size, 0);
        resolve(totalSize);
      };
      request.onerror = () => resolve(0);
    });
  } catch {
    return 0;
  }
}

/**
 * Hook for Google Cloud Text-to-Speech integration
 * Provides high-quality Japanese Neural2 voices with caching
 */
export function useGoogleTTS(options: UseGoogleTTSOptions = {}): UseGoogleTTSReturn {
  const {
    defaultVoice = 'ja-JP-Neural2-C', // Female voice (best for learning)
    defaultSpeed = 1.0,
    enableCache = true,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVoice, setCurrentVoice] = useState<GoogleTTSVoice>(defaultVoice);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const availableVoices: GoogleTTSVoice[] = [
    'ja-JP-Neural2-B',
    'ja-JP-Neural2-C',
    'ja-JP-Neural2-D',
  ];

  const stop = useCallback(() => {
    // Cancel ongoing fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Stop audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setIsLoading(false);
    setIsPlaying(false);
  }, []);

  const speak = useCallback(async (
    text: string, 
    speakOptions?: { slow?: boolean; voiceId?: GoogleTTSVoice }
  ): Promise<void> => {
    if (!text.trim()) return;

    // Stop any ongoing playback
    stop();
    setError(null);

    const voiceId = speakOptions?.voiceId || currentVoice;
    const speed = speakOptions?.slow ? 0.7 : defaultSpeed;
    const cacheKey = generateCacheKey(text, voiceId, speed);

    try {
      // Check cache first
      if (enableCache) {
        const cachedAudio = await getCachedTTS(cacheKey);
        if (cachedAudio) {
          console.log('Playing from TTS cache:', text.substring(0, 20));
          await playBase64Audio(cachedAudio);
          return;
        }
      }

      // Fetch from API
      setIsLoading(true);
      console.log('Fetching TTS from Google Cloud:', text.substring(0, 20));

      abortControllerRef.current = new AbortController();

      const { data, error: invokeError } = await supabase.functions.invoke('google-tts', {
        body: { 
          text, 
          voiceId, 
          speed,
          action: 'synthesize'
        },
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'TTS request failed');
      }

      if (!data?.audioContent) {
        throw new Error('No audio content received');
      }

      // Cache the result
      if (enableCache) {
        const base64Size = (data.audioContent.length * 3) / 4;
        await cacheTTS({
          id: cacheKey,
          text,
          voiceId,
          speed,
          audioBase64: data.audioContent,
          createdAt: Date.now(),
          size: base64Size,
        });
      }

      // Play the audio
      await playBase64Audio(data.audioContent);

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Intentional abort, not an error
      }
      
      const errorMessage = err instanceof Error ? err.message : 'TTS playback failed';
      console.error('Google TTS error:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);
      throw err; // Re-throw to allow fallback handling
    }
  }, [currentVoice, defaultSpeed, enableCache, stop]);

  const playBase64Audio = useCallback(async (base64Audio: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setIsLoading(false);
      setIsPlaying(true);

      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
        resolve();
      };

      audio.onerror = (e) => {
        setIsPlaying(false);
        audioRef.current = null;
        reject(new Error('Audio playback failed'));
      };

      audio.play().catch((err) => {
        setIsPlaying(false);
        audioRef.current = null;
        reject(err);
      });
    });
  }, []);

  const setVoice = useCallback((voice: GoogleTTSVoice) => {
    setCurrentVoice(voice);
  }, []);

  const clearCache = useCallback(async () => {
    await clearTTSCache();
  }, []);

  const getCacheSize = useCallback(async (): Promise<number> => {
    return getTTSCacheSize();
  }, []);

  return {
    speak,
    stop,
    isLoading,
    isPlaying,
    error,
    availableVoices,
    currentVoice,
    setVoice,
    clearCache,
    getCacheSize,
  };
}
