import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface ListeningItem {
  id: string;
  title_jp: string;
  title_id: string;
  audio_url: string | null;
  transcript_jp: string;
  transcript_reading: string | null;
  transcript_id: string | null;
  jlpt_level: string;
  category: string;
  difficulty: number;
  duration_seconds: number;
  speakers: number;
  is_premium: boolean;
  order_index: number;
}

interface ListeningQuestion {
  id: string;
  listening_id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  order_index: number;
}

interface UserListeningProgress {
  id: string;
  listening_id: string;
  completed: boolean;
  score: number | null;
  play_count: number;
}

export function useListening(level: string = 'N5') {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: listeningItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['listening-items', level],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listening_items')
        .select('*')
        .eq('jlpt_level', level)
        .order('order_index');
      
      if (error) throw error;
      return (data || []) as ListeningItem[];
    }
  });

  const { data: userProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['listening-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_listening_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return (data || []) as UserListeningProgress[];
    },
    enabled: !!user
  });

  const fetchQuestions = async (listeningId: string) => {
    const { data, error } = await supabase
      .from('listening_questions')
      .select('*')
      .eq('listening_id', listeningId)
      .order('order_index');
    
    if (error) throw error;
    return (data || []) as ListeningQuestion[];
  };

  const incrementPlayCount = useMutation({
    mutationFn: async (listeningId: string) => {
      if (!user) return;

      const existing = userProgress?.find(p => p.listening_id === listeningId);
      
      if (existing) {
        const { error } = await supabase
          .from('user_listening_progress')
          .update({
            play_count: existing.play_count + 1
          })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_listening_progress')
          .insert({
            user_id: user.id,
            listening_id: listeningId,
            play_count: 1
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listening-progress'] });
    }
  });

  const submitProgress = useMutation({
    mutationFn: async ({ 
      listeningId, 
      score, 
      answers 
    }: { 
      listeningId: string; 
      score: number; 
      answers: Record<string, string>;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const existing = userProgress?.find(p => p.listening_id === listeningId);
      
      if (existing) {
        const { error } = await supabase
          .from('user_listening_progress')
          .update({
            completed: true,
            score: Math.max(existing.score || 0, score),
            answers,
            completed_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_listening_progress')
          .insert({
            user_id: user.id,
            listening_id: listeningId,
            completed: true,
            score,
            answers,
            completed_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listening-progress'] });
    }
  });

  const getItemStatus = (listeningId: string) => {
    const progress = userProgress?.find(p => p.listening_id === listeningId);
    if (!progress) return 'not_started';
    return progress.completed ? 'completed' : 'in_progress';
  };

  const stats = {
    total: listeningItems?.length || 0,
    completed: userProgress?.filter(p => p.completed).length || 0,
    totalPlays: userProgress?.reduce((sum, p) => sum + p.play_count, 0) || 0
  };

  return {
    listeningItems: listeningItems || [],
    userProgress: userProgress || [],
    isLoading: itemsLoading || progressLoading,
    fetchQuestions,
    incrementPlayCount: incrementPlayCount.mutate,
    submitProgress: submitProgress.mutate,
    getItemStatus,
    stats
  };
}
