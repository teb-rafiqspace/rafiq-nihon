import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';
import { TestAttempt } from '@/hooks/useMockTest';
import { cn } from '@/lib/utils';

interface TestHistoryProps {
  attempts: TestAttempt[];
  onViewDetail?: (attemptId: string) => void;
}

export function TestHistory({ attempts, onViewDetail }: TestHistoryProps) {
  if (attempts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Belum ada riwayat tes</p>
      </div>
    );
  }
  
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="space-y-3">
      {attempts.map((attempt, index) => {
        const percentage = Math.round((attempt.score / attempt.total_questions) * 100);
        
        return (
          <motion.button
            key={attempt.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onViewDetail?.(attempt.id)}
            className="w-full bg-card rounded-xl p-4 text-left shadow-card border border-border hover:shadow-elevated transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                attempt.passed ? "bg-success/20" : "bg-destructive/20"
              )}>
                {attempt.passed ? (
                  <CheckCircle className="h-6 w-6 text-success" />
                ) : (
                  <XCircle className="h-6 w-6 text-destructive" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    attempt.passed 
                      ? "bg-success/20 text-success" 
                      : "bg-destructive/20 text-destructive"
                  )}>
                    {attempt.passed ? 'LULUS' : 'TIDAK LULUS'}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {format(new Date(attempt.completed_at), 'd MMMM yyyy, HH:mm', { locale: id })}
                </p>
                
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="font-semibold">
                    {attempt.score}/{attempt.total_questions} ({percentage}%)
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(attempt.time_spent_seconds)}
                  </span>
                </div>
              </div>
              
              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
