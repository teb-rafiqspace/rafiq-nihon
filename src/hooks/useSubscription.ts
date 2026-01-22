import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  chats_remaining: number;
  started_at: string;
  expires_at: string | null;
  trial_used: boolean;
  created_at: string;
}

export function useSubscription() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Subscription | null;
    },
    enabled: !!user,
  });
}

export function useUpgradeSubscription() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ plan }: { plan: 'monthly' | 'yearly' }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Calculate expiry date: 7 days trial + plan duration
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 7);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          plan_type: 'premium',
          status: 'active',
          expires_at: trialEnd.toISOString(),
          trial_used: true,
          chats_remaining: 999, // Unlimited for premium
        })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return { subscription: data, plan };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
        })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
    },
  });
}

// Helper to check if user has premium access
export function isPremiumActive(subscription: Subscription | null | undefined): boolean {
  if (!subscription) return false;
  if (subscription.plan_type !== 'premium') return false;
  if (subscription.status === 'cancelled' || subscription.status === 'expired') return false;
  
  // Check if expired
  if (subscription.expires_at) {
    const expiryDate = new Date(subscription.expires_at);
    if (expiryDate < new Date()) return false;
  }
  
  return true;
}

// Helper to get days until expiry
export function getDaysUntilExpiry(subscription: Subscription | null | undefined): number | null {
  if (!subscription?.expires_at) return null;
  
  const expiryDate = new Date(subscription.expires_at);
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}
