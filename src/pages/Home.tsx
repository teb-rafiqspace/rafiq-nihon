import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/lib/auth';
import { 
  Flame, 
  Zap, 
  Star, 
  BookOpen, 
  Layers, 
  Bot, 
  ChevronRight,
  Trophy,
  Target
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
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">Lanjutkan Belajar</h2>
              <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
                {profile?.learning_goal === 'kemnaker' ? 'Kemnaker' : profile?.learning_goal === 'jlpt' ? 'JLPT N5' : 'Umum'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center text-2xl">
                🎌
              </div>
              <div className="flex-1">
                <p className="font-jp font-medium">はじめまして</p>
                <p className="text-sm text-muted-foreground">Perkenalan Diri</p>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-primary w-1/4 rounded-full" />
                </div>
              </div>
              <Button size="icon" onClick={() => navigate('/learn')}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
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
                onClick={() => navigate('/practice')}
              >
                <div className="w-10 h-10 bg-gradient-secondary rounded-xl flex items-center justify-center mb-2">
                  <Layers className="h-5 w-5 text-secondary-foreground" />
                </div>
                <span className="text-xs">Flashcard</span>
              </Button>
              <Button
                variant="action"
                className="flex-col h-auto py-4"
                onClick={() => navigate('/practice')}
              >
                <div className="w-10 h-10 bg-gradient-success rounded-xl flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-success-foreground" />
                </div>
                <span className="text-xs">Kuis</span>
              </Button>
              <Button
                variant="action"
                className="flex-col h-auto py-4"
                onClick={() => navigate('/chat')}
              >
                <div className="w-10 h-10 bg-gradient-xp rounded-xl flex items-center justify-center mb-2">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs">Chat Rafiq</span>
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
          
          {/* Explore Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">Jelajahi Materi</h2>
              <Button variant="link" onClick={() => navigate('/learn')} className="text-primary">
                Lihat Semua
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/learn')}
                className="bg-card rounded-xl p-4 text-left shadow-card hover:shadow-elevated transition-shadow border border-border"
              >
                <div className="text-3xl mb-2">🏭</div>
                <p className="font-semibold">Kemnaker</p>
                <p className="text-xs text-muted-foreground">4 Bab</p>
              </button>
              <button
                onClick={() => navigate('/learn')}
                className="bg-card rounded-xl p-4 text-left shadow-card hover:shadow-elevated transition-shadow border border-border"
              >
                <div className="text-3xl mb-2">📜</div>
                <p className="font-semibold">JLPT N5</p>
                <p className="text-xs text-muted-foreground">4 Bab</p>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
