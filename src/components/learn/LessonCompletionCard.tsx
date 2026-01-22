import { motion } from 'framer-motion';
import { CheckCircle, Zap, BookOpen, Brain, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LessonCompletionCardProps {
  lessonTitle: string;
  vocabCount: number;
  grammarCount: number;
  exerciseScore: number; // percentage
  xpEarned: number;
  hasQuiz: boolean;
  onTakeQuiz: () => void;
  onReview: () => void;
}

export function LessonCompletionCard({
  lessonTitle,
  vocabCount,
  grammarCount,
  exerciseScore,
  xpEarned,
  hasQuiz,
  onTakeQuiz,
  onReview,
}: LessonCompletionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center py-8"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="relative mb-6"
      >
        <motion.div
          className="w-24 h-24 bg-gradient-to-br from-success to-emerald-400 rounded-full flex items-center justify-center shadow-xl"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(34, 197, 94, 0.4)",
              "0 0 0 20px rgba(34, 197, 94, 0)",
            ]
          }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <CheckCircle className="h-12 w-12 text-white" />
        </motion.div>
        
        {/* Confetti particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'][i % 4],
              left: '50%',
              top: '50%',
            }}
            initial={{ x: 0, y: 0, scale: 0 }}
            animate={{
              x: Math.cos(i * Math.PI / 4) * 70,
              y: Math.sin(i * Math.PI / 4) * 70,
              scale: [0, 1, 0],
            }}
            transition={{
              delay: 0.3 + i * 0.05,
              duration: 0.8,
              ease: "easeOut"
            }}
          />
        ))}
      </motion.div>
      
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold mb-2"
      >
        🎉 Bagus!
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground mb-6"
      >
        Kamu sudah menyelesaikan {lessonTitle}!
      </motion.p>
      
      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-xl border border-border p-4 w-full max-w-xs mb-6"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm">Vocabulary</span>
            </div>
            <span className="font-semibold text-success">{vocabCount}/{vocabCount} ✓</span>
          </div>
          
          {grammarCount > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Brain className="h-4 w-4" />
                <span className="text-sm">Grammar</span>
              </div>
              <span className="font-semibold text-success">{grammarCount}/{grammarCount} ✓</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span className="text-sm">Exercises</span>
            </div>
            <span className="font-semibold">{exerciseScore}%</span>
          </div>
        </div>
      </motion.div>
      
      {/* XP Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl px-8 py-4 mb-8 border border-amber-500/30"
      >
        <div className="flex items-center justify-center gap-2">
          <Zap className="h-6 w-6 text-amber-500" />
          <span className="text-3xl font-bold text-amber-500">+{xpEarned}</span>
          <span className="text-lg text-amber-500/80">XP</span>
        </div>
      </motion.div>
      
      {/* Ready for Quiz */}
      {hasQuiz && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-lg font-semibold text-primary mb-4"
        >
          Ready for the quiz?
        </motion.p>
      )}
      
      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="w-full space-y-3"
      >
        {hasQuiz ? (
          <>
            <Button size="xl" className="w-full gap-2" onClick={onTakeQuiz}>
              <Zap className="h-5 w-5" />
              Take Quiz
            </Button>
            <Button variant="outline" size="lg" className="w-full" onClick={onReview}>
              Review First
            </Button>
          </>
        ) : (
          <Button size="xl" className="w-full gap-2" onClick={onTakeQuiz}>
            Lanjutkan
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}
