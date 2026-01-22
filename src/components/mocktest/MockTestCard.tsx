import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Clock, FileText, Lock, Trophy } from 'lucide-react';

interface MockTestCardProps {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  timeMinutes: number;
  icon: string;
  isPremium?: boolean;
  isLocked?: boolean;
  bestScore?: number;
  onStart: () => void;
}

export function MockTestCard({
  title,
  description,
  questionCount,
  timeMinutes,
  icon,
  isPremium = false,
  isLocked = false,
  bestScore,
  onStart
}: MockTestCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 shadow-card border border-border"
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center text-2xl shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg truncate">{title}</h3>
            {isPremium && (
              <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
                Premium
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{questionCount} soal</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{timeMinutes} menit</span>
            </div>
          </div>
          
          {bestScore !== undefined && (
            <div className="flex items-center gap-2 mb-3 text-sm">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-muted-foreground">Skor terbaik:</span>
              <span className="font-semibold text-primary">{bestScore}%</span>
            </div>
          )}
        </div>
      </div>
      
      <Button
        className="w-full mt-2"
        onClick={onStart}
        disabled={isLocked}
      >
        {isLocked ? (
          <>
            <Lock className="h-4 w-4 mr-2" />
            Upgrade ke Premium
          </>
        ) : (
          'Mulai Tes'
        )}
      </Button>
    </motion.div>
  );
}
