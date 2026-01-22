import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Flag, X } from 'lucide-react';
import { UserAnswer } from '@/hooks/useMockTest';

interface QuestionNavGridProps {
  totalQuestions: number;
  currentIndex: number;
  answers: UserAnswer[];
  onSelect: (index: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function QuestionNavGrid({
  totalQuestions,
  currentIndex,
  answers,
  onSelect,
  isOpen,
  onClose
}: QuestionNavGridProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          
          {/* Grid Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 z-50 max-h-[70vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Navigasi Soal</h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary" />
                <span>Sekarang</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-success" />
                <span>Dijawab</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-muted border-2 border-border" />
                <span>Belum</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Flag className="h-3 w-3 text-amber-600" />
                </div>
                <span>Ditandai</span>
              </div>
            </div>
            
            {/* Grid */}
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: totalQuestions }).map((_, index) => {
                const answer = answers[index];
                const isCurrent = index === currentIndex;
                const isAnswered = answer?.answer !== null;
                const isFlagged = answer?.flagged;
                
                return (
                  <button
                    key={index}
                    onClick={() => {
                      onSelect(index);
                      onClose();
                    }}
                    className={cn(
                      "relative w-full aspect-square rounded-lg font-medium text-sm flex items-center justify-center transition-all",
                      isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
                      !isCurrent && isAnswered && "bg-success text-success-foreground",
                      !isCurrent && !isAnswered && "bg-muted border border-border hover:border-primary"
                    )}
                  >
                    {index + 1}
                    {isFlagged && (
                      <Flag className="absolute -top-1 -right-1 h-3 w-3 text-amber-500 fill-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
