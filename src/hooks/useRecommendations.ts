import { useMemo } from 'react';
import { useProgressTracking, TopicProgress } from './useProgressTracking';
import { useAuth } from '@/lib/auth';

export interface Recommendation {
  id: string;
  title: string;
  titleJp: string;
  reason: string;
  reasonIcon: string;
  priority: 'high' | 'medium' | 'low';
  type: 'quiz' | 'flashcard' | 'speaking';
  category: string;
  track: string | null;
  bestScore: number | null;
  actionLabel: string;
  route: string;
}

type RecommendationReason = 
  | 'weak_topic'
  | 'needs_review'
  | 'not_started'
  | 'almost_mastered'
  | 'long_inactive';

interface ReasonConfig {
  label: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
}

const REASON_CONFIG: Record<RecommendationReason, ReasonConfig> = {
  weak_topic: {
    label: 'Perlu diperkuat',
    icon: '💪',
    priority: 'high'
  },
  needs_review: {
    label: 'Waktunya review',
    icon: '🔄',
    priority: 'high'
  },
  not_started: {
    label: 'Belum dimulai',
    icon: '🆕',
    priority: 'medium'
  },
  almost_mastered: {
    label: 'Hampir dikuasai',
    icon: '🎯',
    priority: 'medium'
  },
  long_inactive: {
    label: 'Sudah lama tidak latihan',
    icon: '⏰',
    priority: 'low'
  }
};

function getRoute(topic: TopicProgress): string {
  switch (topic.type) {
    case 'quiz':
      return `/practice?tab=kuis&quiz=${topic.id}`;
    case 'flashcard':
      return `/practice?tab=flashcard&deck=${topic.id}`;
    case 'speaking':
      return `/speaking?lesson=${topic.id}`;
    default:
      return '/practice';
  }
}

function getActionLabel(type: TopicProgress['type']): string {
  switch (type) {
    case 'quiz':
      return 'Mulai Kuis';
    case 'flashcard':
      return 'Belajar Kartu';
    case 'speaking':
      return 'Latihan Bicara';
    default:
      return 'Mulai';
  }
}

function daysSinceDate(dateStr: string | null): number {
  if (!dateStr) return Infinity;
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function useRecommendations(maxRecommendations: number = 5) {
  const { user } = useAuth();
  const { 
    allTopics, 
    weakTopics, 
    trackProgress,
    overallStats 
  } = useProgressTracking();

  const recommendations = useMemo((): Recommendation[] => {
    if (!user) return [];
    
    const recs: Recommendation[] = [];

    // 1. High Priority: Weak topics (score < 60%)
    weakTopics.slice(0, 3).forEach(topic => {
      recs.push({
        id: `weak-${topic.id}`,
        title: topic.title,
        titleJp: topic.titleJp,
        reason: REASON_CONFIG.weak_topic.label,
        reasonIcon: REASON_CONFIG.weak_topic.icon,
        priority: 'high',
        type: topic.type,
        category: topic.category,
        track: topic.track,
        bestScore: topic.bestScore,
        actionLabel: getActionLabel(topic.type),
        route: getRoute(topic)
      });
    });

    // 2. High Priority: Topics that need review (in_progress, not practiced in 7+ days)
    const needsReview = allTopics
      .filter(t => 
        t.status === 'in_progress' && 
        t.lastPracticed && 
        daysSinceDate(t.lastPracticed) >= 7
      )
      .sort((a, b) => daysSinceDate(b.lastPracticed) - daysSinceDate(a.lastPracticed))
      .slice(0, 2);

    needsReview.forEach(topic => {
      if (!recs.find(r => r.id.includes(topic.id))) {
        recs.push({
          id: `review-${topic.id}`,
          title: topic.title,
          titleJp: topic.titleJp,
          reason: REASON_CONFIG.needs_review.label,
          reasonIcon: REASON_CONFIG.needs_review.icon,
          priority: 'high',
          type: topic.type,
          category: topic.category,
          track: topic.track,
          bestScore: topic.bestScore,
          actionLabel: getActionLabel(topic.type),
          route: getRoute(topic)
        });
      }
    });

    // 3. Medium Priority: Almost mastered (60-79%)
    const almostMastered = allTopics
      .filter(t => 
        t.status === 'in_progress' && 
        (t.bestScore || 0) >= 60 && 
        (t.bestScore || 0) < 80
      )
      .sort((a, b) => (b.bestScore || 0) - (a.bestScore || 0))
      .slice(0, 2);

    almostMastered.forEach(topic => {
      if (!recs.find(r => r.id.includes(topic.id))) {
        recs.push({
          id: `almost-${topic.id}`,
          title: topic.title,
          titleJp: topic.titleJp,
          reason: REASON_CONFIG.almost_mastered.label,
          reasonIcon: REASON_CONFIG.almost_mastered.icon,
          priority: 'medium',
          type: topic.type,
          category: topic.category,
          track: topic.track,
          bestScore: topic.bestScore,
          actionLabel: getActionLabel(topic.type),
          route: getRoute(topic)
        });
      }
    });

    // 4. Medium Priority: Not started topics from tracks user has been active in
    const activeTrackIds = trackProgress
      .filter(t => t.masteredTopics > 0 || t.categories.some(c => c.inProgress > 0))
      .map(t => t.track);

    const notStarted = allTopics
      .filter(t => 
        t.status === 'not_started' && 
        activeTrackIds.includes(t.track || '')
      )
      .slice(0, 3);

    notStarted.forEach(topic => {
      if (!recs.find(r => r.id.includes(topic.id))) {
        recs.push({
          id: `new-${topic.id}`,
          title: topic.title,
          titleJp: topic.titleJp,
          reason: REASON_CONFIG.not_started.label,
          reasonIcon: REASON_CONFIG.not_started.icon,
          priority: 'medium',
          type: topic.type,
          category: topic.category,
          track: topic.track,
          bestScore: null,
          actionLabel: getActionLabel(topic.type),
          route: getRoute(topic)
        });
      }
    });

    // 5. Low Priority: Long inactive (practiced but > 14 days ago)
    const longInactive = allTopics
      .filter(t => 
        t.status === 'mastered' && 
        t.lastPracticed && 
        daysSinceDate(t.lastPracticed) >= 14
      )
      .sort((a, b) => daysSinceDate(b.lastPracticed) - daysSinceDate(a.lastPracticed))
      .slice(0, 2);

    longInactive.forEach(topic => {
      if (!recs.find(r => r.id.includes(topic.id))) {
        recs.push({
          id: `inactive-${topic.id}`,
          title: topic.title,
          titleJp: topic.titleJp,
          reason: REASON_CONFIG.long_inactive.label,
          reasonIcon: REASON_CONFIG.long_inactive.icon,
          priority: 'low',
          type: topic.type,
          category: topic.category,
          track: topic.track,
          bestScore: topic.bestScore,
          actionLabel: 'Review',
          route: getRoute(topic)
        });
      }
    });

    // Sort by priority and return limited results
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return recs
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, maxRecommendations);
  }, [user, allTopics, weakTopics, trackProgress, maxRecommendations]);

  // Get category-based insights
  const categoryInsights = useMemo(() => {
    const weakCategories = new Map<string, number>();
    
    weakTopics.forEach(topic => {
      const count = weakCategories.get(topic.category) || 0;
      weakCategories.set(topic.category, count + 1);
    });

    return Array.from(weakCategories.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [weakTopics]);

  // Get overall learning suggestion
  const overallSuggestion = useMemo(() => {
    if (overallStats.total === 0) {
      return {
        message: 'Mulai perjalanan belajarmu dengan topik dasar!',
        type: 'start'
      };
    }

    if (weakTopics.length >= 3) {
      return {
        message: `Ada ${weakTopics.length} topik yang perlu diperkuat. Fokus pada latihan!`,
        type: 'focus'
      };
    }

    if (overallStats.percentage >= 80) {
      return {
        message: 'Hebat! Kamu sudah menguasai sebagian besar materi.',
        type: 'excellent'
      };
    }

    if (overallStats.inProgress > overallStats.mastered) {
      return {
        message: 'Teruskan! Selesaikan topik yang sedang dipelajari.',
        type: 'continue'
      };
    }

    return {
      message: 'Bagus! Terus konsisten belajar setiap hari.',
      type: 'good'
    };
  }, [overallStats, weakTopics]);

  return {
    recommendations,
    categoryInsights,
    overallSuggestion,
    hasWeakTopics: weakTopics.length > 0,
    weakTopicsCount: weakTopics.length
  };
}
