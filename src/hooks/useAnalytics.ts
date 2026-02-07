import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { format, subDays, subMonths, startOfDay, endOfDay, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

// Types
export interface DailyActivity {
  date: string;
  intensity: number; // 0-4 scale for heatmap
  xp: number;
  minutesStudied: number;
  itemsStudied: number;
}

export interface WeaknessItem {
  id: string;
  title: string;
  titleJp: string;
  type: 'quiz' | 'flashcard' | 'speaking';
  category: string;
  score: number;
  attempts: number;
  lastAttempt: string | null;
  recommendation: string;
}

export interface StudyTimeDistribution {
  category: string;
  label: string;
  minutes: number;
  percentage: number;
  color: string;
}

export interface AnalyticsSummary {
  totalStudyTime: number;
  averageDailyTime: number;
  totalXP: number;
  totalLessonsCompleted: number;
  totalQuizzesTaken: number;
  totalFlashcardsReviewed: number;
  totalSpeakingPracticed: number;
  currentStreak: number;
  longestStreak: number;
  activeDaysThisMonth: number;
  masteryRate: number;
  averageQuizScore: number;
}

export interface MonthlyTrend {
  month: string;
  xp: number;
  studyMinutes: number;
  itemsCompleted: number;
}

// Hook for activity heatmap data (last 90 days)
export function useActivityHeatmap() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['activity-heatmap', user?.id],
    queryFn: async (): Promise<DailyActivity[]> => {
      if (!user) return [];

      const endDate = new Date();
      const startDate = subDays(endDate, 89); // 90 days including today
      
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      const activities: DailyActivity[] = [];

      // Fetch all progress data in bulk
      const [userProgress, practiceHistory, flashcardSessions, speakingSessions] = await Promise.all([
        supabase
          .from('user_progress')
          .select('xp_earned, completed_at')
          .eq('user_id', user.id)
          .eq('completed', true)
          .gte('completed_at', startOfDay(startDate).toISOString())
          .lte('completed_at', endOfDay(endDate).toISOString()),
        supabase
          .from('user_practice_history')
          .select('xp_earned, time_spent_seconds, completed_at')
          .eq('user_id', user.id)
          .gte('completed_at', startOfDay(startDate).toISOString())
          .lte('completed_at', endOfDay(endDate).toISOString()),
        supabase
          .from('flashcard_sessions')
          .select('xp_earned, time_spent_seconds, cards_studied, started_at')
          .eq('user_id', user.id)
          .gte('started_at', startOfDay(startDate).toISOString())
          .lte('started_at', endOfDay(endDate).toISOString()),
        supabase
          .from('speaking_sessions')
          .select('xp_earned, duration_seconds, items_practiced, started_at')
          .eq('user_id', user.id)
          .gte('started_at', startOfDay(startDate).toISOString())
          .lte('started_at', endOfDay(endDate).toISOString())
      ]);

      // Process each day
      for (const day of days) {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayStart = startOfDay(day).toISOString();
        const dayEnd = endOfDay(day).toISOString();

        // Filter data for this day
        const dayProgress = userProgress.data?.filter(
          p => p.completed_at && p.completed_at >= dayStart && p.completed_at <= dayEnd
        ) || [];
        const dayPractice = practiceHistory.data?.filter(
          p => p.completed_at && p.completed_at >= dayStart && p.completed_at <= dayEnd
        ) || [];
        const dayFlashcard = flashcardSessions.data?.filter(
          f => f.started_at && f.started_at >= dayStart && f.started_at <= dayEnd
        ) || [];
        const daySpeaking = speakingSessions.data?.filter(
          s => s.started_at && s.started_at >= dayStart && s.started_at <= dayEnd
        ) || [];

        // Calculate totals
        const xp = 
          dayProgress.reduce((sum, p) => sum + (p.xp_earned || 0), 0) +
          dayPractice.reduce((sum, p) => sum + (p.xp_earned || 0), 0) +
          dayFlashcard.reduce((sum, f) => sum + (f.xp_earned || 0), 0) +
          daySpeaking.reduce((sum, s) => sum + (s.xp_earned || 0), 0);

        const minutesStudied = Math.round((
          dayPractice.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0) +
          dayFlashcard.reduce((sum, f) => sum + (f.time_spent_seconds || 0), 0) +
          daySpeaking.reduce((sum, s) => sum + (s.duration_seconds || 0), 0)
        ) / 60);

        const itemsStudied = 
          dayProgress.length +
          dayPractice.length +
          dayFlashcard.reduce((sum, f) => sum + (f.cards_studied || 0), 0) +
          daySpeaking.reduce((sum, s) => sum + (s.items_practiced || 0), 0);

        // Calculate intensity (0-4 scale based on activity)
        let intensity = 0;
        if (xp > 0 || minutesStudied > 0) {
          if (xp >= 100 || minutesStudied >= 30) intensity = 4;
          else if (xp >= 50 || minutesStudied >= 20) intensity = 3;
          else if (xp >= 25 || minutesStudied >= 10) intensity = 2;
          else intensity = 1;
        }

        activities.push({
          date: dateStr,
          intensity,
          xp,
          minutesStudied,
          itemsStudied
        });
      }

      return activities;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000
  });
}

// Hook for study time distribution
export function useStudyTimeDistribution() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['study-time-distribution', user?.id],
    queryFn: async (): Promise<StudyTimeDistribution[]> => {
      if (!user) return [];

      // Get all-time study data
      const [practiceHistory, flashcardSessions, speakingSessions, userProgress] = await Promise.all([
        supabase
          .from('user_practice_history')
          .select('time_spent_seconds')
          .eq('user_id', user.id),
        supabase
          .from('flashcard_sessions')
          .select('time_spent_seconds')
          .eq('user_id', user.id),
        supabase
          .from('speaking_sessions')
          .select('duration_seconds')
          .eq('user_id', user.id),
        supabase
          .from('user_progress')
          .select('completed_at')
          .eq('user_id', user.id)
          .eq('completed', true)
      ]);

      const quizMinutes = Math.round((practiceHistory.data?.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0) || 0) / 60);
      const flashcardMinutes = Math.round((flashcardSessions.data?.reduce((sum, f) => sum + (f.time_spent_seconds || 0), 0) || 0) / 60);
      const speakingMinutes = Math.round((speakingSessions.data?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0) / 60);
      
      // Estimate lesson time (5 min per completed lesson)
      const lessonMinutes = (userProgress.data?.length || 0) * 5;

      const total = quizMinutes + flashcardMinutes + speakingMinutes + lessonMinutes || 1;

      return [
        {
          category: 'lessons',
          label: 'Pelajaran',
          minutes: lessonMinutes,
          percentage: Math.round((lessonMinutes / total) * 100),
          color: 'hsl(var(--chart-1))'
        },
        {
          category: 'quiz',
          label: 'Kuis',
          minutes: quizMinutes,
          percentage: Math.round((quizMinutes / total) * 100),
          color: 'hsl(var(--chart-2))'
        },
        {
          category: 'flashcard',
          label: 'Flashcard',
          minutes: flashcardMinutes,
          percentage: Math.round((flashcardMinutes / total) * 100),
          color: 'hsl(var(--chart-3))'
        },
        {
          category: 'speaking',
          label: 'Speaking',
          minutes: speakingMinutes,
          percentage: Math.round((speakingMinutes / total) * 100),
          color: 'hsl(var(--chart-4))'
        }
      ];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000
  });
}

// Hook for weakness analysis
export function useWeaknessAnalysis() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['weakness-analysis', user?.id],
    queryFn: async (): Promise<WeaknessItem[]> => {
      if (!user) return [];

      // Get quiz sets and user history
      const [quizSets, quizHistory, flashcardDecks, flashcardProgress, speakingLessons, speakingSessions] = await Promise.all([
        supabase.from('practice_quiz_sets').select('*').eq('is_daily', false),
        supabase.from('user_practice_history').select('*').eq('user_id', user.id),
        supabase.from('flashcard_decks').select('*'),
        supabase.from('user_flashcard_progress').select('*').eq('user_id', user.id),
        supabase.from('speaking_lessons').select('*'),
        supabase.from('speaking_sessions').select('*').eq('user_id', user.id)
      ]);

      const weaknesses: WeaknessItem[] = [];

      // Analyze quiz weaknesses
      quizSets.data?.forEach(quiz => {
        const attempts = quizHistory.data?.filter(h => h.quiz_set_id === quiz.id) || [];
        if (attempts.length > 0) {
          const bestScore = Math.max(...attempts.map(a => (a.score / a.total_questions) * 100));
          const lastAttempt = attempts.sort((a, b) => 
            new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
          )[0];

          if (bestScore < 70) {
            weaknesses.push({
              id: quiz.id,
              title: quiz.title_id,
              titleJp: quiz.title_jp,
              type: 'quiz',
              category: quiz.category,
              score: Math.round(bestScore),
              attempts: attempts.length,
              lastAttempt: lastAttempt?.completed_at || null,
              recommendation: bestScore < 50 
                ? 'Pelajari materi ini dari awal' 
                : 'Latih lagi untuk meningkatkan pemahaman'
            });
          }
        }
      });

      // Analyze flashcard weaknesses
      flashcardDecks.data?.forEach(deck => {
        const deckProgress = flashcardProgress.data?.filter(p => p.deck_id === deck.id) || [];
        if (deckProgress.length > 0) {
          const masteredCount = deckProgress.filter(p => p.status === 'mastered').length;
          const totalCards = deck.card_count || 1;
          const masteryRate = (masteredCount / totalCards) * 100;

          if (masteryRate < 50) {
            const lastReview = deckProgress.sort((a, b) => 
              new Date(b.last_reviewed_at || 0).getTime() - new Date(a.last_reviewed_at || 0).getTime()
            )[0];

            weaknesses.push({
              id: deck.id,
              title: deck.title_id,
              titleJp: deck.title_jp,
              type: 'flashcard',
              category: deck.category,
              score: Math.round(masteryRate),
              attempts: deckProgress.length,
              lastAttempt: lastReview?.last_reviewed_at || null,
              recommendation: 'Review kartu-kartu yang masih sulit setiap hari'
            });
          }
        }
      });

      // Analyze speaking weaknesses
      speakingLessons.data?.forEach(lesson => {
        const sessions = speakingSessions.data?.filter(s => s.lesson_id === lesson.id) || [];
        if (sessions.length > 0) {
          const avgScore = sessions.reduce((sum, s) => sum + (Number(s.average_score) || 0), 0) / sessions.length;

          if (avgScore < 70) {
            const lastSession = sessions.sort((a, b) => 
              new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
            )[0];

            weaknesses.push({
              id: lesson.id,
              title: lesson.title_id,
              titleJp: lesson.title_ja,
              type: 'speaking',
              category: lesson.category || 'general',
              score: Math.round(avgScore),
              attempts: sessions.length,
              lastAttempt: lastSession?.completed_at || null,
              recommendation: 'Dengarkan audio lebih sering dan tirukan pelafalannya'
            });
          }
        }
      });

      // Sort by score (lowest first)
      return weaknesses.sort((a, b) => a.score - b.score).slice(0, 10);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000
  });
}

// Hook for analytics summary
export function useAnalyticsSummary() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['analytics-summary', user?.id],
    queryFn: async (): Promise<AnalyticsSummary> => {
      if (!user) {
        return {
          totalStudyTime: 0,
          averageDailyTime: 0,
          totalXP: 0,
          totalLessonsCompleted: 0,
          totalQuizzesTaken: 0,
          totalFlashcardsReviewed: 0,
          totalSpeakingPracticed: 0,
          currentStreak: 0,
          longestStreak: 0,
          activeDaysThisMonth: 0,
          masteryRate: 0,
          averageQuizScore: 0
        };
      }

      const thisMonth = subMonths(new Date(), 1);

      const [profile, userProgress, practiceHistory, flashcardSessions, flashcardProgress, speakingSessions] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('user_progress').select('*').eq('user_id', user.id).eq('completed', true),
        supabase.from('user_practice_history').select('*').eq('user_id', user.id),
        supabase.from('flashcard_sessions').select('*').eq('user_id', user.id),
        supabase.from('user_flashcard_progress').select('*').eq('user_id', user.id),
        supabase.from('speaking_sessions').select('*').eq('user_id', user.id)
      ]);

      // Calculate study time
      const quizTime = practiceHistory.data?.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0) || 0;
      const flashcardTime = flashcardSessions.data?.reduce((sum, f) => sum + (f.time_spent_seconds || 0), 0) || 0;
      const speakingTime = speakingSessions.data?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0;
      const totalStudyTime = Math.round((quizTime + flashcardTime + speakingTime) / 60);

      // Count active days this month
      const activeDaysSet = new Set<string>();
      userProgress.data?.forEach(p => {
        if (p.completed_at && new Date(p.completed_at) >= thisMonth) {
          activeDaysSet.add(format(new Date(p.completed_at), 'yyyy-MM-dd'));
        }
      });
      practiceHistory.data?.forEach(p => {
        if (p.completed_at && new Date(p.completed_at) >= thisMonth) {
          activeDaysSet.add(format(new Date(p.completed_at), 'yyyy-MM-dd'));
        }
      });
      flashcardSessions.data?.forEach(f => {
        if (f.started_at && new Date(f.started_at) >= thisMonth) {
          activeDaysSet.add(format(new Date(f.started_at), 'yyyy-MM-dd'));
        }
      });

      // Calculate mastery rate
      const masteredCards = flashcardProgress.data?.filter(p => p.status === 'mastered').length || 0;
      const totalCards = flashcardProgress.data?.length || 1;
      const masteryRate = Math.round((masteredCards / totalCards) * 100);

      // Calculate average quiz score
      const avgQuizScore = practiceHistory.data?.length 
        ? Math.round(practiceHistory.data.reduce((sum, p) => sum + ((p.score / p.total_questions) * 100), 0) / practiceHistory.data.length)
        : 0;

      return {
        totalStudyTime,
        averageDailyTime: activeDaysSet.size > 0 ? Math.round(totalStudyTime / activeDaysSet.size) : 0,
        totalXP: profile.data?.total_xp || 0,
        totalLessonsCompleted: userProgress.data?.length || 0,
        totalQuizzesTaken: practiceHistory.data?.length || 0,
        totalFlashcardsReviewed: flashcardSessions.data?.reduce((sum, f) => sum + (f.cards_studied || 0), 0) || 0,
        totalSpeakingPracticed: speakingSessions.data?.reduce((sum, s) => sum + (s.items_practiced || 0), 0) || 0,
        currentStreak: profile.data?.current_streak || 0,
        longestStreak: profile.data?.longest_streak || 0,
        activeDaysThisMonth: activeDaysSet.size,
        masteryRate,
        averageQuizScore: avgQuizScore
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000
  });
}

// Hook for monthly trends (last 6 months)
export function useMonthlyTrends() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['monthly-trends', user?.id],
    queryFn: async (): Promise<MonthlyTrend[]> => {
      if (!user) return [];

      const trends: MonthlyTrend[] = [];
      const today = new Date();

      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0, 23, 59, 59);
        const monthName = format(monthStart, 'MMM', { locale: localeId });

        const [userProgress, practiceHistory, flashcardSessions, speakingSessions] = await Promise.all([
          supabase
            .from('user_progress')
            .select('xp_earned')
            .eq('user_id', user.id)
            .eq('completed', true)
            .gte('completed_at', monthStart.toISOString())
            .lte('completed_at', monthEnd.toISOString()),
          supabase
            .from('user_practice_history')
            .select('xp_earned, time_spent_seconds')
            .eq('user_id', user.id)
            .gte('completed_at', monthStart.toISOString())
            .lte('completed_at', monthEnd.toISOString()),
          supabase
            .from('flashcard_sessions')
            .select('xp_earned, time_spent_seconds, cards_studied')
            .eq('user_id', user.id)
            .gte('started_at', monthStart.toISOString())
            .lte('started_at', monthEnd.toISOString()),
          supabase
            .from('speaking_sessions')
            .select('xp_earned, duration_seconds, items_practiced')
            .eq('user_id', user.id)
            .gte('started_at', monthStart.toISOString())
            .lte('started_at', monthEnd.toISOString())
        ]);

        const xp = 
          (userProgress.data?.reduce((sum, p) => sum + (p.xp_earned || 0), 0) || 0) +
          (practiceHistory.data?.reduce((sum, p) => sum + (p.xp_earned || 0), 0) || 0) +
          (flashcardSessions.data?.reduce((sum, f) => sum + (f.xp_earned || 0), 0) || 0) +
          (speakingSessions.data?.reduce((sum, s) => sum + (s.xp_earned || 0), 0) || 0);

        const studyMinutes = Math.round((
          (practiceHistory.data?.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0) || 0) +
          (flashcardSessions.data?.reduce((sum, f) => sum + (f.time_spent_seconds || 0), 0) || 0) +
          (speakingSessions.data?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0)
        ) / 60);

        const itemsCompleted = 
          (userProgress.data?.length || 0) +
          (practiceHistory.data?.length || 0) +
          (flashcardSessions.data?.reduce((sum, f) => sum + (f.cards_studied || 0), 0) || 0) +
          (speakingSessions.data?.reduce((sum, s) => sum + (s.items_practiced || 0), 0) || 0);

        trends.push({
          month: monthName,
          xp,
          studyMinutes,
          itemsCompleted
        });
      }

      return trends;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000
  });
}
