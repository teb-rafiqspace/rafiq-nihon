import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/lib/auth';
import { LeaderboardCard } from '@/components/home/LeaderboardCard';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  Flame, 
  Zap, 
  Star, 
  Layers, 
  ChevronRight,
  Trophy,
  Target,
  FileText
} from 'lucide-react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

export default function Home() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();
  const { user } = useAuth();
  
  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Pelajar';

  // Fetch track progress
  const { data: trackProgress } = useQuery({
    queryKey: ['track-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return { kemnaker: 0, jlpt: 0 };
      
      // Get all chapters with their lesson counts
      const { data: chapters } = await supabase
        .from('chapters')
        .select('id, track, lesson_count');
      
      // Get user's completed lessons
      const { data: progress } = await supabase
        .from('user_progress')
        .select('lesson_id, completed, chapter_id')
        .eq('user_id', user.id)
        .eq('completed', true);
      
      if (!chapters) return { kemnaker: 0, jlpt: 0 };
      
      const kemnakerChapters = chapters.filter(c => c.track === 'kemnaker');
      const jlptChapters = chapters.filter(c => c.track === 'jlpt_n5');
      
      const kemnakerTotal = kemnakerChapters.reduce((sum, c) => sum + (c.lesson_count || 0), 0);
      const jlptTotal = jlptChapters.reduce((sum, c) => sum + (c.lesson_count || 0), 0);
      
      const kemnakerChapterIds = new Set(kemnakerChapters.map(c => c.id));
      const jlptChapterIds = new Set(jlptChapters.map(c => c.id));
      
      const kemnakerCompleted = progress?.filter(p => p.chapter_id && kemnakerChapterIds.has(p.chapter_id)).length || 0;
      const jlptCompleted = progress?.filter(p => p.chapter_id && jlptChapterIds.has(p.chapter_id)).length || 0;
      
      return {
        kemnaker: kemnakerTotal > 0 ? Math.round((kemnakerCompleted / kemnakerTotal) * 100) : 0,
        jlpt: jlptTotal > 0 ? Math.round((jlptCompleted / jlptTotal) * 100) : 0
      };
    },
    enabled: !!user?.id
  });
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="pt-safe">
        {/* Header */}
        <div className="bg-gradient-primary">
          <div className="container max-w-lg mx-auto px-4 pt-6 pb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <p className="text-primary-foreground/80 text-sm">{getGreeting()}</p>
                <h1 className="text-2xl font-bold text-primary-foreground">
                  {firstName}! 👋
                </h1>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="bg-primary-foreground/20 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-300" />
                  <span className="font-bold text-primary-foreground">{profile?.current_streak || 0}</span>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-4 mt-6"
            >
              <div className="flex-1 bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="h-4 w-4 text-yellow-300" />
                  <span className="text-xs text-primary-foreground/80">XP</span>
                </div>
                <p className="font-bold text-lg text-primary-foreground">{profile?.total_xp || 0}</p>
              </div>
              <div className="flex-1 bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="h-4 w-4 text-blue-300" />
                  <span className="text-xs text-primary-foreground/80">Level</span>
                </div>
                <p className="font-bold text-lg text-primary-foreground">{profile?.current_level || 1}</p>
              </div>
              <div className="flex-1 bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="h-4 w-4 text-green-300" />
                  <span className="text-xs text-primary-foreground/80">Pelajaran</span>
                </div>
                <p className="font-bold text-lg text-primary-foreground">{profile?.lessons_completed || 0}</p>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="container max-w-lg mx-auto px-4 -mt-4">
          {/* Continue Learning Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl shadow-elevated p-5 mb-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Lanjutkan Belajar</h2>
            </div>
            
            {/* Kemnaker Track */}
            <button 
              onClick={() => navigate('/learn?track=kemnaker')}
              className="w-full flex items-center gap-4 mb-4 p-3 rounded-xl hover:bg-muted/50 transition-colors -mx-1"
            >
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-xl">
                🏭
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Kemnaker</p>
                <div className="mt-1.5 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-primary rounded-full transition-all duration-500" 
                    style={{ width: `${trackProgress?.kemnaker || 0}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{trackProgress?.kemnaker || 0}% selesai</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
            
            {/* JLPT N5 Track */}
            <button 
              onClick={() => navigate('/learn?track=jlpt_n5')}
              className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors -mx-1"
            >
              <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center text-xl">
                📜
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">JLPT N5</p>
                <div className="mt-1.5 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-secondary rounded-full transition-all duration-500" 
                    style={{ width: `${trackProgress?.jlpt || 0}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{trackProgress?.jlpt || 0}% selesai</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </motion.div>
          
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-4"
          >
            <h2 className="font-semibold text-lg mb-3">Aksi Cepat</h2>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="action"
                className="flex-col h-auto py-4"
                onClick={() => navigate('/practice?tab=flashcard')}
              >
                <div className="w-10 h-10 bg-gradient-secondary rounded-xl flex items-center justify-center mb-2">
                  <Layers className="h-5 w-5 text-secondary-foreground" />
                </div>
                <span className="text-xs">Flashcard</span>
              </Button>
              <Button
                variant="action"
                className="flex-col h-auto py-4"
                onClick={() => navigate('/practice?tab=quiz')}
              >
                <div className="w-10 h-10 bg-gradient-success rounded-xl flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-success-foreground" />
                </div>
                <span className="text-xs">Kuis</span>
              </Button>
              <Button
                variant="action"
                className="flex-col h-auto py-4"
                onClick={() => navigate('/practice?tab=test')}
              >
                <div className="w-10 h-10 bg-gradient-xp rounded-xl flex items-center justify-center mb-2">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs">Tes</span>
              </Button>
            </div>
          </motion.div>
          
          {/* Daily Challenge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-streak rounded-2xl p-5 text-white mb-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Flame className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">Tantangan Harian</h3>
                <p className="text-sm text-white/80">Selesaikan 3 pelajaran hari ini</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">0/3</p>
                <p className="text-xs text-white/80">+50 XP</p>
              </div>
            </div>
          </motion.div>
          
          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-4"
          >
            <LeaderboardCard />
          </motion.div>
          
        </div>
      </div>
    </AppLayout>
  );
}
