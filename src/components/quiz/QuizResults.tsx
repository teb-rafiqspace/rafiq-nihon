import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Check, X, Star, RotateCcw, ArrowLeft, BookOpen, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QuizSet, QuizQuestion, QuizStats } from '@/hooks/useQuizPractice';
import { QuizSessionResult } from './QuizSession';

interface QuizResultsProps {
  quiz: QuizSet;
  results: QuizSessionResult;
  previousBest: number | null;
  isDaily?: boolean;
  streak?: number;
  onRetryMistakes: () => void;
  onTryAgain: () => void;
  onBack: () => void;
}

export function QuizResults({
  quiz,
  results,
  previousBest,
  isDaily,
  streak = 0,
  onRetryMistakes,
  onTryAgain,
  onBack
}: QuizResultsProps) {
  const [showReview, setShowReview] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  const percentage = Math.round((results.score / results.totalQuestions) * 100);
  const isNewBest = previousBest === null || percentage > previousBest;
  const xpEarned = isDaily ? results.score + 50 : results.score;

  const getGrade = () => {
    if (percentage >= 90) return { emoji: '🌟', text: 'Luar Biasa!', color: 'text-amber-500' };
    if (percentage >= 80) return { emoji: '⭐', text: 'Hebat!', color: 'text-green-600' };
    if (percentage >= 70) return { emoji: '👍', text: 'Bagus!', color: 'text-blue-600' };
    if (percentage >= 60) return { emoji: '💪', text: 'Lumayan!', color: 'text-amber-600' };
    return { emoji: '📚', text: 'Terus Belajar!', color: 'text-red-600' };
  };

  const grade = getGrade();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // Review mode
  if (showReview && results.mistakes.length > 0) {
    const currentMistake = results.mistakes[reviewIndex];
    const correctOption = currentMistake.question.options?.find(
      o => o.id === currentMistake.question.correct_answer
    );
    const userOption = currentMistake.question.options?.find(
      o => o.id === currentMistake.userAnswer
    );

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Review Kesalahan {reviewIndex + 1}/{results.mistakes.length}
          </h2>
          <Button variant="ghost" size="sm" onClick={() => setShowReview(false)}>
            Tutup
          </Button>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <p className="text-lg font-medium mb-4">{currentMistake.question.question_text}</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
              <span className="text-red-700">Jawaban Anda: {userOption?.text}</span>
              <X className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
              <span className="text-green-700">Jawaban Benar: {correctOption?.text}</span>
              <Check className="h-5 w-5 text-green-600" />
            </div>
          </div>

          {currentMistake.question.explanation && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-semibold text-blue-800 mb-1">💡 Penjelasan:</p>
              <p className="text-sm text-blue-700">{currentMistake.question.explanation}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))}
            disabled={reviewIndex === 0}
            className="flex-1"
          >
            ← Sebelumnya
          </Button>
          <Button
            variant="outline"
            onClick={() => setReviewIndex(Math.min(results.mistakes.length - 1, reviewIndex + 1))}
            disabled={reviewIndex === results.mistakes.length - 1}
            className="flex-1"
          >
            Selanjutnya →
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="text-center py-6">
        {isDaily ? (
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-bold">Daily Challenge Selesai!</h1>
          </div>
        ) : (
          <h1 className="text-2xl font-bold mb-2">🎉 Quiz Selesai!</h1>
        )}

        <div className="text-6xl mb-2">{grade.emoji}</div>
        <p className={`text-xl font-bold ${grade.color}`}>{grade.text}</p>
      </div>

      {/* Score */}
      <div className="bg-card rounded-2xl p-6 border border-border text-center">
        <p className="text-muted-foreground mb-2">Skor</p>
        <p className="text-4xl font-bold mb-3">
          {results.score}/{results.totalQuestions}
        </p>
        <Progress value={percentage} className="h-3 mb-2" />
        <p className="text-2xl font-bold text-primary">{percentage}%</p>

        {isNewBest && previousBest !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full"
          >
            <Trophy className="h-4 w-4" />
            <span className="text-sm font-medium">
              Rekor Baru! (Sebelumnya: {previousBest}%)
            </span>
          </motion.div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl p-4 text-center border border-border">
          <Check className="h-6 w-6 mx-auto mb-2 text-green-600" />
          <p className="text-xl font-bold">{results.score}</p>
          <p className="text-xs text-muted-foreground">Benar</p>
        </div>
        <div className="bg-card rounded-xl p-4 text-center border border-border">
          <X className="h-6 w-6 mx-auto mb-2 text-red-600" />
          <p className="text-xl font-bold">{results.totalQuestions - results.score}</p>
          <p className="text-xs text-muted-foreground">Salah</p>
        </div>
        <div className="bg-card rounded-xl p-4 text-center border border-border">
          <Star className="h-6 w-6 mx-auto mb-2 text-amber-500" />
          <p className="text-xl font-bold">+{xpEarned}</p>
          <p className="text-xs text-muted-foreground">XP</p>
        </div>
      </div>

      {/* Daily Streak */}
      {isDaily && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="font-semibold text-orange-800">Daily Streak: {streak} hari</span>
          </div>
          <p className="text-sm text-orange-600">Terus latihan setiap hari!</p>
        </div>
      )}

      {/* Mistakes */}
      {results.mistakes.length > 0 && (
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <X className="h-5 w-5 text-red-500" />
            Perlu Dipelajari Ulang:
          </h3>
          <div className="space-y-2">
            {results.mistakes.slice(0, 3).map((mistake, index) => (
              <div key={index} className="text-sm bg-red-50 rounded-lg p-3 border border-red-100">
                <p className="text-red-800">• {mistake.question.question_text}</p>
              </div>
            ))}
            {results.mistakes.length > 3 && (
              <p className="text-sm text-muted-foreground text-center">
                +{results.mistakes.length - 3} kesalahan lainnya
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {results.mistakes.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => setShowReview(true)}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Review
            </Button>
            <Button
              variant="outline"
              onClick={onRetryMistakes}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Ulang Salah
            </Button>
          </div>
        )}

        {!isDaily && (
          <Button onClick={onTryAgain} className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Coba Lagi
          </Button>
        )}

        <Button variant="outline" onClick={onBack} className="w-full">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar Quiz
        </Button>
      </div>
    </motion.div>
  );
}
