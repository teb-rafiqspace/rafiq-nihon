import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useProfile } from './useProfile';
import { useCallback, useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: 'total_xp' | 'streak_days' | 'lessons_completed';
  requirement_value: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface AchievementProgress {
  badge: Badge;
  earned: boolean;
  earnedAt: string | null;
  progress: number; // 0-100
  currentValue: number;
  targetValue: number;
}

// Icon mapping for badge icons
export const BADGE_ICONS: Record<string, string> = {
  star: '⭐',
  book: '📚',
  flame: '🔥',
  medal: '🏅',
  trophy: '🏆',
  zap: '⚡',
  crown: '👑',
  sparkles: '✨',
  rocket: '🚀',
  calendar: '📅',
  award: '🎖️',
  'graduation-cap': '🎓',
  briefcase: '💼',
  school: '🏫'
};

export function useAllBadges() {
  return useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('requirement_type')
        .order('requirement_value');
      
      if (error) throw error;
      return data as Badge[];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

export function useUserBadges() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-badges', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      return data as (UserBadge & { badge: Badge })[];
    },
    enabled: !!user,
  });
}

export function useAchievements() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: allBadges } = useAllBadges();
  const { data: userBadges } = useUserBadges();
  const queryClient = useQueryClient();
  const [newlyEarned, setNewlyEarned] = useState<Badge[]>([]);

  // Calculate progress for each badge
  const achievementProgress: AchievementProgress[] = (allBadges || []).map(badge => {
    const earned = userBadges?.find(ub => ub.badge_id === badge.id);
    
    let currentValue = 0;
    if (profile) {
      switch (badge.requirement_type) {
        case 'total_xp':
          currentValue = profile.total_xp || 0;
          break;
        case 'streak_days':
          currentValue = Math.max(profile.current_streak || 0, profile.longest_streak || 0);
          break;
        case 'lessons_completed':
          currentValue = profile.lessons_completed || 0;
          break;
      }
    }
    
    const progress = Math.min(100, (currentValue / badge.requirement_value) * 100);
    
    return {
      badge,
      earned: !!earned,
      earnedAt: earned?.earned_at || null,
      progress,
      currentValue,
      targetValue: badge.requirement_value
    };
  });

  // Group by category
  const groupedAchievements = {
    total_xp: achievementProgress.filter(a => a.badge.requirement_type === 'total_xp'),
    streak_days: achievementProgress.filter(a => a.badge.requirement_type === 'streak_days'),
    lessons_completed: achievementProgress.filter(a => a.badge.requirement_type === 'lessons_completed'),
  };

  // Award badge mutation
  const awardBadgeMutation = useMutation({
    mutationFn: async (badgeId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('user_badges')
        .insert({
          user_id: user.id,
          badge_id: badgeId
        })
        .select()
        .single();
      
      if (error) {
        // Ignore duplicate errors
        if (error.code === '23505') return null;
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-badges', user?.id] });
    },
  });

  // Check and award eligible badges
  const checkAndAwardBadges = useCallback(async () => {
    if (!user || !profile || !allBadges || !userBadges) return;
    
    const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
    const newBadges: Badge[] = [];
    
    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge.id)) continue;
      
      let currentValue = 0;
      switch (badge.requirement_type) {
        case 'total_xp':
          currentValue = profile.total_xp || 0;
          break;
        case 'streak_days':
          currentValue = Math.max(profile.current_streak || 0, profile.longest_streak || 0);
          break;
        case 'lessons_completed':
          currentValue = profile.lessons_completed || 0;
          break;
      }
      
      if (currentValue >= badge.requirement_value) {
        await awardBadgeMutation.mutateAsync(badge.id);
        newBadges.push(badge);
      }
    }
    
    if (newBadges.length > 0) {
      setNewlyEarned(newBadges);
      
      // Show toast for each new badge
      newBadges.forEach(badge => {
        toast({
          title: `🎉 Badge Baru: ${badge.name}!`,
          description: badge.description,
        });
      });
    }
  }, [user, profile, allBadges, userBadges, awardBadgeMutation]);

  // Auto-check badges when profile updates
  useEffect(() => {
    if (profile && allBadges && userBadges) {
      checkAndAwardBadges();
    }
  }, [profile?.total_xp, profile?.current_streak, profile?.lessons_completed, allBadges?.length, userBadges?.length]);

  const clearNewlyEarned = useCallback(() => {
    setNewlyEarned([]);
  }, []);

  // Stats
  const totalBadges = allBadges?.length || 0;
  const earnedBadges = userBadges?.length || 0;
  const completionPercentage = totalBadges > 0 ? Math.round((earnedBadges / totalBadges) * 100) : 0;

  return {
    allBadges,
    userBadges,
    achievementProgress,
    groupedAchievements,
    checkAndAwardBadges,
    newlyEarned,
    clearNewlyEarned,
    stats: {
      total: totalBadges,
      earned: earnedBadges,
      percentage: completionPercentage
    }
  };
}
