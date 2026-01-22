import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Flag, CheckCircle, X, FileQuestion, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EnhancedSubmitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalQuestions: number;
  answeredCount: number;
  unansweredQuestions: number[];
  flaggedQuestions: number[];
  onGoToQuestion: (index: number) => void;
}

export function EnhancedSubmitDialog({
  isOpen,
  onClose,
  onConfirm,
  totalQuestions,
  answeredCount,
  unansweredQuestions,
  flaggedQuestions,
  onGoToQuestion
}: EnhancedSubmitDialogProps) {
  const unansweredCount = unansweredQuestions.length;
  const flaggedCount = flaggedQuestions.length;
  const hasIssues = unansweredCount > 0 || flaggedCount > 0;
  
  const handleGoToQuestion = (index: number) => {
    onGoToQuestion(index);
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
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-background rounded-2xl z-50 shadow-xl max-h-[80vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-border shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xl">📋 Review Sebelum Submit</h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-success/10 rounded-xl">
                  <div className="flex items-center justify-center gap-1 text-success mb-1">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-2xl font-bold">{answeredCount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Dijawab</p>
                </div>
                
                <div className={cn(
                  "text-center p-3 rounded-xl",
                  unansweredCount > 0 ? "bg-destructive/10" : "bg-muted"
                )}>
                  <div className={cn(
                    "flex items-center justify-center gap-1 mb-1",
                    unansweredCount > 0 ? "text-destructive" : "text-muted-foreground"
                  )}>
                    <FileQuestion className="h-5 w-5" />
                    <span className="text-2xl font-bold">{unansweredCount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Belum</p>
                </div>
                
                <div className={cn(
                  "text-center p-3 rounded-xl",
                  flaggedCount > 0 ? "bg-amber-100 dark:bg-amber-900/30" : "bg-muted"
                )}>
                  <div className={cn(
                    "flex items-center justify-center gap-1 mb-1",
                    flaggedCount > 0 ? "text-amber-600" : "text-muted-foreground"
                  )}>
                    <Flag className="h-5 w-5" />
                    <span className="text-2xl font-bold">{flaggedCount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Ditandai</p>
                </div>
              </div>
              
              {/* Unanswered Questions */}
              {unansweredCount > 0 && (
                <div className="bg-destructive/5 rounded-xl p-4 border border-destructive/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-destructive mb-2">
                        Soal belum dijawab:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {unansweredQuestions.slice(0, 10).map((qIndex) => (
                          <button
                            key={qIndex}
                            onClick={() => handleGoToQuestion(qIndex)}
                            className="px-2.5 py-1 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg text-sm font-medium transition-colors"
                          >
                            Q{qIndex + 1}
                          </button>
                        ))}
                        {unansweredQuestions.length > 10 && (
                          <span className="text-sm text-muted-foreground">
                            +{unansweredQuestions.length - 10} lagi
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Flagged Questions */}
              {flaggedCount > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <Flag className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                        Soal ditandai untuk review:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {flaggedQuestions.slice(0, 10).map((qIndex) => (
                          <button
                            key={qIndex}
                            onClick={() => handleGoToQuestion(qIndex)}
                            className="px-2.5 py-1 bg-amber-100 dark:bg-amber-800/50 hover:bg-amber-200 dark:hover:bg-amber-800 text-amber-700 dark:text-amber-300 rounded-lg text-sm font-medium transition-colors"
                          >
                            Q{qIndex + 1}
                          </button>
                        ))}
                        {flaggedQuestions.length > 10 && (
                          <span className="text-sm text-muted-foreground">
                            +{flaggedQuestions.length - 10} lagi
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* All Good Message */}
              {!hasIssues && (
                <div className="bg-success/10 rounded-xl p-4 border border-success/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <p className="font-medium text-success">
                      Semua soal sudah dijawab! 🎉
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="p-5 border-t border-border bg-muted/30 space-y-3 shrink-0">
              <Button
                variant="default"
                size="lg"
                className="w-full"
                onClick={onConfirm}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Tes
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={onClose}
              >
                Kembali ke Tes
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
