import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Lock, CheckCircle, ChevronRight, BookOpen } from 'lucide-react';

type Track = 'kemnaker' | 'jlpt_n5';

export default function Learn() {
  const [activeTrack, setActiveTrack] = useState<Track>('kemnaker');
  const { data: profile } = useProfile();
  
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
          <div className="bg-card rounded-2xl shadow-elevated p-1.5 flex gap-1">
            <Button
              variant="tab"
              data-active={activeTrack === 'kemnaker'}
              className="flex-1"
              onClick={() => setActiveTrack('kemnaker')}
            >
              🏭 Kemnaker
            </Button>
            <Button
              variant="tab"
              data-active={activeTrack === 'jlpt_n5'}
              className="flex-1"
              onClick={() => setActiveTrack('jlpt_n5')}
            >
              📜 JLPT N5
            </Button>
          </div>
        </div>
        
        {/* Chapters List */}
        <div className="container max-w-lg mx-auto px-4 py-6">
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
                  <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-muted rounded-xl" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                chapters?.map((chapter, index) => {
                  const isLocked = !chapter.is_free && index > 0;
                  const progress: number = index === 0 ? 25 : 0;
                  
                  return (
                    <motion.button
                      key={chapter.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`w-full bg-card rounded-xl p-4 text-left shadow-card hover:shadow-elevated transition-all border border-border ${
                        isLocked ? 'opacity-60' : ''
                      }`}
                      disabled={isLocked}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                          isLocked ? 'bg-muted' : 'bg-gradient-primary'
                        }`}>
                          {isLocked ? (
                            <Lock className="h-6 w-6 text-muted-foreground" />
                          ) : (
                            <span className="text-primary-foreground font-bold">{chapter.chapter_number}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-jp font-semibold truncate">{chapter.title_jp}</h3>
                            {progress === 100 && (
                              <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{chapter.title_id}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-primary rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{progress}%</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                            <BookOpen className="h-3 w-3" />
                            <span>{chapter.lesson_count}</span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Premium Upsell */}
          {chapters && chapters.length > 1 && (
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
                <Button variant="premium" size="sm">
                  Upgrade
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
