import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface TopicProgress {
  id: string;
  title: string;
  titleJp: string;
  category: string;
  track: string | null;
  status: 'not_started' | 'in_progress' | 'mastered';
  attempts: number;
  bestScore: number | null;
  lastPracticed: string | null;
  type: 'quiz' | 'flashcard' | 'speaking';
  color?: string | null;
  iconName?: string | null;
}

export interface CategoryProgress {
  category: string;
  total: number;
  mastered: number;
  inProgress: number;
  notStarted: number;
  percentage: number;
}

export interface TrackProgress {
  track: string;
  label: string;
  categories: CategoryProgress[];
  overallPercentage: number;
  totalTopics: number;
  masteredTopics: number;
}

export function useProgressTracking() {
  const { user } = useAuth();

  // Fetch quiz sets
  const { data: quizSets = [] } = useQuery({
    queryKey: ['quiz-sets-progress'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('practice_quiz_sets')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data;
    }
  });

  // Fetch flashcard decks
  const { data: flashcardDecks = [] } = useQuery({
    queryKey: ['flashcard-decks-progress'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcard_decks')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data;
    }
  });

  // Fetch speaking lessons
  const { data: speakingLessons = [] } = useQuery({
    queryKey: ['speaking-lessons-progress'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('speaking_lessons')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data;
    }
  });

  // Fetch user's quiz history
  const { data: quizHistory = [] } = useQuery({
    queryKey: ['quiz-history-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_practice_history')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch user's flashcard progress
  const { data: flashcardProgress = [] } = useQuery({
    queryKey: ['flashcard-progress-tracking', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch user's speaking sessions
  const { data: speakingSessions = [] } = useQuery({
    queryKey: ['speaking-sessions-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('speaking_sessions')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Process quiz progress
  const quizTopics = useMemo((): TopicProgress[] => {
    return quizSets.filter(q => !q.is_daily).map(quiz => {
      const attempts = quizHistory.filter(h => h.quiz_set_id === quiz.id);
      const bestAttempt = attempts.length > 0 
        ? Math.max(...attempts.map(a => (a.score / a.total_questions) * 100))
        : null;
      const lastPracticed = attempts.length > 0 
        ? attempts.sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())[0]?.completed_at
        : null;

      let status: TopicProgress['status'] = 'not_started';
      if (bestAttempt !== null) {
        status = bestAttempt >= 80 ? 'mastered' : 'in_progress';
      }

      return {
        id: quiz.id,
        title: quiz.title_id,
        titleJp: quiz.title_jp,
        category: quiz.category,
        track: quiz.track,
        status,
        attempts: attempts.length,
        bestScore: bestAttempt ? Math.round(bestAttempt) : null,
        lastPracticed,
        type: 'quiz',
        color: quiz.color,
        iconName: quiz.icon_name
      };
    });
  }, [quizSets, quizHistory]);

  // Process flashcard progress
  const flashcardTopics = useMemo((): TopicProgress[] => {
    return flashcardDecks.map(deck => {
      const deckProgress = flashcardProgress.filter(p => p.deck_id === deck.id);
      const masteredCards = deckProgress.filter(p => p.status === 'mastered').length;
      const totalCards = deck.card_count || 0;
      const masteredPercentage = totalCards > 0 ? (masteredCards / totalCards) * 100 : 0;
      
      const lastPracticed = deckProgress.length > 0 
        ? deckProgress.sort((a, b) => new Date(b.last_reviewed_at || 0).getTime() - new Date(a.last_reviewed_at || 0).getTime())[0]?.last_reviewed_at
        : null;

      let status: TopicProgress['status'] = 'not_started';
      if (deckProgress.length > 0) {
        status = masteredPercentage >= 80 ? 'mastered' : 'in_progress';
      }

      return {
        id: deck.id,
        title: deck.title_id,
        titleJp: deck.title_jp,
        category: deck.category,
        track: deck.track,
        status,
        attempts: deckProgress.length,
        bestScore: Math.round(masteredPercentage),
        lastPracticed,
        type: 'flashcard',
        color: deck.color,
        iconName: deck.icon_name
      };
    });
  }, [flashcardDecks, flashcardProgress]);

  // Process speaking progress
  const speakingTopics = useMemo((): TopicProgress[] => {
    return speakingLessons.map(lesson => {
      const sessions = speakingSessions.filter(s => s.lesson_id === lesson.id);
      const bestSession = sessions.length > 0 
        ? Math.max(...sessions.map(s => Number(s.average_score) || 0))
        : null;
      const lastPracticed = sessions.length > 0 
        ? sessions.sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())[0]?.completed_at
        : null;

      let status: TopicProgress['status'] = 'not_started';
      if (sessions.length > 0) {
        status = (bestSession || 0) >= 80 ? 'mastered' : 'in_progress';
      }

      return {
        id: lesson.id,
        title: lesson.title_id,
        titleJp: lesson.title_ja,
        category: lesson.category || 'general',
        track: lesson.track,
        status,
        attempts: sessions.length,
        bestScore: bestSession ? Math.round(bestSession) : null,
        lastPracticed,
        type: 'speaking'
      };
    });
  }, [speakingLessons, speakingSessions]);

  // Combine all topics
  const allTopics = useMemo(() => 
    [...quizTopics, ...flashcardTopics, ...speakingTopics],
    [quizTopics, flashcardTopics, speakingTopics]
  );

  // Group by track
  const trackProgress = useMemo((): TrackProgress[] => {
    const tracks = ['jlpt_n5', 'jlpt_n4', 'jlpt_n3', 'kemnaker'];
    const trackLabels: Record<string, string> = {
      'jlpt_n5': 'JLPT N5',
      'jlpt_n4': 'JLPT N4',
      'jlpt_n3': 'JLPT N3',
      'kemnaker': 'IM Japan/Kemnaker'
    };

    return tracks.map(track => {
      const trackTopics = allTopics.filter(t => t.track === track);
      
      // Group by category
      const categoryMap = new Map<string, TopicProgress[]>();
      trackTopics.forEach(topic => {
        const existing = categoryMap.get(topic.category) || [];
        categoryMap.set(topic.category, [...existing, topic]);
      });

      const categories: CategoryProgress[] = Array.from(categoryMap.entries()).map(([category, topics]) => ({
        category,
        total: topics.length,
        mastered: topics.filter(t => t.status === 'mastered').length,
        inProgress: topics.filter(t => t.status === 'in_progress').length,
        notStarted: topics.filter(t => t.status === 'not_started').length,
        percentage: topics.length > 0 
          ? Math.round((topics.filter(t => t.status === 'mastered').length / topics.length) * 100)
          : 0
      }));

      const masteredTopics = trackTopics.filter(t => t.status === 'mastered').length;

      return {
        track,
        label: trackLabels[track] || track,
        categories,
        overallPercentage: trackTopics.length > 0 
          ? Math.round((masteredTopics / trackTopics.length) * 100)
          : 0,
        totalTopics: trackTopics.length,
        masteredTopics
      };
    }).filter(t => t.totalTopics > 0);
  }, [allTopics]);

  // Overall stats
  const overallStats = useMemo(() => {
    const total = allTopics.length;
    const mastered = allTopics.filter(t => t.status === 'mastered').length;
    const inProgress = allTopics.filter(t => t.status === 'in_progress').length;
    const notStarted = allTopics.filter(t => t.status === 'not_started').length;

    return {
      total,
      mastered,
      inProgress,
      notStarted,
      percentage: total > 0 ? Math.round((mastered / total) * 100) : 0
    };
  }, [allTopics]);

  // Get topics by type
  const getTopicsByType = (type: 'quiz' | 'flashcard' | 'speaking') => 
    allTopics.filter(t => t.type === type);

  // Get topics by track
  const getTopicsByTrack = (track: string) => 
    allTopics.filter(t => t.track === track);

  // Get weak topics (attempted but not mastered)
  const weakTopics = useMemo(() => 
    allTopics.filter(t => t.status === 'in_progress' && (t.bestScore || 0) < 60)
      .sort((a, b) => (a.bestScore || 0) - (b.bestScore || 0)),
    [allTopics]
  );

  // Get recently practiced
  const recentlyPracticed = useMemo(() => 
    allTopics.filter(t => t.lastPracticed)
      .sort((a, b) => new Date(b.lastPracticed!).getTime() - new Date(a.lastPracticed!).getTime())
      .slice(0, 5),
    [allTopics]
  );

  return {
    allTopics,
    quizTopics,
    flashcardTopics,
    speakingTopics,
    trackProgress,
    overallStats,
    weakTopics,
    recentlyPracticed,
    getTopicsByType,
    getTopicsByTrack
  };
}
