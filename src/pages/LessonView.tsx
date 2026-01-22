import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { VocabularyCard } from '@/components/learn/VocabularyCard';
import { LessonQuiz } from '@/components/learn/LessonQuiz';
import { useAuth } from '@/lib/auth';
import { 
  ArrowLeft, 
  ArrowRight,
  Bot,
  CheckCircle,
  Zap,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type LessonStep = 'content' | 'quiz-intro' | 'quiz' | 'complete';

interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export default function LessonView() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState<LessonStep>('content');
  const [vocabIndex, setVocabIndex] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [direction, setDirection] = useState(0);
  
  // Fetch lesson details
  const { data: lesson, isLoading: lessonLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*, chapters(*)')
        .eq('id', lessonId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
  });
  
  // Fetch vocabulary for this lesson
  const { data: vocabulary } = useQuery({
    queryKey: ['vocabulary', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('lesson_id', lessonId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
  });
  
  // Fetch quiz questions for this lesson
  const { data: quizQuestions } = useQuery({
    queryKey: ['quiz-questions', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('lesson_id', lessonId);
      
      if (error) throw error;
      
      return data.map(q => ({
        id: q.id,
        questionText: q.question_text,
        options: (q.options as string[]) || [],
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
      })) as QuizQuestion[];
    },
    enabled: !!lessonId,
  });
  
  const totalVocab = vocabulary?.length || 0;
  const progress = totalVocab > 0 ? Math.round(((vocabIndex + 1) / totalVocab) * 100) : 0;
  
  // Save progress mutation
  const saveProgressMutation = useMutation({
    mutationFn: async ({ completed, xpEarned }: { completed: boolean; xpEarned: number }) => {
      if (!user?.id || !lessonId || !lesson?.chapter_id) return;
      
      const { data: existing } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();
      
      if (existing) {
        const { error } = await supabase
          .from('user_progress')
          .update({
            completed,
            progress_percent: completed ? 100 : Math.round(((vocabIndex + 1) / (vocabulary?.length || 1)) * 100),
            xp_earned: xpEarned,
            completed_at: completed ? new Date().toISOString() : null,
          })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            chapter_id: lesson.chapter_id,
            completed,
            progress_percent: completed ? 100 : Math.round(((vocabIndex + 1) / (vocabulary?.length || 1)) * 100),
            xp_earned: xpEarned,
            completed_at: completed ? new Date().toISOString() : null,
          });
        
        if (error) throw error;
      }
      
      if (completed && xpEarned > 0) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('total_xp, lessons_completed')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          await supabase
            .from('profiles')
            .update({
              total_xp: (profile.total_xp || 0) + xpEarned,
              lessons_completed: (profile.lessons_completed || 0) + 1,
            })
            .eq('user_id', user.id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
  
  const handleComplete = useCallback(async (xp: number) => {
    setEarnedXP(xp);
    setCurrentStep('complete');
    
    try {
      await saveProgressMutation.mutateAsync({ completed: true, xpEarned: xp });
      toast.success(`Selamat! Kamu mendapat ${xp} XP!`);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [saveProgressMutation]);
  
  const handleNextVocab = useCallback(() => {
    setDirection(1);
    if (vocabIndex < totalVocab - 1) {
      setVocabIndex(prev => prev + 1);
    } else if (quizQuestions && quizQuestions.length > 0) {
      setCurrentStep('quiz-intro');
    } else {
      handleComplete(lesson?.xp_reward || 10);
    }
  }, [vocabIndex, totalVocab, quizQuestions, lesson?.xp_reward, handleComplete]);
  
  const handlePrevVocab = useCallback(() => {
    setDirection(-1);
    if (vocabIndex > 0) {
      setVocabIndex(prev => prev - 1);
    }
  }, [vocabIndex]);
  
  const goToVocab = useCallback((index: number) => {
    setDirection(index > vocabIndex ? 1 : -1);
    setVocabIndex(index);
  }, [vocabIndex]);
  
  const handleQuizComplete = useCallback((score: number, total: number) => {
    const percentage = total > 0 ? (score / total) : 0;
    const xp = Math.round(percentage * (lesson?.xp_reward || 10));
    
    if (percentage >= 0.6) {
      handleComplete(xp);
    } else {
      setCurrentStep('content');
      setVocabIndex(0);
      toast.error('Coba lagi! Kamu perlu minimal 60% untuk lulus.');
    }
  }, [lesson?.xp_reward, handleComplete]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentStep !== 'content') return;
      if (e.key === 'ArrowRight') handleNextVocab();
      if (e.key === 'ArrowLeft') handlePrevVocab();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, handleNextVocab, handlePrevVocab]);
  
  if (lessonLoading) {
    return (
      <AppLayout hideNav>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }
  
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
  };
  
  return (
    <AppLayout hideNav>
      <div className="pt-safe pb-8 min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
        {/* Header */}
        <div className="bg-card/80 backdrop-blur-lg border-b border-border sticky top-0 z-10">
          <div className="container max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/chapter/${lesson?.chapter_id}`)}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex-1 min-w-0">
                <h1 className="font-jp text-lg font-bold truncate">{lesson?.title_jp}</h1>
                <p className="text-sm text-muted-foreground truncate">{lesson?.title_id}</p>
              </div>
              
              <div className="text-right shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {currentStep === 'quiz' || currentStep === 'quiz-intro' 
                    ? 'Kuis' 
                    : currentStep === 'complete' 
                    ? '✓' 
                    : `${vocabIndex + 1}/${totalVocab}`
                  }
                </span>
                <p className="text-xs text-muted-foreground">kata</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary via-primary to-success rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${currentStep === 'complete' ? 100 : progress}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              />
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 container max-w-lg mx-auto px-4 py-6 flex flex-col">
          <AnimatePresence mode="wait" custom={direction}>
            {/* Vocabulary Content */}
            {currentStep === 'content' && vocabulary && vocabulary.length > 0 && (
              <motion.div
                key={`vocab-${vocabIndex}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex-1"
              >
                <VocabularyCard
                  wordJp={vocabulary[vocabIndex].word_jp}
                  reading={vocabulary[vocabIndex].reading || undefined}
                  meaningId={vocabulary[vocabIndex].meaning_id}
                  exampleJp={vocabulary[vocabIndex].example_jp || undefined}
                  exampleId={vocabulary[vocabIndex].example_id || undefined}
                  audioUrl={vocabulary[vocabIndex].audio_url || undefined}
                />
                
                {/* Dot Indicators */}
                <div className="flex justify-center gap-2 mt-6">
                  {vocabulary.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToVocab(index)}
                      className={cn(
                        "transition-all duration-300 rounded-full",
                        index === vocabIndex 
                          ? "w-8 h-2 bg-primary" 
                          : index < vocabIndex
                          ? "w-2 h-2 bg-primary/50"
                          : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      )}
                      aria-label={`Go to vocabulary ${index + 1}`}
                    />
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* No Vocabulary */}
            {currentStep === 'content' && (!vocabulary || vocabulary.length === 0) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-12"
              >
                <BookOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">Tidak ada kosakata untuk pelajaran ini</p>
                <Button onClick={() => handleComplete(lesson?.xp_reward || 10)}>
                  Selesaikan Pelajaran
                </Button>
              </motion.div>
            )}
            
            {/* Quiz Intro - "Ready for Quiz?" Screen */}
            {currentStep === 'quiz-intro' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg"
                >
                  <Sparkles className="h-12 w-12 text-white" />
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold mb-2"
                >
                  🎉 Bagus!
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground mb-2"
                >
                  Kamu sudah mempelajari {totalVocab} kata baru!
                </motion.p>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg font-semibold text-primary mb-8"
                >
                  Siap untuk kuis?
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="w-full space-y-3"
                >
                  <Button 
                    size="xl" 
                    className="w-full gap-2"
                    onClick={() => setCurrentStep('quiz')}
                  >
                    <Zap className="h-5 w-5" />
                    Mulai Kuis
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      setVocabIndex(0);
                      setCurrentStep('content');
                    }}
                  >
                    Pelajari Ulang
                  </Button>
                </motion.div>
              </motion.div>
            )}
            
            {/* Quiz */}
            {currentStep === 'quiz' && quizQuestions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1"
              >
                <LessonQuiz
                  questions={quizQuestions}
                  xpReward={lesson?.xp_reward || 10}
                  onComplete={handleQuizComplete}
                />
              </motion.div>
            )}
            
            {/* Completion Screen */}
            {currentStep === 'complete' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="relative mb-6"
                >
                  <motion.div
                    className="w-28 h-28 bg-gradient-to-br from-success to-emerald-400 rounded-full flex items-center justify-center shadow-xl"
                    animate={{ 
                      boxShadow: [
                        "0 0 0 0 rgba(34, 197, 94, 0.4)",
                        "0 0 0 20px rgba(34, 197, 94, 0)",
                      ]
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <CheckCircle className="h-14 w-14 text-white" />
                  </motion.div>
                  
                  {/* Confetti-like particles */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-3 h-3 rounded-full"
                      style={{
                        background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'][i % 4],
                        left: '50%',
                        top: '50%',
                      }}
                      initial={{ x: 0, y: 0, scale: 0 }}
                      animate={{ 
                        x: Math.cos(i * Math.PI / 4) * 80,
                        y: Math.sin(i * Math.PI / 4) * 80,
                        scale: [0, 1, 0],
                      }}
                      transition={{ 
                        delay: 0.3 + i * 0.05,
                        duration: 0.8,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl font-bold mb-2"
                >
                  Pelajaran Selesai! 🎉
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-muted-foreground mb-6"
                >
                  Kamu telah menyelesaikan "{lesson?.title_id}"
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl px-8 py-4 mb-8 border border-amber-500/30"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="h-8 w-8 text-amber-500" />
                    <span className="text-4xl font-bold text-amber-500">+{earnedXP}</span>
                    <span className="text-xl text-amber-500/80">XP</span>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="w-full space-y-3"
                >
                  <Button
                    size="xl"
                    className="w-full gap-2"
                    onClick={() => navigate(`/chapter/${lesson?.chapter_id}`)}
                  >
                    Lanjut ke Pelajaran Berikutnya
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate('/home')}
                  >
                    Kembali ke Beranda
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Bottom Navigation */}
        {currentStep === 'content' && vocabulary && vocabulary.length > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="bg-card/80 backdrop-blur-lg border-t border-border"
          >
            <div className="container max-w-lg mx-auto px-4 py-4">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={handlePrevVocab}
                  disabled={vocabIndex === 0}
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Sebelumnya
                </Button>
                <Button
                  size="lg"
                  className={cn(
                    "flex-1 transition-all",
                    vocabIndex === totalVocab - 1 && "bg-gradient-to-r from-primary to-success hover:opacity-90"
                  )}
                  onClick={handleNextVocab}
                >
                  {vocabIndex === totalVocab - 1 
                    ? (quizQuestions && quizQuestions.length > 0 ? 'Selesai ✨' : 'Selesai')
                    : 'Lanjut'
                  }
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Floating Chat Button */}
        {currentStep === 'content' && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => navigate('/chat')}
            className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform"
          >
            <Bot className="h-6 w-6" />
          </motion.button>
        )}
      </div>
    </AppLayout>
  );
}