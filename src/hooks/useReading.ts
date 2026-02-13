import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface ReadingPassage {
  id: string;
  title_jp: string;
  title_id: string;
  content_jp: string;
  content_reading: string | null;
  jlpt_level: string;
  category: string;
  difficulty: number;
  word_count: number;
  estimated_minutes: number;
  vocabulary_hints: {
    word: string;
    reading: string;
    meaning: string;
  }[];
  is_premium: boolean;
  order_index: number;
}

interface ReadingQuestion {
  id: string;
  passage_id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  order_index: number;
}

interface UserReadingProgress {
  id: string;
  passage_id: string;
  completed: boolean;
  score: number | null;
  time_spent_seconds: number | null;
}

export function useReading(level: string = 'N5') {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isEnglishTrack = level === 'ielts' || level === 'toefl';

  const { data: passages, isLoading: passagesLoading } = useQuery({
    queryKey: ['reading-passages', level],
    queryFn: async () => {
      let query = supabase
        .from('reading_passages')
        .select('*')
        .order('order_index') as any;

      if (isEnglishTrack) {
        query = query.eq('track', level);
      } else {
        query = query.eq('jlpt_level', level);
      }

      const { data, error } = await query as any;

      if (error) throw error;
      return (data || []) as unknown as ReadingPassage[];
    }
  });

  const { data: userProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['reading-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_reading_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return (data || []) as UserReadingProgress[];
    },
    enabled: !!user
  });

  const fetchQuestions = async (passageId: string) => {
    const { data, error } = await supabase
      .from('reading_questions')
      .select('*')
      .eq('passage_id', passageId)
      .order('order_index');
    
    if (error) throw error;
    return (data || []) as ReadingQuestion[];
  };

  const submitProgress = useMutation({
    mutationFn: async ({ 
      passageId, 
      score, 
      answers, 
      timeSpent 
    }: { 
      passageId: string; 
      score: number; 
      answers: Record<string, string>;
      timeSpent: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const existing = userProgress?.find(p => p.passage_id === passageId);
      
      if (existing) {
        const { error } = await supabase
          .from('user_reading_progress')
          .update({
            completed: true,
            score: Math.max(existing.score || 0, score),
            answers,
            time_spent_seconds: timeSpent,
            completed_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_reading_progress')
          .insert({
            user_id: user.id,
            passage_id: passageId,
            completed: true,
            score,
            answers,
            time_spent_seconds: timeSpent,
            completed_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-progress'] });
    }
  });

  const getPassageStatus = (passageId: string) => {
    const progress = userProgress?.find(p => p.passage_id === passageId);
    if (!progress) return 'not_started';
    return progress.completed ? 'completed' : 'in_progress';
  };

  const stats = {
    total: passages?.length || 0,
    completed: userProgress?.filter(p => p.completed).length || 0,
    averageScore: userProgress?.length 
      ? Math.round(userProgress.reduce((sum, p) => sum + (p.score || 0), 0) / userProgress.length)
      : 0
  };

  return {
    passages: passages || [],
    userProgress: userProgress || [],
    isLoading: passagesLoading || progressLoading,
    fetchQuestions,
    submitProgress: submitProgress.mutate,
    getPassageStatus,
    stats
  };
}
