import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, RotateCcw, X } from 'lucide-react';

interface FlashcardCompleteProps {
  knownCount: number;
  unknownCount: number;
  onReviewUnknown: () => void;
  onFinish: () => void;
  hasUnknownCards: boolean;
}

export function FlashcardComplete({
  knownCount,
  unknownCount,
  onReviewUnknown,
  onFinish,
  hasUnknownCards,
}: FlashcardCompleteProps) {
  const total = knownCount + unknownCount;
  const percentage = total > 0 ? Math.round((knownCount / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="text-6xl mb-6"
      >
        🎉
      </motion.div>
      
      <h2 className="text-2xl font-bold mb-2">Selesai!</h2>
      <p className="text-muted-foreground mb-8">
        Kamu menguasai {percentage}% dari kartu
      </p>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-success/10 rounded-xl p-4 text-center border border-success/20"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Check className="h-5 w-5 text-success" />
            <span className="text-2xl font-bold text-success">{knownCount}</span>
          </div>
          <p className="text-sm text-muted-foreground">Tahu</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-destructive/10 rounded-xl p-4 text-center border border-destructive/20"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <X className="h-5 w-5 text-destructive" />
            <span className="text-2xl font-bold text-destructive">{unknownCount}</span>
          </div>
          <p className="text-sm text-muted-foreground">Tidak tahu</p>
        </motion.div>
      </div>
      
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {hasUnknownCards && (
          <Button
            variant="outline"
            size="lg"
            onClick={onReviewUnknown}
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Review Lagi ({unknownCount})
          </Button>
        )}
        
        <Button
          size="lg"
          onClick={onFinish}
          className="w-full"
        >
          Selesai
        </Button>
      </div>
    </motion.div>
  );
}
