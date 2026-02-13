import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface WritingPrompt {
  id: string;
  track: string;
  task_type: string;
  title: string;
  prompt_text: string;
  instructions: string | null;
  word_limit_min: number;
  word_limit_max: number;
  time_limit_minutes: number;
  model_answer: string | null;
  scoring_criteria: Record<string, any>;
  difficulty: number;
  order_index: number;
  is_premium: boolean;
}

export interface WritingSubmission {
  id: string;
  user_id: string;
  prompt_id: string;
  submission_text: string;
  word_count: number;
  time_spent_seconds: number;
  score: number | null;
  feedback: Record<string, any>;
  status: string;
  created_at: string;
}

export function useWritingPractice(track: string = 'ielts') {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: prompts = [], isLoading: promptsLoading } = useQuery({
    queryKey: ['writing-prompts', track],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('practice_quiz_sets' as any)
        .select('*')
        .eq('track', track)
        .order('order_index');

      if (error) throw error;
      return (data || []) as unknown as WritingPrompt[];
    },
  });

  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ['writing-submissions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_practice_history' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as WritingSubmission[];
    },
    enabled: !!user,
  });

  const submitWriting = useMutation({
    mutationFn: async ({
      promptId,
      text,
      wordCount,
      timeSpent,
    }: {
      promptId: string;
      text: string;
      wordCount: number;
      timeSpent: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_practice_history' as any)
        .insert({
          user_id: user.id,
          prompt_id: promptId,
          submission_text: text,
          word_count: wordCount,
          time_spent_seconds: timeSpent,
          status: 'submitted',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['writing-submissions'] });
    },
  });

  const getSubmissionsForPrompt = (promptId: string) => {
    return submissions.filter(s => s.prompt_id === promptId);
  };

  const getTaskTypeLabel = (taskType: string) => {
    const labels: Record<string, string> = {
      ielts_task1_academic: 'IELTS Task 1 (Academic)',
      ielts_task1_general: 'IELTS Task 1 (General)',
      ielts_task2: 'IELTS Task 2',
      toefl_integrated: 'TOEFL Integrated',
      toefl_independent: 'TOEFL Independent',
    };
    return labels[taskType] || taskType;
  };

  return {
    prompts,
    submissions,
    isLoading: promptsLoading || submissionsLoading,
    submitWriting: submitWriting.mutate,
    isSubmitting: submitWriting.isPending,
    getSubmissionsForPrompt,
    getTaskTypeLabel,
  };
}
