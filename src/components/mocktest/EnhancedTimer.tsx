import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedTimerProps {
  timeRemaining: number;
  totalTime: number;
  formatTime: (seconds: number) => string;
}

export function EnhancedTimer({ timeRemaining, totalTime, formatTime }: EnhancedTimerProps) {
  const { status, statusColor, bgColor, textColor, shouldPulse } = useMemo(() => {
    const minutesRemaining = timeRemaining / 60;
    
    if (minutesRemaining <= 1) {
      return {
        status: 'critical',
        statusColor: 'text-white',
        bgColor: 'bg-destructive',
        textColor: 'text-white',
        shouldPulse: true
      };
    } else if (minutesRemaining <= 5) {
      return {
        status: 'warning',
        statusColor: 'text-destructive',
        bgColor: 'bg-destructive/10',
        textColor: 'text-destructive',
        shouldPulse: false
      };
    } else if (minutesRemaining <= 10) {
      return {
        status: 'caution',
        statusColor: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-100 dark:bg-amber-900/40',
        textColor: 'text-amber-700 dark:text-amber-300',
        shouldPulse: false
      };
    }
    
    return {
      status: 'normal',
      statusColor: 'text-muted-foreground',
      bgColor: 'bg-muted',
      textColor: 'text-foreground',
      shouldPulse: false
    };
  }, [timeRemaining]);
  
  const progressPercent = (timeRemaining / totalTime) * 100;
  
  return (
    <motion.div
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
        bgColor
      )}
      animate={shouldPulse ? {
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 0 0 0 rgba(239, 68, 68, 0)',
          '0 0 0 4px rgba(239, 68, 68, 0.3)',
          '0 0 0 0 rgba(239, 68, 68, 0)'
        ]
      } : {}}
      transition={shouldPulse ? {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      } : {}}
    >
      {timeRemaining <= 60 ? (
        <AlertTriangle className={cn("h-4 w-4", statusColor)} />
      ) : (
        <Clock className={cn("h-4 w-4", statusColor)} />
      )}
      <span className={cn("font-mono font-bold text-lg tabular-nums", textColor)}>
        {formatTime(timeRemaining)}
      </span>
      
      {/* Mini progress bar */}
      <div className="w-12 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden hidden sm:block">
        <motion.div
          className={cn(
            "h-full rounded-full",
            timeRemaining <= 60 ? "bg-white" :
            timeRemaining <= 300 ? "bg-destructive" :
            timeRemaining <= 600 ? "bg-amber-500" : "bg-primary"
          )}
          style={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
}
