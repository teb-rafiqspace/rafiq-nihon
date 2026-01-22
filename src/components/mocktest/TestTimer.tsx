import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestTimerProps {
  timeRemaining: number;
  formatTime: (seconds: number) => string;
}

export function TestTimer({ timeRemaining, formatTime }: TestTimerProps) {
  const isLowTime = timeRemaining < 300; // Less than 5 minutes
  const isCriticalTime = timeRemaining < 60; // Less than 1 minute
  
  return (
    <motion.div
      animate={isCriticalTime ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: isCriticalTime ? Infinity : 0, duration: 1 }}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-bold",
        isCriticalTime && "bg-destructive text-destructive-foreground",
        isLowTime && !isCriticalTime && "bg-amber-100 text-amber-700",
        !isLowTime && "bg-muted text-foreground"
      )}
    >
      <Clock className="h-5 w-5" />
      <span>{formatTime(timeRemaining)}</span>
    </motion.div>
  );
}
