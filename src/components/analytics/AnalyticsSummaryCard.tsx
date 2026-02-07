import { motion } from 'framer-motion';
import { useAnalyticsSummary } from '@/hooks/useAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Zap, 
  Clock, 
  BookOpen, 
  Target, 
  Layers, 
  Mic, 
  Flame,
  Trophy,
  TrendingUp,
  Percent
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatItemProps {
  icon: typeof Zap;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
  bgColor: string;
}

function StatItem({ icon: Icon, label, value, subValue, color, bgColor }: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("p-3 rounded-xl text-center", bgColor)}
    >
      <Icon className={cn("h-5 w-5 mx-auto mb-1", color)} />
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      {subValue && <p className="text-[9px] text-muted-foreground mt-0.5">{subValue}</p>}
    </motion.div>
  );
}

export function AnalyticsSummaryCard() {
  const { data: summary, isLoading } = useAnalyticsSummary();

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-5 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}j ${mins}m` : `${hours}j`;
  };

  const stats: StatItemProps[] = [
    {
      icon: Zap,
      label: 'Total XP',
      value: summary.totalXP.toLocaleString(),
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      icon: Clock,
      label: 'Waktu Belajar',
      value: formatTime(summary.totalStudyTime),
      subValue: `~${summary.averageDailyTime}m/hari`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: Flame,
      label: 'Streak',
      value: summary.currentStreak,
      subValue: `Terbaik: ${summary.longestStreak}`,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      icon: TrendingUp,
      label: 'Hari Aktif',
      value: summary.activeDaysThisMonth,
      subValue: 'Bulan ini',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: BookOpen,
      label: 'Pelajaran',
      value: summary.totalLessonsCompleted,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: Target,
      label: 'Kuis',
      value: summary.totalQuizzesTaken,
      subValue: `${summary.averageQuizScore}% avg`,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10'
    },
    {
      icon: Layers,
      label: 'Flashcard',
      value: summary.totalFlashcardsReviewed.toLocaleString(),
      subValue: `${summary.masteryRate}% dikuasai`,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10'
    },
    {
      icon: Mic,
      label: 'Speaking',
      value: summary.totalSpeakingPracticed,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/20">
          <Trophy className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Statistik Lengkap</h2>
          <p className="text-sm text-muted-foreground">
            Ringkasan perjalanan belajarmu
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <StatItem {...stat} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
