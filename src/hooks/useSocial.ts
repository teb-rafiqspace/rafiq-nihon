import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  friend_profile?: {
    full_name: string | null;
    avatar_url: string | null;
    total_xp: number | null;
    current_streak: number | null;
  };
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string | null;
  created_at: string;
  sender_profile?: {
    full_name: string | null;
    avatar_url: string | null;
    total_xp: number | null;
  };
}

export interface Challenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  quiz_set_id: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'expired';
  challenger_score: number | null;
  challenged_score: number | null;
  winner_id: string | null;
  xp_reward: number | null;
  created_at: string;
  expires_at: string | null;
  completed_at: string | null;
}

export interface LeaderboardUser {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_xp: number;
  current_streak: number | null;
  rank?: number;
}

export type LeaderboardPeriod = 'all' | 'weekly' | 'monthly';

export function useSocial() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get friends list
  const { data: friends, isLoading: friendsLoading } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Fetch friend profiles
      if (data && data.length > 0) {
        const friendIds = data.map(f => f.friend_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, total_xp, current_streak')
          .in('user_id', friendIds);
        
        return data.map(friend => ({
          ...friend,
          friend_profile: profiles?.find(p => p.user_id === friend.friend_id)
        })) as Friend[];
      }
      
      return data as Friend[];
    },
    enabled: !!user?.id,
  });

  // Get pending friend requests (received)
  const { data: pendingRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['friend-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('status', 'pending');
      
      if (error) throw error;
      
      // Fetch sender profiles
      if (data && data.length > 0) {
        const senderIds = data.map(r => r.sender_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, total_xp')
          .in('user_id', senderIds);
        
        return data.map(request => ({
          ...request,
          sender_profile: profiles?.find(p => p.user_id === request.sender_id)
        })) as FriendRequest[];
      }
      
      return data as FriendRequest[];
    },
    enabled: !!user?.id,
  });

  // Get pending challenges
  const { data: pendingChallenges, isLoading: challengesLoading } = useQuery({
    queryKey: ['challenges', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_challenges')
        .select('*')
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
        .in('status', ['pending', 'accepted', 'in_progress'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Challenge[];
    },
    enabled: !!user?.id,
  });

  // Send friend request
  const sendFriendRequest = useMutation({
    mutationFn: async ({ receiverId, message }: { receiverId: string; message?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          message,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Permintaan pertemanan terkirim!');
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal mengirim permintaan');
    },
  });

  // Accept friend request
  const acceptFriendRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase.rpc('accept_friend_request', {
        request_id: requestId,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Pertemanan diterima!');
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    },
    onError: () => {
      toast.error('Gagal menerima permintaan');
    },
  });

  // Reject friend request
  const rejectFriendRequest = useMutation({
    mutationFn: async (requestId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected', responded_at: new Date().toISOString() })
        .eq('id', requestId)
        .eq('receiver_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Permintaan ditolak');
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    },
  });

  // Remove friend
  const removeFriend = useMutation({
    mutationFn: async (friendId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // Remove both directions
      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Teman dihapus');
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

  // Send challenge
  const sendChallenge = useMutation({
    mutationFn: async ({ challengedId, quizSetId }: { challengedId: string; quizSetId?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('user_challenges')
        .insert({
          challenger_id: user.id,
          challenged_id: challengedId,
          quiz_set_id: quizSetId,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Tantangan terkirim!');
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
    onError: () => {
      toast.error('Gagal mengirim tantangan');
    },
  });

  // Respond to challenge
  const respondToChallenge = useMutation({
    mutationFn: async ({ challengeId, accept }: { challengeId: string; accept: boolean }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('user_challenges')
        .update({ status: accept ? 'accepted' : 'declined' })
        .eq('id', challengeId)
        .eq('challenged_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: (_, { accept }) => {
      toast.success(accept ? 'Tantangan diterima!' : 'Tantangan ditolak');
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });

  return {
    friends,
    friendsLoading,
    pendingRequests,
    requestsLoading,
    pendingChallenges,
    challengesLoading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    sendChallenge,
    respondToChallenge,
  };
}

export function useLeaderboard(period: LeaderboardPeriod = 'all', limit = 50) {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', period, limit],
    queryFn: async () => {
      // For now, we use total_xp for all periods
      // Use leaderboard_profiles view for secure public access to limited profile data
      const { data, error } = await supabase
        .from('leaderboard_profiles' as any)
        .select('id, user_id, full_name, avatar_url, total_xp, current_streak')
        .limit(limit);
      
      if (error) throw error;
      
      // Type assertion for view data
      const profiles = (data || []) as unknown as Array<{
        id: string;
        user_id: string;
        full_name: string | null;
        avatar_url: string | null;
        total_xp: number;
        current_streak: number;
      }>;
      
      return profiles.map((profile, index) => ({
        ...profile,
        rank: index + 1,
      })) as LeaderboardUser[];
    },
  });

  const { data: userRank } = useQuery({
    queryKey: ['user-rank', user?.id, period],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_xp')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!profile) return null;
      
      const { count } = await supabase
        .from('leaderboard_profiles' as any)
        .select('*', { count: 'exact', head: true })
        .gt('total_xp', profile.total_xp || 0);
      
      return (count || 0) + 1;
    },
    enabled: !!user?.id,
  });

  return {
    leaderboard: data || [],
    userRank,
    isLoading,
  };
}

// Search users for adding friends
export function useUserSearch(query: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      const { data, error } = await supabase
        .from('leaderboard_profiles' as any)
        .select('id, user_id, full_name, avatar_url, total_xp')
        .neq('user_id', user?.id || '')
        .ilike('full_name', `%${query}%`)
        .limit(10);
      
      if (error) throw error;
      
      // Type assertion for view data
      return (data || []) as unknown as Array<{
        id: string;
        user_id: string;
        full_name: string | null;
        avatar_url: string | null;
        total_xp: number;
      }>;
    },
    enabled: query.length >= 2,
  });
}
