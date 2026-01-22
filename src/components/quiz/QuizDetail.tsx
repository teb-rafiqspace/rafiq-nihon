import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle, Clock, Star, BarChart3, Shuffle, Lightbulb, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { QuizSet, QuizStats } from '@/hooks/useQuizPractice';

interface QuizDetailProps {
  quiz: QuizSet;
  stats: QuizStats;
  onBack: () => void;
  onStart: (options: QuizOptions) => void;
}

export interface QuizOptions {
  shuffle: boolean;
  showHints: boolean;
  enableTimer: boolean;
}

export function QuizDetail({ quiz, stats, onBack, onStart }: QuizDetailProps) {
  const [options, setOptions] = useState<QuizOptions>({
    shuffle: true,
    showHints: true,
    enableTimer: false
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-muted-foreground">Kembali</span>
      </div>

      {/* Quiz Info */}
      <div className="text-center py-4">
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl"
          style={{ backgroundColor: quiz.color || '#3B82F6' }}
        >
          {quiz.title_jp.charAt(0)}
        </div>
        <h1 className="text-2xl font-bold">{quiz.title_jp}</h1>
        <p className="text-muted-foreground">{quiz.title_id}</p>
      </div>

      {/* Description */}
      {quiz.description && (
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground">📝 {quiz.description}</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl p-4 text-center border border-border">
          <BarChart3 className="h-5 w-5 mx-auto mb-2 text-primary" />
          <p className="text-xl font-bold">{quiz.question_count}</p>
          <p className="text-xs text-muted-foreground">Pertanyaan</p>
        </div>
        <div className="bg-card rounded-xl p-4 text-center border border-border">
          <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xl font-bold">{quiz.time_limit_seconds ? `${Math.floor(quiz.time_limit_seconds / 60)}m` : 'No'}</p>
          <p className="text-xs text-muted-foreground">Timer</p>
        </div>
        <div className="bg-card rounded-xl p-4 text-center border border-border">
          <Star className="h-5 w-5 mx-auto mb-2 text-amber-500" />
          <p className="text-xl font-bold">{quiz.xp_reward}</p>
          <p className="text-xs text-muted-foreground">XP</p>
        </div>
      </div>

      {/* Your Stats */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <span className="text-lg">📈</span> Statistik Kamu
        </h3>
        
        {stats.attempts > 0 ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Percobaan:</span>
              <span className="font-medium">{stats.attempts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Skor Terbaik:</span>
              <span className="font-medium text-green-600">
                {stats.bestScore}/{quiz.question_count} ({Math.round(stats.bestPercentage)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rata-rata:</span>
              <span className="font-medium">
                {stats.averageScore.toFixed(1)}/{quiz.question_count} ({Math.round(stats.averagePercentage)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Terakhir Main:</span>
              <span className="font-medium">{formatDate(stats.lastPlayed)}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            Belum pernah mencoba quiz ini
          </p>
        )}
      </div>

      {/* Options */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <span className="text-lg">⚙️</span> Opsi
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shuffle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Acak Pertanyaan</span>
            </div>
            <Switch
              checked={options.shuffle}
              onCheckedChange={(checked) => setOptions({ ...options, shuffle: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Tampilkan Hint</span>
            </div>
            <Switch
              checked={options.showHints}
              onCheckedChange={(checked) => setOptions({ ...options, showHints: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Aktifkan Timer (5 menit)</span>
            </div>
            <Switch
              checked={options.enableTimer}
              onCheckedChange={(checked) => setOptions({ ...options, enableTimer: checked })}
            />
          </div>
        </div>
      </div>

      {/* Start Button */}
      <Button
        onClick={() => onStart(options)}
        className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
      >
        🚀 Mulai Quiz
      </Button>
    </motion.div>
  );
}
