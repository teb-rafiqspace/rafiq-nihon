import { motion } from 'framer-motion';
import { Trophy, Target, MessageCircle, Clock, Star, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface SpeakingResultsProps {
  score: number;
  xpEarned: number;
  pronunciation: number;
  fluency: number;
  accuracy: number;
  phrasesCompleted: number;
  totalPhrases: number;
  phrasesMastered: number;
  timeSpent: string;
  improvements: string[];
  onPracticeAgain: () => void;
  onContinue: () => void;
}

export function SpeakingResults({
  score,
  xpEarned,
  pronunciation,
  fluency,
  accuracy,
  phrasesCompleted,
  totalPhrases,
  phrasesMastered,
  timeSpent,
  improvements,
  onPracticeAgain,
  onContinue
}: SpeakingResultsProps) {
  const stars = Math.round(score / 20);

  const breakdownItems = [
    { label: 'Pronunciation', value: pronunciation, icon: '🎯' },
    { label: 'Fluency', value: fluency, icon: '🗣️' },
    { label: 'Accuracy', value: accuracy, icon: '📖' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg mx-auto px-4 py-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h1 className="text-2xl font-bold mb-1">Great Practice!</h1>
          <p className="text-muted-foreground font-jp">素晴らしい練習でした！</p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white text-center mb-6"
        >
          <p className="text-sm opacity-80 mb-2">Overall Score</p>
          
          <div className="flex justify-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.span
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className={`text-2xl ${i <= stars ? '' : 'opacity-30'}`}
              >
                ⭐
              </motion.span>
            ))}
          </div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.6 }}
            className="text-5xl font-bold mb-2"
          >
            {score}/100
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1"
          >
            <Star className="h-4 w-4" />
            +{xpEarned} XP Earned
          </motion.div>
        </motion.div>

        {/* Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl p-4 shadow-card mb-6"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            📊 BREAKDOWN
          </h3>
          
          <div className="space-y-4">
            {breakdownItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    {item.label}
                  </span>
                  <span className="font-semibold">{item.value}%</span>
                </div>
                <Progress value={item.value} className="h-2" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="bg-card rounded-xl p-3 text-center shadow-card">
            <p className="text-2xl font-bold text-indigo-500">
              {phrasesCompleted}/{totalPhrases}
            </p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center shadow-card">
            <p className="text-2xl font-bold text-purple-500">{phrasesMastered}</p>
            <p className="text-xs text-muted-foreground">Mastered</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center shadow-card">
            <p className="text-2xl font-bold text-pink-500">{timeSpent}</p>
            <p className="text-xs text-muted-foreground">Time</p>
          </div>
        </motion.div>

        {/* Improvements */}
        {improvements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6"
          >
            <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              💡 AREAS TO IMPROVE
            </h3>
            <ul className="space-y-1">
              {improvements.map((item, i) => (
                <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                  <span>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-2 gap-3"
        >
          <Button
            variant="outline"
            onClick={onPracticeAgain}
            className="h-12"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Practice Again
          </Button>
          <Button
            onClick={onContinue}
            className="h-12 bg-gradient-to-r from-indigo-500 to-purple-600"
          >
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
