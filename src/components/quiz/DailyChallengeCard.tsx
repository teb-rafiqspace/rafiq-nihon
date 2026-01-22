import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, Trophy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuizSet, DailyProgress } from '@/hooks/useQuizPractice';

interface DailyChallengeCardProps {
  challenge: QuizSet;
  progress: DailyProgress | null;
  streak: number;
  onStart: () => void;
  getTimeUntilReset: () => { hours: number; minutes: number; seconds: number };
}

export function DailyChallengeCard({
  challenge,
  progress,
  streak,
  onStart,
  getTimeUntilReset
}: DailyChallengeCardProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilReset());
  const isCompleted = progress?.completed;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilReset());
    }, 1000);
    return () => clearInterval(interval);
  }, [getTimeUntilReset]);

  const formatTime = (time: { hours: number; minutes: number; seconds: number }) => {
    return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <Flame className="h-5 w-5 text-orange-500" />
        <h3 className="font-semibold text-lg">Daily Challenge</h3>
      </div>

      <div
        className={`relative rounded-2xl p-5 border-2 overflow-hidden ${
          isCompleted
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
            : 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200'
        }`}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <Flame className="w-full h-full text-orange-500" />
        </div>

        <div className="relative z-10">
          {isCompleted ? (
            // Completed state
            <>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-800">Selesai Hari Ini!</p>
                  <p className="text-sm text-green-600">
                    Skor: {progress?.score}/10 ({Math.round((progress?.score || 0) / 10 * 100)}%)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-green-700">
                    +{progress?.xp_earned} XP
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-green-700">
                    Streak: {streak} hari
                  </span>
                </div>
              </div>

              <div className="text-sm text-green-600">
                <p>Kembali besok untuk tantangan baru!</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Reset dalam {formatTime(timeLeft)}</span>
                </div>
              </div>
            </>
          ) : (
            // Not completed state
            <>
              <div className="text-center mb-4">
                <p className="text-xl font-bold text-orange-800">🎯 {challenge.title_jp}</p>
                <p className="text-orange-600">{challenge.title_id}</p>
              </div>

              <div className="flex justify-center gap-4 mb-4 text-sm">
                <span className="text-orange-700">10 soal</span>
                <span className="text-orange-700">•</span>
                <span className="text-orange-700">5 menit</span>
                <span className="text-orange-700">•</span>
                <span className="text-orange-700 font-medium">+50 XP bonus</span>
              </div>

              {streak > 0 && (
                <div className="flex items-center justify-center gap-1.5 mb-4">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-700">
                    Streak: {streak} hari
                  </span>
                </div>
              )}

              <Button
                onClick={onStart}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
              >
                🚀 Mulai Tantangan
              </Button>

              <div className="flex items-center justify-center gap-1 mt-3 text-xs text-orange-600">
                <Clock className="h-3 w-3" />
                <span>Reset dalam {formatTime(timeLeft)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
