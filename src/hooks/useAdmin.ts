import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

export type AppRole = 'admin' | 'moderator' | 'user';

interface AdminStats {
  total_users: number;
  active_users_7d: number;
  active_users_30d: number;
  total_xp_earned: number;
  total_chapters: number;
  total_lessons: number;
  total_decks: number;
  total_flashcards: number;
  total_quiz_sets: number;
  total_quiz_questions: number;
  premium_users: number;
  avg_streak: number;
}

interface UserWithRole {
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  total_xp: number;
  current_level: number;
  current_streak: number;
  lessons_completed: number;
  last_active_at: string | null;
  created_at: string;
  role: AppRole;
}

export function useIsAdmin() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .rpc('is_admin');
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return data === true;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAdminStats() {
  const { data: isAdmin } = useIsAdmin();
  
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_admin_stats');
      
      if (error) throw error;
      
      // The function returns an array with one row
      return (data as unknown as AdminStats[])?.[0] || null;
    },
    enabled: !!isAdmin,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useAllUsersWithRoles() {
  const { data: isAdmin } = useIsAdmin();
  
  return useQuery({
    queryKey: ['all-users-with-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_all_users_with_roles');
      
      if (error) throw error;
      
      return data as unknown as UserWithRole[];
    },
    enabled: !!isAdmin,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { data, error } = await supabase
        .rpc('assign_user_role', { 
          _target_user_id: userId, 
          _role: role 
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users-with-roles'] });
      toast({ title: 'Role berhasil diperbarui' });
    },
    onError: (error) => {
      toast({ 
        title: 'Gagal memperbarui role', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
}

export function useRemoveRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { data, error } = await supabase
        .rpc('remove_user_role', { 
          _target_user_id: userId, 
          _role: role 
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users-with-roles'] });
      toast({ title: 'Role berhasil dihapus' });
    },
    onError: (error) => {
      toast({ 
        title: 'Gagal menghapus role', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
}

// Content management hooks
export function useChapters() {
  return useQuery({
    queryKey: ['admin-chapters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .order('track')
        .order('sort_order');
      
      if (error) throw error;
      return data;
    },
  });
}

export function useLessons(chapterId?: string) {
  return useQuery({
    queryKey: ['admin-lessons', chapterId],
    queryFn: async () => {
      let query = supabase
        .from('lessons')
        .select('*, chapters(title_id, track)')
        .order('sort_order');
      
      if (chapterId) {
        query = query.eq('chapter_id', chapterId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useFlashcardDecks() {
  return useQuery({
    queryKey: ['admin-flashcard-decks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcard_decks')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      return data;
    },
  });
}

export function useQuizSets() {
  return useQuery({
    queryKey: ['admin-quiz-sets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('practice_quiz_sets')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      return data;
    },
  });
}
