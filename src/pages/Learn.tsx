import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Lock, CheckCircle, ChevronRight, BookOpen, Clock, Crown, Headphones, Landmark, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubscription, isPremiumActive } from '@/hooks/useSubscription';
import { PremiumUpgradeModal } from '@/components/subscription/PremiumUpgradeModal';
import {
  type Language,
  type Track,
  LANGUAGES,
  TRACKS,
  getTracksByLanguage,
  isEnglishTrack
} from '@/types/tracks';

export default function Learn() {
  const [searchParams] = useSearchParams();
  const initialLang = (searchParams.get('lang') as Language) || 'japanese';
  const initialTrack = (searchParams.get('track') as Track) || 'kemnaker';
  const [activeLanguage, setActiveLanguage] = useState<Language>(initialLang);
  const [activeTrack, setActiveTrack] = useState<Track>(initialTrack);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const tabsRef = useRef<HTMLDivElement>(null);

  const { data: subscription } = useSubscription();
  const isPremium = isPremiumActive(subscription);

  // Sync track with language - when language changes, select first track of that language
  useEffect(() => {
    const tracksForLang = getTracksByLanguage(activeLanguage);
    const currentTrackBelongsToLang = tracksForLang.some(t => t.id === activeTrack);
    if (!currentTrackBelongsToLang && tracksForLang.length > 0) {
      setActiveTrack(tracksForLang[0].id);
    }
  }, [activeLanguage]);

  const currentTracks = getTracksByLanguage(activeLanguage);
  const isEnglish = isEnglishTrack(activeTrack);

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
    if (index === 0) return false;
    if (chapter.is_free) return false;
    if (isPremium) return false;
    return true;
  };

  const handleChapterClick = (chapter: typeof chapters extends (infer T)[] ? T : never, index: number) => {
    if (isChapterLocked(chapter, index)) {
      setShowPremiumModal(true);
      return;
    }
    navigate(`/chapter/${chapter.id}`);
  };

  // Scroll active tab into view
  useEffect(() => {
    if (tabsRef.current) {
      const activeTabIndex = currentTracks.findIndex(t => t.id === activeTrack);
      const tabs = tabsRef.current.querySelectorAll('button');
      if (tabs[activeTabIndex]) {
        tabs[activeTabIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeTrack, currentTracks]);

  return (
    <AppLayout>
      <div className="pt-safe">
        {/* Header */}
        <div className={isEnglish ? "bg-gradient-to-r from-blue-600 to-indigo-700" : "bg-gradient-secondary"}>
          <div className="container max-w-lg mx-auto px-4 pt-6 pb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className={cn(
                "text-2xl font-bold mb-2",
                isEnglish ? "text-white" : "text-secondary-foreground"
              )}>
                Materi Belajar
              </h1>
              <p className={cn(
                "text-sm",
                isEnglish ? "text-white/80" : "text-secondary-foreground/80"
              )}>
                Pilih jalur belajar yang sesuai tujuanmu
              </p>
            </motion.div>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="container max-w-lg mx-auto px-4 -mt-4">
          <div className="bg-card rounded-2xl shadow-elevated p-1.5 mb-2 flex gap-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all text-center",
                  activeLanguage === lang.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted"
                )}
                onClick={() => setActiveLanguage(lang.id)}
              >
                <span className="mr-1.5">{lang.emoji}</span>
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Track Tabs - Scrollable */}
        <div className="container max-w-lg mx-auto px-4">
          <div
            ref={tabsRef}
            className="bg-card rounded-2xl shadow-card p-1.5 flex gap-1 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {currentTracks.map((track) => (
              <button
                key={track.id}
                className={cn(
                  "flex-shrink-0 py-2.5 px-4 rounded-xl font-medium text-sm transition-all",
                  activeTrack === track.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted"
                )}
                onClick={() => setActiveTrack(track.id)}
              >
                <span className="mr-1.5">{track.emoji}</span>
                {track.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chapters List */}
        <div className="container max-w-lg mx-auto px-4 py-6">
          {/* Track Info Banner */}
          {activeTrack !== 'kemnaker' && (
            <motion.div
              key={`banner-${activeTrack}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-muted/50 rounded-xl border border-border"
            >
              <p className="text-sm text-muted-foreground">
                {activeTrack === 'jlpt_n5' && '\u{1F4CC} Level pemula - cocok untuk yang baru belajar bahasa Jepang'}
                {activeTrack === 'jlpt_n4' && '\u{1F4CC} Level dasar - lanjutan dari N5, fokus pada tata bahasa praktis'}
                {activeTrack === 'jlpt_n3' && '\u{1F4CC} Level menengah - persiapan untuk bekerja di Jepang'}
                {activeTrack === 'jlpt_n2' && '\u{1F4CC} Level lanjutan - penguasaan ekspresi formal dan bacaan kompleks'}
                {activeTrack === 'ielts' && '\u{1F4CC} Persiapan IELTS Academic - target Band 5.0 hingga 7.5'}
                {activeTrack === 'toefl' && '\u{1F4CC} Persiapan TOEFL iBT - target skor 80 hingga 110'}
              </p>
            </motion.div>
          )}

          {/* Kana Learning Section for JLPT N5 */}
          {(activeTrack === 'jlpt_n5') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h2 className="font-semibold text-lg mb-3">{'\u{270D}\u{FE0F}'} Dasar Huruf Jepang</h2>
              <button
                onClick={() => navigate('/kana')}
                className="w-full bg-muted/30 rounded-2xl p-4 text-left border border-border hover:border-primary/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center text-2xl font-jp text-white font-bold">
                    {'\u3042'}
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

          {/* Additional Content Modules for JLPT N5 */}
          {(activeTrack === 'jlpt_n5') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 grid grid-cols-2 gap-3"
            >
              <button
                onClick={() => navigate('/kanji')}
                className="bg-card rounded-xl p-4 text-left border border-border hover:border-primary/50 transition-all shadow-card"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-indigo flex items-center justify-center text-white font-jp text-xl font-bold mb-2">
                  {'\u6F22'}
                </div>
                <h4 className="font-semibold text-sm">Kanji</h4>
                <p className="text-xs text-muted-foreground">103 karakter N5</p>
              </button>

              <button
                onClick={() => navigate('/reading')}
                className="bg-card rounded-xl p-4 text-left border border-border hover:border-secondary/50 transition-all shadow-card"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-secondary flex items-center justify-center text-white mb-2">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-sm">Membaca</h4>
                <p className="text-xs text-muted-foreground">Latihan dokkai</p>
              </button>

              <button
                onClick={() => navigate('/listening')}
                className="bg-card rounded-xl p-4 text-left border border-border hover:border-accent/50 transition-all shadow-card"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-success flex items-center justify-center text-white mb-2">
                  <Headphones className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-sm">Mendengar</h4>
                <p className="text-xs text-muted-foreground">Latihan choukai</p>
              </button>

              <button
                onClick={() => navigate('/cultural-tips')}
                className="bg-card rounded-xl p-4 text-left border border-border hover:border-primary/50 transition-all shadow-card"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-streak flex items-center justify-center text-white mb-2">
                  <Landmark className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-sm">Budaya</h4>
                <p className="text-xs text-muted-foreground">Tips & etika</p>
              </button>
            </motion.div>
          )}

          {/* English Track Quick Access Modules */}
          {isEnglish && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 grid grid-cols-2 gap-3"
            >
              <button
                onClick={() => navigate('/reading?tab=english')}
                className="bg-card rounded-xl p-4 text-left border border-border hover:border-secondary/50 transition-all shadow-card"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-secondary flex items-center justify-center text-white mb-2">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-sm">Reading</h4>
                <p className="text-xs text-muted-foreground">Practice passages</p>
              </button>

              <button
                onClick={() => navigate('/listening?tab=english')}
                className="bg-card rounded-xl p-4 text-left border border-border hover:border-accent/50 transition-all shadow-card"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-success flex items-center justify-center text-white mb-2">
                  <Headphones className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-sm">Listening</h4>
                <p className="text-xs text-muted-foreground">Audio practice</p>
              </button>

              <button
                onClick={() => navigate('/writing')}
                className="bg-card rounded-xl p-4 text-left border border-border hover:border-primary/50 transition-all shadow-card"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center text-white mb-2">
                  <PenTool className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-sm">Writing</h4>
                <p className="text-xs text-muted-foreground">Essay practice</p>
              </button>

              <button
                onClick={() => navigate('/speaking')}
                className="bg-card rounded-xl p-4 text-left border border-border hover:border-purple-500/50 transition-all shadow-card"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white mb-2">
                  <Headphones className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-sm">Speaking</h4>
                <p className="text-xs text-muted-foreground">Oral practice</p>
              </button>
            </motion.div>
          )}

          {/* Chapter Title */}
          {activeTrack !== 'kemnaker' && (
            <h2 className="font-semibold text-lg mb-3">{'\u{1F4DA}'} Bab Pembelajaran</h2>
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
                          !isLocked && !isCompleted && (isEnglish ? "bg-gradient-to-r from-blue-600 to-indigo-700" : "bg-gradient-primary")
                        )}>
                          {isLocked ? (
                            <Lock className="h-6 w-6 text-muted-foreground" />
                          ) : isCompleted ? (
                            <CheckCircle className="h-6 w-6 text-white" />
                          ) : (
                            <span className="text-white font-bold">{chapter.chapter_number}</span>
                          )}
                        </div>

                        {/* Chapter Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs text-muted-foreground">
                              {isEnglish ? `Chapter ${chapter.chapter_number}` : `Bab ${chapter.chapter_number}`}
                            </span>
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
                          <h3 className={cn(
                            "font-semibold text-lg leading-tight mb-0.5",
                            !isEnglish && "font-jp"
                          )}>
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
                                  isCompleted ? "bg-success" : (isEnglish ? "bg-gradient-to-r from-blue-600 to-indigo-700" : "bg-gradient-primary")
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
                              <span>{chapter.lesson_count} {isEnglish ? 'Lessons' : 'Pelajaran'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{estimatedMinutes} {isEnglish ? 'min' : 'menit'}</span>
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
                <span className="text-2xl">{'\u{1F451}'}</span>
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
