import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WritingEditorProps {
  value: string;
  onChange: (text: string) => void;
  wordLimitMin: number;
  wordLimitMax: number;
  timeLimitMinutes: number;
  onTimeUp?: () => void;
  disabled?: boolean;
}

export function WritingEditor({
  value,
  onChange,
  wordLimitMin,
  wordLimitMax,
  timeLimitMinutes,
  onTimeUp,
  disabled = false,
}: WritingEditorProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimitMinutes * 60);
  const [timerStarted, setTimerStarted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  // Start timer on first keystroke
  useEffect(() => {
    if (value.length > 0 && !timerStarted) {
      setTimerStarted(true);
    }
  }, [value, timerStarted]);

  // Timer countdown
  useEffect(() => {
    if (!timerStarted || disabled) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStarted, disabled, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWordCountColor = () => {
    if (wordCount < wordLimitMin) return 'text-amber-600';
    if (wordCount > wordLimitMax) return 'text-destructive';
    return 'text-success';
  };

  const getTimerColor = () => {
    if (timeRemaining <= 60) return 'text-destructive';
    if (timeRemaining <= 300) return 'text-amber-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-3">
      {/* Stats Bar */}
      <div className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
        <div className="flex items-center gap-4">
          <div className={cn("flex items-center gap-1.5 text-sm font-medium", getWordCountColor())}>
            <FileText className="h-4 w-4" />
            <span>{wordCount} words</span>
          </div>
          <span className="text-xs text-muted-foreground">
            ({wordLimitMin}-{wordLimitMax} target)
          </span>
        </div>
        <div className={cn("flex items-center gap-1.5 text-sm font-medium", getTimerColor())}>
          <Clock className="h-4 w-4" />
          <span>{formatTime(timeRemaining)}</span>
        </div>
      </div>

      {/* Word Count Progress */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full transition-colors",
            wordCount < wordLimitMin ? "bg-amber-500" :
            wordCount > wordLimitMax ? "bg-destructive" : "bg-success"
          )}
          animate={{ width: `${Math.min((wordCount / wordLimitMax) * 100, 100)}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        />
      </div>

      {/* Text Area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Start writing your essay here..."
        className={cn(
          "w-full min-h-[300px] p-4 rounded-xl border border-border bg-background",
          "text-base leading-relaxed resize-y",
          "focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600",
          "placeholder:text-muted-foreground/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />

      {/* Character Count */}
      <p className="text-xs text-muted-foreground text-right">
        {charCount} characters
      </p>
    </div>
  );
}
