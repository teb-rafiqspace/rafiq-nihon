import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { 
  ArrowLeft, 
  Lock, 
  CheckCircle, 
  PlayCircle, 
  Clock,
  Zap 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChapterDetail() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Fetch chapter details
  const { data: chapter, isLoading: chapterLoading } = useQuery({
    queryKey: ['chapter', chapterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', chapterId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!chapterId,
  });
  
  // Fetch lessons for this chapter
  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons', chapterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('sort_order');
      
      if (error) throw error;
      return data;
    },
    enabled: !!chapterId,
  });
  
  // Fetch user progress for lessons in this chapter
  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', chapterId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('chapter_id', chapterId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!chapterId && !!user?.id,
  });
  
  const isLoading = chapterLoading || lessonsLoading;
  
  // Calculate progress
  const completedLessons = userProgress?.filter(p => p.completed).length || 0;
  const totalLessons = lessons?.length || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  
  // Get lesson status
  const getLessonStatus = (lessonId: string, index: number) => {
    const progress = userProgress?.find(p => p.lesson_id === lessonId);
    
    if (progress?.completed) return 'completed';
    if (progress?.progress_percent && progress.progress_percent > 0) return 'in-progress';
    
    // First lesson is always unlocked, others need previous completion
    if (index === 0) return 'unlocked';
    
    // Check if previous lesson is completed
    const prevLesson = lessons?.[index - 1];
    const prevProgress = userProgress?.find(p => p.lesson_id === prevLesson?.id);
    if (prevProgress?.completed) return 'unlocked';
    
    return 'locked';
  };
  
  if (isLoading) {
    return (
      <AppLayout hideNav>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout hideNav>
      <div className="pt-safe pb-8">
        {/* Header */}
        <div className="bg-gradient-primary">
          <div className="container max-w-lg mx-auto px-4 pt-4 pb-8">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10 mb-4"
              onClick={() => navigate('/learn')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-primary-foreground/80 text-sm mb-1">
                Bab {chapter?.chapter_number}
              </p>
              <h1 className="font-jp text-2xl font-bold text-primary-foreground mb-1">
                {chapter?.title_jp}
              </h1>
              <p className="text-primary-foreground/80">
                {chapter?.title_id}
              </p>
              
              {/* Progress Bar */}
              <div className="mt-4 bg-primary-foreground/20 rounded-full p-1">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      className="h-full bg-primary-foreground rounded-full"
                    />
                  </div>
                  <span className="text-sm font-medium text-primary-foreground">
                    {progressPercent}%
                  </span>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-4 mt-4 text-primary-foreground/80 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>~{totalLessons * 5} menit</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>{completedLessons}/{totalLessons} selesai</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Lessons List */}
        <div className="container max-w-lg mx-auto px-4 -mt-4">
          <div className="bg-card rounded-2xl shadow-elevated overflow-hidden">
            {lessons?.map((lesson, index) => {
              const status = getLessonStatus(lesson.id, index);
              const isLocked = status === 'locked';
              
              return (
                <motion.button
                  key={lesson.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    if (isLocked) return;
                    // Route to JLPT lesson view for JLPT chapters (identified by track)
                    const isJLPT = chapter?.track === 'jlpt_n5';
                    const route = isJLPT ? `/jlpt-lesson/${lesson.id}` : `/lesson/${lesson.id}`;
                    navigate(route);
                  }}
                  disabled={isLocked}
                  className={cn(
                    "w-full p-4 flex items-center gap-4 border-b border-border last:border-b-0 text-left transition-colors",
                    isLocked ? "opacity-50" : "hover:bg-muted/50"
                  )}
                >
                  {/* Status Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    status === 'completed' && "bg-success text-white",
                    status === 'in-progress' && "bg-primary text-white",
                    status === 'unlocked' && "bg-muted border-2 border-primary",
                    status === 'locked' && "bg-muted"
                  )}>
                    {status === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : status === 'in-progress' ? (
                      <PlayCircle className="h-5 w-5" />
                    ) : status === 'locked' ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <span className="font-bold text-primary">{lesson.lesson_number}</span>
                    )}
                  </div>
                  
                  {/* Lesson Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">
                      {lesson.lesson_number}. {lesson.title_id}
                    </h3>
                    <p className="font-jp text-sm text-muted-foreground truncate">
                      {lesson.title_jp}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        status === 'completed' && "bg-success/10 text-success",
                        status === 'in-progress' && "bg-primary/10 text-primary",
                        status === 'unlocked' && "bg-muted text-muted-foreground",
                        status === 'locked' && "bg-muted text-muted-foreground"
                      )}>
                        {status === 'completed' && 'Selesai'}
                        {status === 'in-progress' && 'Dalam Proses'}
                        {status === 'unlocked' && 'Belum Mulai'}
                        {status === 'locked' && 'Terkunci'}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="h-3 w-3" />
                        <span>{lesson.xp_reward} XP</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
            
            {(!lessons || lessons.length === 0) && (
              <div className="p-8 text-center text-muted-foreground">
                <p>Belum ada pelajaran tersedia</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
