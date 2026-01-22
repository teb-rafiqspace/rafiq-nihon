import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface QuizSet {
  id: string;
  title_jp: string;
  title_id: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  track: string | null;
  difficulty: string | null;
  question_count: number | null;
  time_limit_seconds: number | null;
  icon_name: string | null;
  color: string | null;
  xp_reward: number | null;
  order_index: number | null;
  is_daily: boolean | null;
  is_premium: boolean | null;
}

export interface QuizQuestion {
  id: string;
  quiz_set_id: string | null;
  question_type: string;
  question_text: string;
  question_audio_url: string | null;
  question_image_url: string | null;
  options: { id: string; text: string }[] | null;
  correct_answer: string;
  explanation: string | null;
  hint: string | null;
  difficulty: number | null;
  tags: string[] | null;
  order_index: number | null;
}

export interface QuizHistory {
  id: string;
  user_id: string;
  quiz_set_id: string | null;
  score: number;
  total_questions: number;
  time_spent_seconds: number | null;
  xp_earned: number | null;
  answers: Record<string, string> | null;
  completed_at: string | null;
}

export interface DailyProgress {
  id: string;
  user_id: string;
  challenge_date: string;
  completed: boolean | null;
  score: number | null;
  xp_earned: number | null;
  completed_at: string | null;
}

export interface QuizStats {
  attempts: number;
  bestScore: number;
  bestPercentage: number;
  averageScore: number;
  averagePercentage: number;
  lastPlayed: string | null;
}

export function useQuizPractice() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all quiz sets
  const { data: quizSets = [], isLoading: loadingQuizSets } = useQuery({
    queryKey: ['quiz-sets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('practice_quiz_sets')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data as QuizSet[];
    }
  });

  // Fetch user's quiz history
  const { data: quizHistory = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['quiz-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_practice_history')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });
      if (error) throw error;
      return data as QuizHistory[];
    },
    enabled: !!user
  });

  // Fetch today's daily progress
  const { data: dailyProgress, isLoading: loadingDaily } = useQuery({
    queryKey: ['daily-progress', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('user_daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_date', today)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as DailyProgress | null;
    },
    enabled: !!user
  });

  // Calculate streak
  const { data: streak = 0 } = useQuery({
    queryKey: ['quiz-streak', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await supabase
        .from('user_daily_progress')
        .select('challenge_date')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('challenge_date', { ascending: false });
      if (error) throw error;
      
      if (!data || data.length === 0) return 0;
      
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < data.length; i++) {
        const challengeDate = new Date(data[i].challenge_date);
        challengeDate.setHours(0, 0, 0, 0);
        
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (challengeDate.getTime() === expectedDate.getTime()) {
          currentStreak++;
        } else if (i === 0 && challengeDate.getTime() === new Date(today.setDate(today.getDate() - 1)).getTime()) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      return currentStreak;
    },
    enabled: !!user
  });

  // Get stats for a specific quiz
  const getQuizStats = (quizSetId: string): QuizStats => {
    const attempts = quizHistory.filter(h => h.quiz_set_id === quizSetId);
    if (attempts.length === 0) {
      return {
        attempts: 0,
        bestScore: 0,
        bestPercentage: 0,
        averageScore: 0,
        averagePercentage: 0,
        lastPlayed: null
      };
    }

    const scores = attempts.map(a => a.score);
    const percentages = attempts.map(a => (a.score / a.total_questions) * 100);
    
    return {
      attempts: attempts.length,
      bestScore: Math.max(...scores),
      bestPercentage: Math.max(...percentages),
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      averagePercentage: percentages.reduce((a, b) => a + b, 0) / percentages.length,
      lastPlayed: attempts[0]?.completed_at || null
    };
  };

  // Get best percentage for display
  const getBestPercentage = (quizSetId: string): number | null => {
    const stats = getQuizStats(quizSetId);
    return stats.attempts > 0 ? Math.round(stats.bestPercentage) : null;
  };

  // Fetch questions for a quiz
  const fetchQuestions = async (quizSetId: string): Promise<QuizQuestion[]> => {
    const { data, error } = await supabase
      .from('practice_quiz_questions')
      .select('*')
      .eq('quiz_set_id', quizSetId)
      .order('order_index', { ascending: true });
    if (error) throw error;
    return (data || []).map(q => ({
      ...q,
      options: q.options as { id: string; text: string }[] | null
    }));
  };

  // Save quiz result
  const saveResult = useMutation({
    mutationFn: async (params: {
      quizSetId: string;
      score: number;
      totalQuestions: number;
      timeSpent: number;
      answers: Record<string, string>;
      isDaily?: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const xpEarned = params.score;
      const today = new Date().toISOString().split('T')[0];

      // Save to practice history
      const { error: historyError } = await supabase
        .from('user_practice_history')
        .insert({
          user_id: user.id,
          quiz_set_id: params.quizSetId,
          score: params.score,
          total_questions: params.totalQuestions,
          time_spent_seconds: params.timeSpent,
          xp_earned: xpEarned,
          answers: params.answers
        });
      if (historyError) throw historyError;

      // If daily challenge, update daily progress
      if (params.isDaily) {
        const dailyXP = xpEarned + 50; // Add bonus XP
        const { error: dailyError } = await supabase
          .from('user_daily_progress')
          .upsert({
            user_id: user.id,
            challenge_date: today,
            completed: true,
            score: params.score,
            xp_earned: dailyXP,
            completed_at: new Date().toISOString()
          });
        if (dailyError) throw dailyError;
        
        // Add XP to profile
        await supabase
          .from('profiles')
          .update({ total_xp: supabase.rpc ? undefined : undefined })
          .eq('user_id', user.id);
          
        // We'll rely on a DB trigger or manual update for XP
        // For now, just invalidate the profile query
      }

      return { xpEarned: params.isDaily ? xpEarned + 50 : xpEarned };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-history'] });
      queryClient.invalidateQueries({ queryKey: ['daily-progress'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-streak'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  // Get time until daily reset (midnight JST)
  const getTimeUntilReset = (): { hours: number; minutes: number; seconds: number } => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  };

  // Separate regular quiz sets from daily challenge
  const regularQuizSets = useMemo(() => 
    quizSets.filter(q => !q.is_daily), [quizSets]
  );
  
  const dailyChallenge = useMemo(() => 
    quizSets.find(q => q.is_daily), [quizSets]
  );

  return {
    quizSets,
    regularQuizSets,
    dailyChallenge,
    quizHistory,
    dailyProgress,
    streak,
    loadingQuizSets,
    loadingHistory,
    loadingDaily,
    getQuizStats,
    getBestPercentage,
    fetchQuestions,
    saveResult,
    getTimeUntilReset
  };
}
