import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

interface RecordingButtonProps {
  isRecording: boolean;
  onPress: () => void;
  onRelease: () => void;
  disabled?: boolean;
}

export function RecordingButton({ isRecording, onPress, onRelease, disabled }: RecordingButtonProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onMouseDown={onPress}
        onMouseUp={onRelease}
        onMouseLeave={isRecording ? onRelease : undefined}
        onTouchStart={onPress}
        onTouchEnd={onRelease}
        disabled={disabled}
        className={`
          relative w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-200 shadow-lg
          ${isRecording 
            ? 'bg-destructive animate-pulse-glow' 
            : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {/* Pulse rings when recording */}
        {isRecording && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-destructive"
              animate={{
                scale: [1, 1.5],
                opacity: [0.8, 0]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeOut'
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-destructive"
              animate={{
                scale: [1, 1.5],
                opacity: [0.8, 0]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.5
              }}
            />
          </>
        )}
        
        <Mic className={`h-8 w-8 text-white ${isRecording ? 'animate-pulse' : ''}`} />
      </motion.button>
      
      <span className="text-sm text-muted-foreground">
        {isRecording ? 'Recording...' : 'Hold to Record'}
      </span>
    </div>
  );
}
