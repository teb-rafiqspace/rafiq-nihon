import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Lock, CheckCircle, ChevronRight, BookOpen, Clock, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubscription, isPremiumActive } from '@/hooks/useSubscription';
import { PremiumUpgradeModal } from '@/components/subscription/PremiumUpgradeModal';

type Track = 'kemnaker' | 'jlpt_n5';

export default function Learn() {
  const [searchParams] = useSearchParams();
  const initialTrack = (searchParams.get('track') as Track) || 'kemnaker';
  const [activeTrack, setActiveTrack] = useState<Track>(initialTrack);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: subscription } = useSubscription();
  const isPremium = isPremiumActive(subscription);
  
  const { data: chapters, isLoading } = useQuery({
    queryKey: ['chapters', activeTrack],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('track', activeTrack)
        .order('sort_order');
      
      if (error) throw error;
      return data;
    },
  });
  
  // Fetch user progress for all chapters
  const { data: userProgress } = useQuery({
    queryKey: ['user-chapter-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_progress')
        .select('chapter_id, lesson_id, completed')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
  
  // Calculate chapter progress
  const getChapterProgress = (chapterId: string, lessonCount: number) => {
    if (!userProgress || lessonCount === 0) return 0;
    
    const completedLessons = userProgress.filter(
      p => p.chapter_id === chapterId && p.completed
    ).length;
    
    return Math.round((completedLessons / lessonCount) * 100);
  };
  
  // Check if chapter is locked (premium gate)
  const isChapterLocked = (chapter: typeof chapters extends (infer T)[] ? T : never, index: number) => {
    // First chapter is always free
    if (index === 0) return false;
    // If chapter is marked as free
    if (chapter.is_free) return false;
    // Premium users have access to all
    if (isPremium) return false;
    // Free users can only access free chapters
    return true;
  };
  
  const handleChapterClick = (chapter: typeof chapters extends (infer T)[] ? T : never, index: number) => {
    if (isChapterLocked(chapter, index)) {
      setShowPremiumModal(true);
      return;
    }
    navigate(`/chapter/${chapter.id}`);
  };
  
  return (
    <AppLayout>
      <div className="pt-safe">
        {/* Header */}
        <div className="bg-gradient-secondary">
          <div className="container max-w-lg mx-auto px-4 pt-6 pb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl font-bold text-secondary-foreground mb-2">
                Materi Belajar
              </h1>
              <p className="text-secondary-foreground/80 text-sm">
                Pilih jalur belajar yang sesuai tujuanmu
              </p>
            </motion.div>
          </div>
        </div>
        
        {/* Track Tabs */}
        <div className="container max-w-lg mx-auto px-4 -mt-4">
          <div className="bg-card rounded-2xl shadow-elevated p-1 flex relative">
            {/* Animated Indicator */}
            <motion.div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-xl"
              animate={{ x: activeTrack === 'kemnaker' ? 0 : 'calc(100% + 4px)' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            
            <button
              className={cn(
                "flex-1 py-3 px-4 rounded-xl font-medium text-sm relative z-10 transition-colors",
                activeTrack === 'kemnaker' ? "text-primary-foreground" : "text-muted-foreground"
              )}
              onClick={() => setActiveTrack('kemnaker')}
            >
              🏭 Kemnaker
            </button>
            <button
              className={cn(
                "flex-1 py-3 px-4 rounded-xl font-medium text-sm relative z-10 transition-colors",
                activeTrack === 'jlpt_n5' ? "text-primary-foreground" : "text-muted-foreground"
              )}
              onClick={() => setActiveTrack('jlpt_n5')}
            >
              📜 JLPT N5
            </button>
          </div>
        </div>
        
        {/* Chapters List */}
        <div className="container max-w-lg mx-auto px-4 py-6">
          {/* Kana Learning Section for JLPT N5 */}
          {activeTrack === 'jlpt_n5' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h2 className="font-semibold text-lg mb-3">📝 Dasar Huruf Jepang</h2>
              <button
                onClick={() => navigate('/kana')}
                className="w-full bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-950/30 dark:to-red-950/30 rounded-2xl p-4 text-left border border-pink-200 dark:border-pink-800 hover:border-primary/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center text-2xl font-jp text-white font-bold">
                    あ
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Hiragana & Katakana</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Pelajari 92 karakter dasar bahasa Jepang
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Interaktif
                      </span>
                      <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                        Audio
                      </span>
                      <span className="bg-success/10 text-success px-2 py-0.5 rounded-full">
                        Kuis
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground mt-4" />
                </div>
              </button>
            </motion.div>
          )}
          
          {/* Chapter Title */}
          {activeTrack === 'jlpt_n5' && (
            <h2 className="font-semibold text-lg mb-3">📚 Bab Pembelajaran</h2>
          )}
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTrack}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl p-4 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-muted rounded-xl" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-3 bg-muted rounded w-1/2 mb-3" />
                        <div className="h-2 bg-muted rounded w-full" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                chapters?.map((chapter, index) => {
                  const isLocked = isChapterLocked(chapter, index);
                  const progress = getChapterProgress(chapter.id, chapter.lesson_count || 0);
                  const isCompleted = progress === 100;
                  const estimatedMinutes = (chapter.lesson_count || 0) * 5;
                  
                  return (
                    <motion.button
                      key={chapter.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleChapterClick(chapter, index)}
                      className={cn(
                        "w-full bg-card rounded-2xl p-4 text-left shadow-card hover:shadow-elevated transition-all border border-border",
                        isLocked && "opacity-60 cursor-not-allowed",
                        isCompleted && "border-success/50 bg-success/5"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        {/* Chapter Icon */}
                        <div className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0",
                          isLocked && "bg-muted",
                          isCompleted && "bg-success",
                          !isLocked && !isCompleted && "bg-gradient-primary"
                        )}>
                          {isLocked ? (
                            <Lock className="h-6 w-6 text-muted-foreground" />
                          ) : isCompleted ? (
                            <CheckCircle className="h-6 w-6 text-white" />
                          ) : (
                            <span className="text-primary-foreground font-bold">{chapter.chapter_number}</span>
                          )}
                        </div>
                        
                        {/* Chapter Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs text-muted-foreground">Bab {chapter.chapter_number}</span>
                            {isCompleted && (
                              <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                                Selesai
                              </span>
                            )}
                            {isLocked && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Crown className="h-3 w-3" />
                                Premium
                              </span>
                            )}
                          </div>
                          <h3 className="font-jp font-semibold text-lg leading-tight mb-0.5">
                            {chapter.title_jp}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {chapter.title_id}
                          </p>
                          
                          {/* Progress Bar */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div 
                                className={cn(
                                  "h-full rounded-full",
                                  isCompleted ? "bg-success" : "bg-gradient-primary"
                                )}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                              />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground w-10">
                              {progress}%
                            </span>
                          </div>
                          
                          {/* Meta Info */}
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              <span>{chapter.lesson_count} Pelajaran</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{estimatedMinutes} menit</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Arrow */}
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-4" />
                      </div>
                    </motion.button>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Premium Upsell */}
          {!isPremium && chapters && chapters.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">👑</span>
                <div className="flex-1">
                  <p className="font-semibold text-amber-900">Buka Semua Materi</p>
                  <p className="text-sm text-amber-700">Upgrade ke Premium untuk akses penuh</p>
                </div>
                <Button variant="premium" size="sm" onClick={() => setShowPremiumModal(true)}>
                  Upgrade
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Premium Modal */}
      <PremiumUpgradeModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)} 
      />
    </AppLayout>
  );
}
