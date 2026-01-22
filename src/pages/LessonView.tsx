import { useState, useEffect } from 'react';
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
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type LessonStep = 'content' | 'quiz' | 'complete';

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
  
  // Save progress mutation
  const saveProgressMutation = useMutation({
    mutationFn: async ({ completed, xpEarned }: { completed: boolean; xpEarned: number }) => {
      if (!user?.id || !lessonId || !lesson?.chapter_id) return;
      
      // Check if progress exists
      const { data: existing } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();
      
      if (existing) {
        // Update existing progress
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
        // Create new progress
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
      
      // Update user's total XP
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
  
  const totalVocab = vocabulary?.length || 0;
  const progress = totalVocab > 0 ? Math.round(((vocabIndex + 1) / totalVocab) * 100) : 0;
  
  const handleNextVocab = () => {
    if (vocabIndex < totalVocab - 1) {
      setVocabIndex(prev => prev + 1);
    } else if (quizQuestions && quizQuestions.length > 0) {
      setCurrentStep('quiz');
    } else {
      handleComplete(lesson?.xp_reward || 10);
    }
  };
  
  const handlePrevVocab = () => {
    if (vocabIndex > 0) {
      setVocabIndex(prev => prev - 1);
    }
  };
  
  const handleQuizComplete = (score: number, total: number) => {
    const percentage = total > 0 ? (score / total) : 0;
    const xp = Math.round(percentage * (lesson?.xp_reward || 10));
    
    if (percentage >= 0.6) {
      handleComplete(xp);
    } else {
      // Reset to try again
      setCurrentStep('content');
      setVocabIndex(0);
      toast.error('Coba lagi! Kamu perlu minimal 60% untuk lulus.');
    }
  };
  
  const handleComplete = async (xp: number) => {
    setEarnedXP(xp);
    setCurrentStep('complete');
    
    try {
      await saveProgressMutation.mutateAsync({ completed: true, xpEarned: xp });
      toast.success(`Selamat! Kamu mendapat ${xp} XP!`);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };
  
  if (lessonLoading) {
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
      <div className="pt-safe pb-8 min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="container max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/chapter/${lesson?.chapter_id}`)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${currentStep === 'complete' ? 100 : progress}%` }}
                  />
                </div>
              </div>
              
              <span className="text-sm text-muted-foreground">
                {currentStep === 'quiz' ? 'Kuis' : currentStep === 'complete' ? 'Selesai' : `${vocabIndex + 1}/${totalVocab}`}
              </span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 container max-w-lg mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            {currentStep === 'content' && vocabulary && vocabulary.length > 0 && (
              <motion.div
                key={`vocab-${vocabIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <VocabularyCard
                  wordJp={vocabulary[vocabIndex].word_jp}
                  reading={vocabulary[vocabIndex].reading || undefined}
                  meaningId={vocabulary[vocabIndex].meaning_id}
                  exampleJp={vocabulary[vocabIndex].example_jp || undefined}
                  exampleId={vocabulary[vocabIndex].example_id || undefined}
                  audioUrl={vocabulary[vocabIndex].audio_url || undefined}
                />
              </motion.div>
            )}
            
            {currentStep === 'content' && (!vocabulary || vocabulary.length === 0) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-muted-foreground mb-4">Tidak ada kosakata untuk pelajaran ini</p>
                <Button onClick={() => handleComplete(lesson?.xp_reward || 10)}>
                  Selesaikan Pelajaran
                </Button>
              </motion.div>
            )}
            
            {currentStep === 'quiz' && quizQuestions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <LessonQuiz
                  questions={quizQuestions}
                  xpReward={lesson?.xp_reward || 10}
                  onComplete={handleQuizComplete}
                />
              </motion.div>
            )}
            
            {currentStep === 'complete' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="h-12 w-12 text-success" />
                </motion.div>
                
                <h1 className="text-2xl font-bold mb-2">Pelajaran Selesai! 🎉</h1>
                <p className="text-muted-foreground mb-6">
                  Kamu telah menyelesaikan "{lesson?.title_id}"
                </p>
                
                <div className="flex justify-center items-center gap-2 mb-8">
                  <Zap className="h-6 w-6 text-amber-500" />
                  <span className="text-3xl font-bold text-amber-500">+{earnedXP} XP</span>
                </div>
                
                <div className="space-y-3">
                  <Button
                    size="xl"
                    className="w-full"
                    onClick={() => navigate(`/chapter/${lesson?.chapter_id}`)}
                  >
                    Lanjut ke Pelajaran Berikutnya
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate('/home')}
                  >
                    Kembali ke Beranda
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Bottom Navigation */}
        {currentStep === 'content' && vocabulary && vocabulary.length > 0 && (
          <div className="bg-card border-t border-border">
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
                  className="flex-1"
                  onClick={handleNextVocab}
                >
                  {vocabIndex === totalVocab - 1 
                    ? (quizQuestions && quizQuestions.length > 0 ? 'Mulai Kuis' : 'Selesai')
                    : 'Lanjut'
                  }
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Floating Chat Button */}
        {currentStep === 'content' && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => navigate('/chat')}
            className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-xp rounded-full shadow-lg flex items-center justify-center text-white"
          >
            <Bot className="h-6 w-6" />
          </motion.button>
        )}
      </div>
    </AppLayout>
  );
}
