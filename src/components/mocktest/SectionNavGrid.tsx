import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flag, Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserAnswer } from '@/hooks/useMockTest';

interface Section {
  id: string;
  name: string;
  nameJp: string;
  startIndex: number;
  count: number;
}

interface SectionNavGridProps {
  sections: Section[];
  currentIndex: number;
  answers: UserAnswer[];
  onSelect: (index: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function SectionNavGrid({
  sections,
  currentIndex,
  answers,
  onSelect,
  isOpen,
  onClose
}: SectionNavGridProps) {
  const getQuestionStatus = (index: number) => {
    const answer = answers[index];
    if (!answer) return 'unanswered';
    if (answer.flagged) return 'flagged';
    if (answer.answer) return 'answered';
    return 'unanswered';
  };
  
  const handleSelect = (index: number) => {
    onSelect(index);
    onClose();
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl z-50 max-h-[80vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <h3 className="font-bold text-lg">📋 Navigasi Soal</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {sections.map((section) => {
                const sectionAnswers = answers.slice(section.startIndex, section.startIndex + section.count);
                const answeredCount = sectionAnswers.filter(a => a?.answer).length;
                const flaggedCount = sectionAnswers.filter(a => a?.flagged).length;
                
                return (
                  <div key={section.id}>
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{section.name}</h4>
                        <p className="text-xs text-muted-foreground font-japanese">{section.nameJp}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-primary" />
                          {answeredCount}/{section.count}
                        </span>
                        {flaggedCount > 0 && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <Flag className="h-3 w-3" />
                            {flaggedCount}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Question Grid */}
                    <div className="grid grid-cols-10 gap-2">
                      {Array.from({ length: section.count }).map((_, i) => {
                        const globalIndex = section.startIndex + i;
                        const status = getQuestionStatus(globalIndex);
                        const isCurrent = globalIndex === currentIndex;
                        
                        return (
                          <button
                            key={globalIndex}
                            onClick={() => handleSelect(globalIndex)}
                            className={cn(
                              "relative w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center",
                              // Current question
                              isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                              // Status styles
                              status === 'answered' && !isCurrent && "bg-primary text-primary-foreground",
                              status === 'unanswered' && !isCurrent && "bg-muted text-muted-foreground hover:bg-muted/80",
                              status === 'flagged' && "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 ring-2 ring-amber-400"
                            )}
                          >
                            {globalIndex + 1}
                            {status === 'flagged' && (
                              <Flag className="absolute -top-1 -right-1 h-3 w-3 text-amber-600 fill-amber-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="p-4 border-t border-border bg-muted/30 shrink-0">
              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary" />
                  <span>Dijawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-muted border border-border" />
                  <span>Belum</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-100 dark:bg-amber-900/40 ring-1 ring-amber-400">
                    <Flag className="h-2.5 w-2.5 text-amber-600 m-0.5" />
                  </div>
                  <span>Ditandai</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
