import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { id } from 'date-fns/locale';

interface DailyStats {
  date: string;
  dayName: string;
  xp: number;
  lessonsCompleted: number;
  quizzesTaken: number;
  flashcardsReviewed: number;
  speakingPracticed: number;
  studyMinutes: number;
}

export function useWeeklyProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['weekly-progress', user?.id],
    queryFn: async (): Promise<DailyStats[]> => {
      if (!user) return [];

      const weeklyStats: DailyStats[] = [];
      const today = new Date();

      // Get data for last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayName = format(date, 'EEE', { locale: id });
        const start = startOfDay(date).toISOString();
        const end = endOfDay(date).toISOString();

        // Fetch all data in parallel
        const [
          userProgressResult,
          practiceHistoryResult,
          flashcardSessionsResult,
          speakingSessionsResult,
        ] = await Promise.all([
          // Lessons completed
          supabase
            .from('user_progress')
            .select('xp_earned, completed_at')
            .eq('user_id', user.id)
            .eq('completed', true)
            .gte('completed_at', start)
            .lte('completed_at', end),
          
          // Quiz practice history
          supabase
            .from('user_practice_history')
            .select('xp_earned, time_spent_seconds')
            .eq('user_id', user.id)
            .gte('completed_at', start)
            .lte('completed_at', end),
          
          // Flashcard sessions
          supabase
            .from('flashcard_sessions')
            .select('xp_earned, time_spent_seconds, cards_studied')
            .eq('user_id', user.id)
            .gte('started_at', start)
            .lte('started_at', end),
          
          // Speaking sessions
          supabase
            .from('speaking_sessions')
            .select('xp_earned, duration_seconds, items_practiced')
            .eq('user_id', user.id)
            .gte('started_at', start)
            .lte('started_at', end),
        ]);

        // Calculate totals
        const lessonsXP = userProgressResult.data?.reduce((sum, p) => sum + (p.xp_earned || 0), 0) || 0;
        const quizXP = practiceHistoryResult.data?.reduce((sum, p) => sum + (p.xp_earned || 0), 0) || 0;
        const flashcardXP = flashcardSessionsResult.data?.reduce((sum, s) => sum + (s.xp_earned || 0), 0) || 0;
        const speakingXP = speakingSessionsResult.data?.reduce((sum, s) => sum + (s.xp_earned || 0), 0) || 0;

        const quizTime = practiceHistoryResult.data?.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0) || 0;
        const flashcardTime = flashcardSessionsResult.data?.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0) || 0;
        const speakingTime = speakingSessionsResult.data?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0;

        weeklyStats.push({
          date: dateStr,
          dayName,
          xp: lessonsXP + quizXP + flashcardXP + speakingXP,
          lessonsCompleted: userProgressResult.data?.length || 0,
          quizzesTaken: practiceHistoryResult.data?.length || 0,
          flashcardsReviewed: flashcardSessionsResult.data?.reduce((sum, s) => sum + (s.cards_studied || 0), 0) || 0,
          speakingPracticed: speakingSessionsResult.data?.reduce((sum, s) => sum + (s.items_practiced || 0), 0) || 0,
          studyMinutes: Math.round((quizTime + flashcardTime + speakingTime) / 60),
        });
      }

      return weeklyStats;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useWeeklyStats() {
  const { data: weeklyProgress, isLoading } = useWeeklyProgress();

  const totalXP = weeklyProgress?.reduce((sum, day) => sum + day.xp, 0) || 0;
  const totalMinutes = weeklyProgress?.reduce((sum, day) => sum + day.studyMinutes, 0) || 0;
  const totalLessons = weeklyProgress?.reduce((sum, day) => sum + day.lessonsCompleted, 0) || 0;
  const activeDays = weeklyProgress?.filter(day => day.xp > 0 || day.studyMinutes > 0).length || 0;
  const avgXPPerDay = weeklyProgress?.length ? Math.round(totalXP / weeklyProgress.length) : 0;

  return {
    weeklyProgress,
    isLoading,
    summary: {
      totalXP,
      totalMinutes,
      totalLessons,
      activeDays,
      avgXPPerDay,
    },
  };
}
