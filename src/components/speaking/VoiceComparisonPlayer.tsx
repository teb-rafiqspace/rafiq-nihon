import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface VoiceComparisonPlayerProps {
  nativeAudioUrl?: string | null;
  nativeText: string;
  userAudioUrl?: string | null;
  onPlayNative?: () => void;
  isNativePlaying?: boolean;
  className?: string;
}

type PlaybackMode = 'native' | 'user' | 'compare';

export function VoiceComparisonPlayer({
  nativeAudioUrl,
  nativeText,
  userAudioUrl,
  onPlayNative,
  isNativePlaying = false,
  className
}: VoiceComparisonPlayerProps) {
  const [mode, setMode] = useState<PlaybackMode>('native');
  const [isPlaying, setIsPlaying] = useState(false);
  const [nativeProgress, setNativeProgress] = useState(0);
  const [userProgress, setUserProgress] = useState(0);
  const [comparisonStep, setComparisonStep] = useState<'native' | 'user' | 'done'>('native');
  
  const nativeAudioRef = useRef<HTMLAudioElement | null>(null);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Initialize audio elements
  useEffect(() => {
    if (nativeAudioUrl) {
      nativeAudioRef.current = new Audio(nativeAudioUrl);
      nativeAudioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setNativeProgress(0);
        if (mode === 'compare' && comparisonStep === 'native') {
          // Auto-play user recording after native
          setTimeout(() => {
            setComparisonStep('user');
            playUserAudio();
          }, 500);
        }
      });
    }
    
    if (userAudioUrl) {
      userAudioRef.current = new Audio(userAudioUrl);
      userAudioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setUserProgress(0);
        if (mode === 'compare') {
          setComparisonStep('done');
        }
      });
    }
    
    return () => {
      if (nativeAudioRef.current) {
        nativeAudioRef.current.pause();
        nativeAudioRef.current = null;
      }
      if (userAudioRef.current) {
        userAudioRef.current.pause();
        userAudioRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nativeAudioUrl, userAudioUrl]);

  const updateProgress = () => {
    if (nativeAudioRef.current && !nativeAudioRef.current.paused) {
      const progress = (nativeAudioRef.current.currentTime / nativeAudioRef.current.duration) * 100;
      setNativeProgress(progress);
    }
    if (userAudioRef.current && !userAudioRef.current.paused) {
      const progress = (userAudioRef.current.currentTime / userAudioRef.current.duration) * 100;
      setUserProgress(progress);
    }
    animationRef.current = requestAnimationFrame(updateProgress);
  };

  const playNativeAudio = () => {
    if (nativeAudioRef.current) {
      nativeAudioRef.current.play();
      setIsPlaying(true);
      animationRef.current = requestAnimationFrame(updateProgress);
    } else if (onPlayNative) {
      onPlayNative();
    }
  };

  const playUserAudio = () => {
    if (userAudioRef.current) {
      userAudioRef.current.play();
      setIsPlaying(true);
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const stopAllAudio = () => {
    if (nativeAudioRef.current) {
      nativeAudioRef.current.pause();
      nativeAudioRef.current.currentTime = 0;
    }
    if (userAudioRef.current) {
      userAudioRef.current.pause();
      userAudioRef.current.currentTime = 0;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsPlaying(false);
    setNativeProgress(0);
    setUserProgress(0);
  };

  const handlePlay = () => {
    if (isPlaying) {
      stopAllAudio();
      return;
    }

    if (mode === 'native') {
      playNativeAudio();
    } else if (mode === 'user' && userAudioUrl) {
      playUserAudio();
    } else if (mode === 'compare') {
      setComparisonStep('native');
      playNativeAudio();
    }
  };

  const handleModeChange = (newMode: PlaybackMode) => {
    stopAllAudio();
    setMode(newMode);
    setComparisonStep('native');
  };

  return (
    <div className={cn("bg-card rounded-xl p-4 shadow-card", className)}>
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
        🔊 VOICE COMPARISON
      </h3>
      
      {/* Mode Selector */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={mode === 'native' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleModeChange('native')}
          className="flex-1"
        >
          <Volume2 className="w-4 h-4 mr-1" />
          Native
        </Button>
        <Button
          variant={mode === 'user' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleModeChange('user')}
          disabled={!userAudioUrl}
          className="flex-1"
        >
          <User className="w-4 h-4 mr-1" />
          You
        </Button>
        <Button
          variant={mode === 'compare' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleModeChange('compare')}
          disabled={!userAudioUrl}
          className="flex-1"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Compare
        </Button>
      </div>

      {/* Waveform Visualization */}
      <div className="relative bg-muted/50 rounded-lg p-4 mb-4">
        <AnimatePresence mode="wait">
          {(mode === 'native' || mode === 'compare') && (
            <motion.div
              key="native-wave"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <Volume2 className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  Native Speaker
                </span>
                {mode === 'compare' && comparisonStep === 'native' && isPlaying && (
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                    Playing...
                  </span>
                )}
              </div>
              <div className="relative h-8 bg-gradient-to-r from-indigo-200 to-purple-200 dark:from-indigo-900 dark:to-purple-900 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${nativeProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
                {/* Simulated waveform bars */}
                <div className="absolute inset-0 flex items-center justify-around px-2">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 rounded-full bg-white/30"
                      animate={{
                        height: isPlaying && nativeProgress > (i * 5)
                          ? `${20 + Math.sin(i * 0.5 + Date.now() / 100) * 10}px`
                          : '4px'
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {(mode === 'user' || mode === 'compare') && userAudioUrl && (
            <motion.div
              key="user-wave"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Your Recording
                </span>
                {mode === 'compare' && comparisonStep === 'user' && isPlaying && (
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    Playing...
                  </span>
                )}
              </div>
              <div className="relative h-8 bg-gradient-to-r from-emerald-200 to-teal-200 dark:from-emerald-900 dark:to-teal-900 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${userProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
                {/* Simulated waveform bars */}
                <div className="absolute inset-0 flex items-center justify-around px-2">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 rounded-full bg-white/30"
                      animate={{
                        height: isPlaying && userProgress > (i * 5)
                          ? `${20 + Math.sin(i * 0.7 + Date.now() / 100) * 8}px`
                          : '4px'
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!userAudioUrl && mode !== 'native' && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Record your voice to compare with native speaker
          </div>
        )}
      </div>

      {/* Play Button */}
      <Button
        onClick={handlePlay}
        disabled={mode === 'user' && !userAudioUrl}
        className="w-full"
        variant={isPlaying ? 'outline' : 'default'}
      >
        {isPlaying ? (
          <>
            <Pause className="w-4 h-4 mr-2" />
            Stop
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            {mode === 'native' && 'Play Native Audio'}
            {mode === 'user' && 'Play Your Recording'}
            {mode === 'compare' && 'Compare Both'}
          </>
        )}
      </Button>

      {/* Comparison Tips */}
      {mode === 'compare' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3"
        >
          <p className="font-medium mb-1">💡 Comparison Tips:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Listen for timing differences</li>
            <li>Pay attention to pitch changes</li>
            <li>Notice which sounds differ most</li>
          </ul>
        </motion.div>
      )}
    </div>
  );
}
