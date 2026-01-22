import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RotateCcw, RefreshCw, Star } from 'lucide-react';
import { QuizResults } from './FlashcardQuiz';
import { DeckWithProgress } from '@/hooks/useFlashcardsDB';

interface QuizCompleteProps {
  deck: DeckWithProgress;
  results: QuizResults;
  onRetryMistakes: () => void;
  onNewQuiz: () => void;
  onBack: () => void;
}

export function QuizComplete({ deck, results, onRetryMistakes, onNewQuiz, onBack }: QuizCompleteProps) {
  const total = results.correct + results.incorrect;
  const percentage = total > 0 ? Math.round((results.correct / total) * 100) : 0;
  const xpEarned = results.correct * 5;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGrade = () => {
    if (percentage >= 90) return { emoji: '🌟', text: 'Excellent!' };
    if (percentage >= 70) return { emoji: '⭐', text: 'Great job!' };
    if (percentage >= 50) return { emoji: '👍', text: 'Good effort!' };
    return { emoji: '💪', text: 'Keep practicing!' };
  };

  const grade = getGrade();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center py-8 px-4"
    >
      <h1 className="text-xl font-bold mb-6">📊 Quiz Results</h1>

      {/* Score */}
      <div className="bg-card rounded-xl p-6 w-full max-w-sm border border-border text-center mb-6">
        <p className="text-sm text-muted-foreground mb-2">Score</p>
        <p className="text-4xl font-bold mb-2">{results.correct}/{total}</p>
        <Progress value={percentage} className="h-3 mb-2" />
        <p className="text-2xl font-bold text-primary">{percentage}%</p>
        
        <div className="mt-4 text-3xl">{grade.emoji}</div>
        <p className="text-lg font-medium">{grade.text}</p>
      </div>

      {/* Stats */}
      <div className="bg-card rounded-xl p-4 w-full max-w-sm border border-border space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Correct:</span>
          <span className="flex items-center gap-2">
            <span className="text-success">✅</span>
            <span className="font-medium">{results.correct}</span>
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Wrong:</span>
          <span className="flex items-center gap-2">
            <span className="text-destructive">❌</span>
            <span className="font-medium">{results.incorrect}</span>
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Time:</span>
          <span className="flex items-center gap-2">
            <span>⏱️</span>
            <span className="font-medium">{formatTime(results.timeSpent)}</span>
          </span>
        </div>
        <div className="border-t border-border pt-3">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Star className="h-5 w-5 fill-current" />
            <span className="font-bold">+{xpEarned} XP Earned</span>
          </div>
        </div>
      </div>

      {/* Mistakes Review */}
      {results.mistakes.length > 0 && (
        <div className="bg-card rounded-xl p-4 w-full max-w-sm border border-border mb-6">
          <h3 className="font-medium mb-3">Mistakes to review:</h3>
          <ul className="space-y-2">
            {results.mistakes.slice(0, 5).map((mistake, index) => (
              <li key={index} className="text-sm flex items-center gap-2">
                <span className="text-destructive">•</span>
                <span className="font-jp">{mistake.card.front_text}</span>
                <span className="text-muted-foreground">
                  ({mistake.card.back_text}) - you answered "{mistake.userAnswer}"
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="w-full max-w-sm space-y-3">
        {results.mistakes.length > 0 && (
          <Button variant="outline" size="lg" className="w-full" onClick={onRetryMistakes}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Retry Mistakes
          </Button>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg" onClick={onBack}>
            Back to Deck
          </Button>
          <Button size="lg" onClick={onNewQuiz}>
            <RefreshCw className="h-4 w-4 mr-2" />
            New Quiz
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
