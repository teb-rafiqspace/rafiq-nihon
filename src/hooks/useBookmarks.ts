import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export type BookmarkContentType = 'vocabulary' | 'lesson' | 'grammar' | 'flashcard' | 'chapter' | 'kana';

export interface Bookmark {
  id: string;
  user_id: string;
  content_type: BookmarkContentType;
  content_id: string;
  notes: string | null;
  created_at: string;
}

export function useBookmarks(contentType?: BookmarkContentType) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['bookmarks', user?.id, contentType],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (contentType) {
        query = query.eq('content_type', contentType);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Bookmark[];
    },
    enabled: !!user,
  });
}

export function useIsBookmarked(contentType: BookmarkContentType, contentId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['bookmark', user?.id, contentType, contentId],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!user,
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      contentType, 
      contentId, 
      notes 
    }: { 
      contentType: BookmarkContentType; 
      contentId: string; 
      notes?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Check if already bookmarked
      const { data: existing } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .maybeSingle();
      
      if (existing) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('id', existing.id);
        
        if (error) throw error;
        return { action: 'removed' as const };
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            content_type: contentType,
            content_id: contentId,
            notes: notes || null,
          });
        
        if (error) throw error;
        return { action: 'added' as const };
      }
    },
    onSuccess: (result, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ 
        queryKey: ['bookmark', user?.id, variables.contentType, variables.contentId] 
      });
      
      toast.success(
        result.action === 'added' 
          ? 'Berhasil ditambahkan ke bookmark!' 
          : 'Bookmark dihapus'
      );
    },
    onError: (error) => {
      console.error('Bookmark error:', error);
      toast.error('Gagal mengubah bookmark');
    },
  });
}

export function useUpdateBookmarkNotes() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      contentType, 
      contentId, 
      notes 
    }: { 
      contentType: BookmarkContentType; 
      contentId: string; 
      notes: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('bookmarks')
        .update({ notes })
        .eq('user_id', user.id)
        .eq('content_type', contentType)
        .eq('content_id', contentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.success('Catatan tersimpan');
    },
  });
}
