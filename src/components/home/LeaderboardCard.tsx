import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Crown, Medal, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface LeaderboardUser {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_xp: number;
}

export function LeaderboardCard() {
  const { user } = useAuth();
  
  const { data: topUsers, isLoading } = useQuery({
    queryKey: ['leaderboard-preview'],
    queryFn: async () => {
      // Use leaderboard_profiles view for secure public access to limited profile data
      const { data, error } = await supabase
        .from('leaderboard_profiles' as any)
        .select('id, user_id, full_name, avatar_url, total_xp')
        .limit(5);
      
      if (error) throw error;
      return (data || []) as unknown as LeaderboardUser[];
    },
  });
  
  const { data: userRank } = useQuery({
    queryKey: ['user-rank', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Get count of users with higher XP
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
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-4 w-4 text-amber-500" />;
      case 2:
        return <Medal className="h-4 w-4 text-slate-400" />;
      case 3:
        return <Medal className="h-4 w-4 text-amber-700" />;
      default:
        return <span className="text-xs font-bold text-muted-foreground">{rank}</span>;
    }
  };
  
  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-100 to-yellow-50 border-amber-200';
      case 2:
        return 'bg-gradient-to-r from-slate-100 to-slate-50 border-slate-200';
      case 3:
        return 'bg-gradient-to-r from-orange-100 to-amber-50 border-orange-200';
      default:
        return 'bg-card border-border';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-card p-5 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h2 className="font-semibold text-lg">Papan Peringkat</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl shadow-card p-5 border border-border"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h2 className="font-semibold text-lg">Papan Peringkat</h2>
        </div>
        {userRank && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
            Peringkat #{userRank}
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        {topUsers?.slice(0, 3).map((leaderUser, index) => {
          const rank = index + 1;
          const isCurrentUser = leaderUser.user_id === user?.id;
          
          return (
            <motion.div
              key={leaderUser.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all",
                getRankBg(rank),
                isCurrentUser && "ring-2 ring-primary ring-offset-1"
              )}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {getRankIcon(rank)}
              </div>
              
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm overflow-hidden">
                {leaderUser.avatar_url ? (
                  <img 
                    src={leaderUser.avatar_url} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  '👤'
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium text-sm truncate",
                  isCurrentUser && "text-primary"
                )}>
                  {leaderUser.full_name || 'Pelajar'}
                  {isCurrentUser && ' (Kamu)'}
                </p>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-sm">{leaderUser.total_xp?.toLocaleString() || 0}</p>
                <p className="text-[10px] text-muted-foreground">XP</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {(!topUsers || topUsers.length === 0) && (
        <div className="text-center py-6 text-muted-foreground">
          <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Belum ada data peringkat</p>
        </div>
      )}
      
      <button 
        onClick={() => window.location.href = '/leaderboard'}
        className="w-full mt-4 flex items-center justify-center gap-1 text-sm text-primary font-medium hover:underline"
      >
        Lihat Semua
        <ChevronRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
