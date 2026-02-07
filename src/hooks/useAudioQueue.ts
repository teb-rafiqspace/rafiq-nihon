import { useState, useCallback, useRef, useEffect } from 'react';
import { useOfflineAudio } from './useOfflineAudio';

export interface QueueItem {
  id: string;
  text: string;
  audioUrl?: string | null;
  reading?: string;
  meaning?: string;
  type?: 'vocabulary' | 'speaking' | 'kana' | 'kanji';
}

interface QueueState {
  items: QueueItem[];
  currentIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  repeatMode: 'none' | 'one' | 'all';
  autoAdvance: boolean;
  playbackSpeed: number;
  delayBetweenItems: number; // ms
}

/**
 * Hook for managing an audio playback queue with offline support
 */
export function useAudioQueue() {
  const { isCached, getPlayableUrl } = useOfflineAudio();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [state, setState] = useState<QueueState>({
    items: [],
    currentIndex: -1,
    isPlaying: false,
    isPaused: false,
    repeatMode: 'none',
    autoAdvance: true,
    playbackSpeed: 1,
    delayBetweenItems: 1000,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
    };
  }, []);

  // Play current item
  const playCurrentItem = useCallback(async () => {
    const currentItem = state.items[state.currentIndex];
    if (!currentItem) return;

    // Stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setState(prev => ({ ...prev, isPlaying: true, isPaused: false }));

    // Try to get cached audio first
    let audioUrl: string | null = null;
    
    if (await isCached(currentItem.id)) {
      audioUrl = await getPlayableUrl(currentItem.id);
    } else if (currentItem.audioUrl) {
      audioUrl = currentItem.audioUrl;
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.playbackRate = state.playbackSpeed;
      audioRef.current = audio;

      audio.onended = () => {
        // Revoke object URL if it was created from blob
        if (audioUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(audioUrl);
        }
        handleItemEnded();
      };

      audio.onerror = () => {
        console.error('Audio playback error');
        fallbackToSpeech(currentItem.text);
      };

      try {
        await audio.play();
      } catch (error) {
        console.error('Play error:', error);
        fallbackToSpeech(currentItem.text);
      }
    } else {
      // Use speech synthesis fallback
      fallbackToSpeech(currentItem.text);
    }
  }, [state.items, state.currentIndex, state.playbackSpeed, isCached, getPlayableUrl]);

  // Fallback to speech synthesis
  const fallbackToSpeech = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      handleItemEnded();
      return;
    }

    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = state.playbackSpeed * 0.9;
    
    const voices = speechSynthesis.getVoices();
    const japaneseVoice = voices.find(v => v.lang.startsWith('ja'));
    if (japaneseVoice) {
      utterance.voice = japaneseVoice;
    }

    utterance.onend = () => handleItemEnded();
    utterance.onerror = () => handleItemEnded();
    
    speechSynthesis.speak(utterance);
  }, [state.playbackSpeed]);

  // Handle when an item finishes playing
  const handleItemEnded = useCallback(() => {
    setState(prev => {
      const { items, currentIndex, repeatMode, autoAdvance } = prev;

      // Repeat one
      if (repeatMode === 'one') {
        // Will replay current item
        return prev;
      }

      if (!autoAdvance) {
        return { ...prev, isPlaying: false };
      }

      // Check if there's a next item
      const nextIndex = currentIndex + 1;
      
      if (nextIndex < items.length) {
        return { ...prev, currentIndex: nextIndex };
      } else if (repeatMode === 'all' && items.length > 0) {
        // Loop back to start
        return { ...prev, currentIndex: 0 };
      } else {
        // Queue finished
        return { ...prev, isPlaying: false, currentIndex: -1 };
      }
    });
  }, []);

  // Effect to play when currentIndex changes
  useEffect(() => {
    if (state.isPlaying && state.currentIndex >= 0 && !state.isPaused) {
      // Add delay between items
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
      
      delayTimeoutRef.current = setTimeout(() => {
        playCurrentItem();
      }, state.currentIndex === 0 ? 0 : state.delayBetweenItems);
    }
  }, [state.currentIndex, state.isPlaying, state.isPaused]);

  // Add items to queue
  const addToQueue = useCallback((items: QueueItem | QueueItem[]) => {
    const newItems = Array.isArray(items) ? items : [items];
    setState(prev => ({
      ...prev,
      items: [...prev.items, ...newItems],
    }));
  }, []);

  // Replace entire queue
  const setQueue = useCallback((items: QueueItem[]) => {
    setState(prev => ({
      ...prev,
      items,
      currentIndex: -1,
      isPlaying: false,
      isPaused: false,
    }));
  }, []);

  // Clear queue
  const clearQueue = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    setState(prev => ({
      ...prev,
      items: [],
      currentIndex: -1,
      isPlaying: false,
      isPaused: false,
    }));
  }, []);

  // Remove item from queue
  const removeFromQueue = useCallback((index: number) => {
    setState(prev => {
      const newItems = [...prev.items];
      newItems.splice(index, 1);
      
      let newCurrentIndex = prev.currentIndex;
      if (index < prev.currentIndex) {
        newCurrentIndex--;
      } else if (index === prev.currentIndex) {
        // Current item removed, stop playing
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        newCurrentIndex = -1;
      }
      
      return {
        ...prev,
        items: newItems,
        currentIndex: newCurrentIndex,
        isPlaying: index === prev.currentIndex ? false : prev.isPlaying,
      };
    });
  }, []);

  // Play queue from start or specific index
  const play = useCallback((fromIndex = 0) => {
    if (state.items.length === 0) return;
    
    setState(prev => ({
      ...prev,
      currentIndex: Math.min(fromIndex, prev.items.length - 1),
      isPlaying: true,
      isPaused: false,
    }));
  }, [state.items.length]);

  // Pause playback
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.pause();
    }
    
    setState(prev => ({ ...prev, isPaused: true }));
  }, []);

  // Resume playback
  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.resume();
    }
    
    setState(prev => ({ ...prev, isPaused: false }));
  }, []);

  // Stop playback
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    setState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      currentIndex: -1,
    }));
  }, []);

  // Skip to next
  const next = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    setState(prev => {
      const nextIndex = prev.currentIndex + 1;
      if (nextIndex >= prev.items.length) {
        if (prev.repeatMode === 'all') {
          return { ...prev, currentIndex: 0 };
        }
        return { ...prev, isPlaying: false, currentIndex: -1 };
      }
      return { ...prev, currentIndex: nextIndex };
    });
  }, []);

  // Skip to previous
  const previous = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    setState(prev => {
      const prevIndex = prev.currentIndex - 1;
      if (prevIndex < 0) {
        if (prev.repeatMode === 'all') {
          return { ...prev, currentIndex: prev.items.length - 1 };
        }
        return { ...prev, currentIndex: 0 };
      }
      return { ...prev, currentIndex: prevIndex };
    });
  }, []);

  // Toggle repeat mode
  const toggleRepeat = useCallback(() => {
    setState(prev => ({
      ...prev,
      repeatMode: prev.repeatMode === 'none' 
        ? 'all' 
        : prev.repeatMode === 'all' 
          ? 'one' 
          : 'none',
    }));
  }, []);

  // Set playback speed
  const setPlaybackSpeed = useCallback((speed: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    setState(prev => ({ ...prev, playbackSpeed: speed }));
  }, []);

  // Set delay between items
  const setDelay = useCallback((ms: number) => {
    setState(prev => ({ ...prev, delayBetweenItems: ms }));
  }, []);

  // Toggle auto-advance
  const toggleAutoAdvance = useCallback(() => {
    setState(prev => ({ ...prev, autoAdvance: !prev.autoAdvance }));
  }, []);

  // Get current item
  const currentItem = state.currentIndex >= 0 ? state.items[state.currentIndex] : null;

  return {
    // State
    queue: state.items,
    currentIndex: state.currentIndex,
    currentItem,
    isPlaying: state.isPlaying,
    isPaused: state.isPaused,
    repeatMode: state.repeatMode,
    autoAdvance: state.autoAdvance,
    playbackSpeed: state.playbackSpeed,
    delayBetweenItems: state.delayBetweenItems,
    
    // Queue management
    addToQueue,
    setQueue,
    clearQueue,
    removeFromQueue,
    
    // Playback controls
    play,
    pause,
    resume,
    stop,
    next,
    previous,
    
    // Settings
    toggleRepeat,
    setPlaybackSpeed,
    setDelay,
    toggleAutoAdvance,
  };
}
