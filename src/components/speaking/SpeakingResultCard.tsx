import { motion } from 'framer-motion';
import { Play, RotateCcw, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SpeakingResultCardProps {
  audioUrl: string | null;
  score: number;
  feedback: {
    positive: string[];
    improvements: string[];
  };
  onPlayRecording: () => void;
  onTryAgain: () => void;
  onNext: () => void;
  isPlaying?: boolean;
}

export function SpeakingResultCard({
  audioUrl,
  score,
  feedback,
  onPlayRecording,
  onTryAgain,
  onNext,
  isPlaying
}: SpeakingResultCardProps) {
  const stars = Math.round(score / 20);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 shadow-card space-y-4"
    >
      <div className="text-center">
        <h3 className="font-semibold mb-2">🎤 YOUR RECORDING</h3>
        
        {audioUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPlayRecording}
            className="mb-3"
          >
            <Play className={`h-4 w-4 mr-2 ${isPlaying ? 'animate-pulse' : ''}`} />
            {isPlaying ? 'Playing...' : 'Play Your Recording'}
          </Button>
        )}
        
        <div className="flex justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`text-xl ${i <= stars ? '' : 'grayscale opacity-30'}`}
            >
              ⭐
            </motion.span>
          ))}
        </div>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.5 }}
          className="text-2xl font-bold text-foreground"
        >
          Score: {score}/100
        </motion.div>
      </div>
      
      <div className="space-y-2">
        {feedback.positive.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="flex items-center gap-2 text-sm text-success"
          >
            <Check className="h-4 w-4" />
            {item}
          </motion.div>
        ))}
        
        {feedback.improvements.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            className="flex items-center gap-2 text-sm text-amber-500"
          >
            <AlertTriangle className="h-4 w-4" />
            {item}
          </motion.div>
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onTryAgain}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
        <Button
          onClick={onNext}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600"
        >
          <Check className="h-4 w-4" />
          Next →
        </Button>
      </div>
    </motion.div>
  );
}
