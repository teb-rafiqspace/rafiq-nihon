import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RotateCcw, Home, Star } from 'lucide-react';
import { StudyResults } from './FlashcardStudy';
import { DeckWithProgress } from '@/hooks/useFlashcardsDB';

interface StudyCompleteProps {
  deck: DeckWithProgress;
  results: StudyResults;
  onContinue: () => void;
  onBackToDeck: () => void;
  onHome: () => void;
}

export function StudyComplete({ deck, results, onContinue, onBackToDeck, onHome }: StudyCompleteProps) {
  const total = results.again + results.hard + results.good + results.easy;
  const xpEarned = (results.good * 2) + (results.easy * 3) + results.hard;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPercentage = (value: number) => total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center py-8 px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="text-6xl mb-6"
      >
        🎉
      </motion.div>

      <h1 className="text-2xl font-bold mb-2">Session Complete!</h1>
      
      {/* Stats Summary */}
      <div className="bg-card rounded-xl p-6 w-full max-w-sm border border-border space-y-4 mb-6">
        <div className="text-center border-b border-border pb-4">
          <p className="text-sm text-muted-foreground">Cards Studied</p>
          <p className="text-3xl font-bold">{total}</p>
          <p className="text-sm text-muted-foreground mt-1">Time: {formatTime(results.timeSpent)}</p>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">📊 Results:</h3>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xl">😄</span>
              <span className="text-sm w-12">Easy:</span>
              <div className="flex-1">
                <Progress value={getPercentage(results.easy)} className="h-2" />
              </div>
              <span className="text-sm font-medium w-8">{results.easy}</span>
              <span className="text-xs text-muted-foreground w-10">{getPercentage(results.easy)}%</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xl">🙂</span>
              <span className="text-sm w-12">Good:</span>
              <div className="flex-1">
                <Progress value={getPercentage(results.good)} className="h-2" />
              </div>
              <span className="text-sm font-medium w-8">{results.good}</span>
              <span className="text-xs text-muted-foreground w-10">{getPercentage(results.good)}%</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xl">😕</span>
              <span className="text-sm w-12">Hard:</span>
              <div className="flex-1">
                <Progress value={getPercentage(results.hard)} className="h-2" />
              </div>
              <span className="text-sm font-medium w-8">{results.hard}</span>
              <span className="text-xs text-muted-foreground w-10">{getPercentage(results.hard)}%</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xl">😰</span>
              <span className="text-sm w-12">Again:</span>
              <div className="flex-1">
                <Progress value={getPercentage(results.again)} className="h-2" />
              </div>
              <span className="text-sm font-medium w-8">{results.again}</span>
              <span className="text-xs text-muted-foreground w-10">{getPercentage(results.again)}%</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4 text-center">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Star className="h-5 w-5 fill-current" />
            <span className="text-lg font-bold">+{xpEarned} XP Earned</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-sm space-y-3">
        <Button size="lg" className="w-full" onClick={onContinue}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Continue Studying
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg" onClick={onBackToDeck}>
            Back to Deck
          </Button>
          <Button variant="outline" size="lg" onClick={onHome}>
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
