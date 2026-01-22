import React from 'react';
import { motion } from 'framer-motion';

interface FlashcardProgressProps {
  current: number;
  total: number;
  progress: number;
}

export function FlashcardProgress({ current, total, progress }: FlashcardProgressProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-semibold">{current}/{total}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-secondary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
