import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface CulturalTip {
  id: string;
  title_jp: string;
  title_id: string;
  content_id: string;
  content_en: string | null;
  category: string;
  image_url: string | null;
  related_phrases: {
    japanese: string;
    reading: string;
    meaning: string;
  }[];
  do_list: string[];
  dont_list: string[];
  is_premium: boolean;
  order_index: number;
}

interface UserCulturalProgress {
  id: string;
  tip_id: string;
  read: boolean;
  bookmarked: boolean;
  read_at: string | null;
}

export function useCulturalTips(category?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tips, isLoading: tipsLoading } = useQuery({
    queryKey: ['cultural-tips', category],
    queryFn: async () => {
      let query = supabase
        .from('cultural_tips')
        .select('*')
        .order('order_index');
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as CulturalTip[];
    }
  });

  const { data: userProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['cultural-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_cultural_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return (data || []) as UserCulturalProgress[];
    },
    enabled: !!user
  });

  const markAsRead = useMutation({
    mutationFn: async (tipId: string) => {
      if (!user) throw new Error('Not authenticated');

      const existing = userProgress?.find(p => p.tip_id === tipId);
      
      if (existing) {
        if (existing.read) return;
        
        const { error } = await supabase
          .from('user_cultural_progress')
          .update({
            read: true,
            read_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_cultural_progress')
          .insert({
            user_id: user.id,
            tip_id: tipId,
            read: true,
            read_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultural-progress'] });
    }
  });

  const toggleBookmark = useMutation({
    mutationFn: async (tipId: string) => {
      if (!user) throw new Error('Not authenticated');

      const existing = userProgress?.find(p => p.tip_id === tipId);
      
      if (existing) {
        const { error } = await supabase
          .from('user_cultural_progress')
          .update({
            bookmarked: !existing.bookmarked
          })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_cultural_progress')
          .insert({
            user_id: user.id,
            tip_id: tipId,
            bookmarked: true
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultural-progress'] });
    }
  });

  const getTipStatus = (tipId: string) => {
    const progress = userProgress?.find(p => p.tip_id === tipId);
    return {
      read: progress?.read || false,
      bookmarked: progress?.bookmarked || false
    };
  };

  const categories = [...new Set(tips?.map(t => t.category) || [])];

  const stats = {
    total: tips?.length || 0,
    read: userProgress?.filter(p => p.read).length || 0,
    bookmarked: userProgress?.filter(p => p.bookmarked).length || 0
  };

  return {
    tips: tips || [],
    userProgress: userProgress || [],
    isLoading: tipsLoading || progressLoading,
    markAsRead: markAsRead.mutate,
    toggleBookmark: toggleBookmark.mutate,
    getTipStatus,
    categories,
    stats
  };
}
