import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Calendar, Flame, Clock, Target, TrendingUp } from 'lucide-react';
import { DeckWithProgress } from '@/hooks/useFlashcardsDB';

interface DailyReviewDashboardProps {
  totalDueCards: number;
  decksWithDue: DeckWithProgress[];
  studyStats: {
    totalCardsStudied: number;
    totalTimeHours: number;
    accuracy: number;
    weekData: number[];
  };
  totalCards: number;
  masteredCards: number;
  learningCards: number;
  newCards: number;
  onStartReview: () => void;
}

export function DailyReviewDashboard({
  totalDueCards,
  decksWithDue,
  studyStats,
  totalCards,
  masteredCards,
  learningCards,
  newCards,
  onStartReview,
}: DailyReviewDashboardProps) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('id-ID', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const maxWeekCards = Math.max(...studyStats.weekData, 1);

  return (
    <div className="space-y-4">
      {/* Daily Review Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 border border-primary/20"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Calendar className="h-4 w-4" />
          Today's Review • {formattedDate}
        </div>

        {totalDueCards > 0 ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <Flame className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalDueCards} Cards Due</p>
                <p className="text-sm text-muted-foreground">
                  Start your review to maintain your streak!
                </p>
              </div>
            </div>

            <Button className="w-full" onClick={onStartReview}>
              <Play className="h-4 w-4 mr-2" />
              Start Review
            </Button>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-3xl mb-2">✨</p>
            <p className="font-medium">All caught up!</p>
            <p className="text-sm text-muted-foreground">No cards due for review today.</p>
          </div>
        )}
      </motion.div>

      {/* Cards Due by Deck */}
      {totalDueCards > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-4 border border-border"
        >
          <h3 className="font-medium mb-3 flex items-center gap-2">
            📊 Cards Due by Deck
          </h3>
          <div className="space-y-3">
            {decksWithDue
              .filter(d => d.dueCount > 0)
              .map(deck => (
                <div key={deck.id} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: deck.color || '#3B82F6' }}
                  />
                  <span className="flex-1 text-sm">{deck.title_id}</span>
                  <div className="flex-1">
                    <Progress 
                      value={(deck.dueCount / totalDueCards) * 100} 
                      className="h-2" 
                    />
                  </div>
                  <span className="text-sm font-medium w-16 text-right">
                    {deck.dueCount} cards
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Study Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-xl p-4 border border-border"
      >
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Your Progress
        </h3>

        {/* This Week Chart */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">This Week</p>
          <div className="flex items-end justify-between h-16 gap-1">
            {studyStats.weekData.map((count, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-primary/80 rounded-t transition-all"
                  style={{ 
                    height: `${(count / maxWeekCards) * 100}%`,
                    minHeight: count > 0 ? '4px' : '0px'
                  }}
                />
                <span className="text-xs text-muted-foreground">{weekDays[index]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xl font-bold">{studyStats.totalCardsStudied}</p>
            <p className="text-xs text-muted-foreground">Cards Studied</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xl font-bold">{studyStats.totalTimeHours}h</p>
            <p className="text-xs text-muted-foreground">Total Time</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xl font-bold">{studyStats.accuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
        </div>
      </motion.div>

      {/* Mastery Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl p-4 border border-border"
      >
        <h3 className="font-medium mb-4 flex items-center gap-2">
          🏆 Mastery Progress
        </h3>

        <p className="text-sm text-muted-foreground mb-3">
          Total Cards: {totalCards}
        </p>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>🆕 New</span>
              <span>{newCards} ({totalCards > 0 ? Math.round((newCards / totalCards) * 100) : 0}%)</span>
            </div>
            <Progress value={totalCards > 0 ? (newCards / totalCards) * 100 : 0} className="h-2" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>📖 Learning</span>
              <span>{learningCards} ({totalCards > 0 ? Math.round((learningCards / totalCards) * 100) : 0}%)</span>
            </div>
            <Progress value={totalCards > 0 ? (learningCards / totalCards) * 100 : 0} className="h-2" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>✅ Mastered</span>
              <span>{masteredCards} ({totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0}%)</span>
            </div>
            <Progress value={totalCards > 0 ? (masteredCards / totalCards) * 100 : 0} className="h-2" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
