import { motion } from 'framer-motion';
import { Trophy, Flame, Zap, BookOpen, ChevronRight } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';
import { AchievementCard } from './AchievementCard';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

const CATEGORY_CONFIG = {
  total_xp: {
    label: 'XP',
    icon: Zap,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10'
  },
  streak_days: {
    label: 'Streak',
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  lessons_completed: {
    label: 'Pelajaran',
    icon: BookOpen,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  }
};

export function AchievementSection() {
  const navigate = useNavigate();
  const { groupedAchievements, stats } = useAchievements();

  return (
    <div className="space-y-4">
      {/* Header with overall stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">Pencapaian</h2>
        </div>
        <button 
          onClick={() => navigate('/profile?tab=achievements')}
          className="text-sm text-primary flex items-center gap-1 hover:underline"
        >
          Lihat Semua
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Overall progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-4 border border-border"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Progress Keseluruhan</span>
          <span className="text-sm font-medium">{stats.earned}/{stats.total} Badge</span>
        </div>
        <Progress value={stats.percentage} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {stats.percentage}% pencapaian tercapai
        </p>
      </motion.div>

      {/* Category tabs */}
      <Tabs defaultValue="total_xp" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            const categoryAchievements = groupedAchievements[key as keyof typeof groupedAchievements];
            const earned = categoryAchievements?.filter(a => a.earned).length || 0;
            const total = categoryAchievements?.length || 0;
            
            return (
              <TabsTrigger 
                key={key} 
                value={key}
                className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-primary/10"
              >
                <div className={`p-1.5 rounded-lg ${config.bgColor}`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <span className="text-xs font-medium">{config.label}</span>
                <span className="text-xs text-muted-foreground">{earned}/{total}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.keys(CATEGORY_CONFIG).map((key) => {
          const achievements = groupedAchievements[key as keyof typeof groupedAchievements];
          
          return (
            <TabsContent key={key} value={key} className="mt-4 space-y-3">
              {achievements?.slice(0, 3).map((achievement, index) => (
                <motion.div
                  key={achievement.badge.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AchievementCard achievement={achievement} />
                </motion.div>
              ))}
              
              {achievements && achievements.length > 3 && (
                <button 
                  onClick={() => navigate('/profile?tab=achievements')}
                  className="w-full text-center text-sm text-primary py-2 hover:underline"
                >
                  +{achievements.length - 3} badge lainnya
                </button>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
