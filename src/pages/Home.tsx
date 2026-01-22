import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/lib/auth';
import { LeaderboardCard } from '@/components/home/LeaderboardCard';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { SakuraBranch, SakuraPetal } from '@/components/decorative/SakuraPetal';
import { 
  Flame, 
  Zap, 
  Star, 
  Layers, 
  ChevronRight,
  Trophy,
  Award,
  Bot
} from 'lucide-react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'おはようございます';
  if (hour < 15) return 'こんにちは';
  if (hour < 18) return 'こんにちは';
  return 'こんばんは';
}

function getGreetingId() {
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
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
              >
                <SakuraPetal size={20} />
              </motion.div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="pt-safe">
        {/* Header with Sakura Theme */}
        <div className="bg-gradient-hero relative overflow-hidden">
          {/* Sakura Branch Decoration */}
          <div className="absolute top-0 right-0 w-48 opacity-30 pointer-events-none">
            <SakuraBranch />
          </div>
          
          {/* Floating Petals */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ opacity: 0, y: -20, x: Math.random() * 100 }}
                animate={{ 
                  opacity: [0, 0.6, 0],
                  y: [0, 150],
                  x: [0, 30],
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  delay: i * 1.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ left: `${20 + i * 15}%`, top: 0 }}
              >
                <SakuraPetal size={12 + Math.random() * 8} color="rgba(255, 255, 255, 0.5)" />
              </motion.div>
            ))}
          </div>
          
          <div className="container max-w-lg mx-auto px-4 pt-6 pb-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <p className="text-primary-foreground/90 text-sm font-jp">{getGreeting()}</p>
                <p className="text-primary-foreground/70 text-xs">{getGreetingId()}</p>
                <h1 className="text-2xl font-bold text-primary-foreground font-display mt-1">
                  {firstName}さん! 🌸
                </h1>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="bg-primary-foreground/20 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2 border border-primary-foreground/10">
                  <Flame className="h-5 w-5 text-kiniro-300" />
                  <span className="font-bold text-primary-foreground">{profile?.current_streak || 0}</span>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Stats Row with Sakura styling */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-3 mt-6"
            >
              <div className="flex-1 bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-3 text-center border border-primary-foreground/10">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="h-4 w-4 text-kiniro-300" />
                  <span className="text-xs text-primary-foreground/80">XP</span>
                </div>
                <p className="font-bold text-lg text-primary-foreground">{profile?.total_xp?.toLocaleString() || 0}</p>
              </div>
              <div className="flex-1 bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-3 text-center border border-primary-foreground/10">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="h-4 w-4 text-kiniro-200" />
                  <span className="text-xs text-primary-foreground/80">Level</span>
                </div>
                <p className="font-bold text-lg text-primary-foreground">{profile?.current_level || 1}</p>
              </div>
              <div className="flex-1 bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-3 text-center border border-primary-foreground/10">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="h-4 w-4 text-matcha-300" />
                  <span className="text-xs text-primary-foreground/80">Pelajaran</span>
                </div>
                <p className="font-bold text-lg text-primary-foreground">{profile?.lessons_completed || 0}</p>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="container max-w-lg mx-auto px-4 -mt-4 relative">
          {/* Continue Learning Card with Sakura accent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl shadow-elevated p-5 mb-4 relative overflow-hidden"
          >
            {/* Subtle sakura corner decoration */}
            <div className="absolute -top-2 -right-2 opacity-20 pointer-events-none">
              <SakuraPetal size={60} color="hsl(350, 100%, 80%)" />
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg font-display">続きを学ぶ</h2>
              <span className="text-xs text-muted-foreground">Lanjutkan Belajar</span>
            </div>
            
            {/* Kemnaker Track */}
            <button 
              onClick={() => navigate('/learn?track=kemnaker')}
              className="w-full flex items-center gap-4 mb-4 p-3 rounded-xl hover:bg-sakura-50 transition-all -mx-1 group"
            >
              <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center text-xl shadow-sakura group-hover:scale-105 transition-transform">
                🏭
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Kemnaker</p>
                <div className="mt-1.5 h-2.5 bg-sakura-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-primary rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${trackProgress?.kemnaker || 0}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{trackProgress?.kemnaker || 0}% selesai</p>
              </div>
              <ChevronRight className="h-5 w-5 text-sakura-400 group-hover:translate-x-1 transition-transform" />
            </button>
            
            {/* JLPT N5 Track */}
            <button 
              onClick={() => navigate('/learn?track=jlpt_n5')}
              className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-matcha-50 transition-all -mx-1 group"
            >
              <div className="w-12 h-12 bg-gradient-secondary rounded-2xl flex items-center justify-center text-xl shadow-matcha group-hover:scale-105 transition-transform">
                📜
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">JLPT N5</p>
                <div className="mt-1.5 h-2.5 bg-matcha-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-secondary rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${trackProgress?.jlpt || 0}%` }}
                    transition={{ duration: 1, delay: 0.6 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{trackProgress?.jlpt || 0}% selesai</p>
              </div>
              <ChevronRight className="h-5 w-5 text-matcha-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
          
          {/* Quick Actions with Sakura styling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-semibold text-lg font-display">アクション</h2>
              <span className="text-xs text-muted-foreground">Aksi Cepat</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="action"
                className="flex-col h-auto py-4 hover:bg-matcha-50 group"
                onClick={() => navigate('/practice')}
              >
                <div className="w-11 h-11 bg-gradient-secondary rounded-2xl flex items-center justify-center mb-2 shadow-matcha group-hover:scale-110 transition-transform">
                  <Layers className="h-5 w-5 text-secondary-foreground" />
                </div>
                <span className="text-xs font-medium">Latihan</span>
              </Button>
              <Button
                variant="action"
                className="flex-col h-auto py-4 hover:bg-kiniro-50 group"
                onClick={() => navigate('/exam')}
              >
                <div className="w-11 h-11 bg-gradient-kiniro rounded-2xl flex items-center justify-center mb-2 shadow-kiniro group-hover:scale-110 transition-transform">
                  <Award className="h-5 w-5 text-sumi-800" />
                </div>
                <span className="text-xs font-medium">Ujian</span>
              </Button>
              <Button
                variant="action"
                className="flex-col h-auto py-4 hover:bg-sakura-50 group"
                onClick={() => navigate('/chat')}
              >
                <div className="w-11 h-11 bg-gradient-primary rounded-2xl flex items-center justify-center mb-2 shadow-sakura group-hover:scale-110 transition-transform">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-medium">Rafiq Chat</span>
              </Button>
            </div>
          </motion.div>
          
          {/* Daily Challenge with Sakura decorations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-primary rounded-2xl p-5 text-white mb-4 relative overflow-hidden"
          >
            {/* Decorative petals */}
            <div className="absolute top-2 right-8 opacity-30 pointer-events-none">
              <SakuraPetal size={20} color="white" />
            </div>
            <div className="absolute bottom-4 right-4 opacity-20 pointer-events-none rotate-45">
              <SakuraPetal size={30} color="white" />
            </div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <span className="text-2xl">🌸</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold font-display">今日のチャレンジ</h3>
                <p className="text-sm text-white/80">Selesaikan 3 pelajaran</p>
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
