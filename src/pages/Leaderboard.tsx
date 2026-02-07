import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, Flame, ArrowLeft, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLeaderboard, LeaderboardPeriod } from '@/hooks/useSocial';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [period, setPeriod] = useState<LeaderboardPeriod>('all');
  const { leaderboard, userRank, isLoading } = useLeaderboard(period, 100);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-amber-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-slate-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-700" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{rank}</span>;
    }
  };

  const getRankBg = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return 'bg-primary/10 border-primary';
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-100 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/20 border-amber-300 dark:border-amber-700';
      case 2:
        return 'bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/50 dark:to-slate-700/30 border-slate-300 dark:border-slate-600';
      case 3:
        return 'bg-gradient-to-r from-orange-100 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/20 border-orange-300 dark:border-orange-700';
      default:
        return 'bg-card border-border';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Papan Peringkat
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/friends')}>
            <Users className="h-4 w-4 mr-1" />
            Teman
          </Button>
        </div>

        {/* Period Tabs */}
        <div className="px-4 pb-3">
          <Tabs value={period} onValueChange={(v) => setPeriod(v as LeaderboardPeriod)}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">Semua Waktu</TabsTrigger>
              <TabsTrigger value="monthly" className="flex-1">Bulanan</TabsTrigger>
              <TabsTrigger value="weekly" className="flex-1">Mingguan</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Your Rank Banner */}
      {userRank && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 p-4 bg-primary/10 rounded-xl border border-primary/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Peringkat Kamu</p>
              <p className="text-2xl font-bold text-primary">#{userRank}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">dari {leaderboard.length} pelajar</p>
              <p className="text-xs text-muted-foreground mt-1">Terus belajar untuk naik peringkat!</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard List */}
      <div className="p-4 space-y-2 pb-24">
        {isLoading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))
        ) : (
          leaderboard.map((leaderUser, index) => {
            const isCurrentUser = leaderUser.user_id === user?.id;
            const rank = index + 1;

            return (
              <motion.div
                key={leaderUser.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.5) }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all",
                  getRankBg(rank, isCurrentUser),
                  isCurrentUser && "ring-2 ring-primary ring-offset-2"
                )}
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  {getRankIcon(rank)}
                </div>

                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {leaderUser.avatar_url ? (
                    <img
                      src={leaderUser.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg">👤</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium truncate",
                    isCurrentUser && "text-primary"
                  )}>
                    {leaderUser.full_name || 'Pelajar'}
                    {isCurrentUser && ' (Kamu)'}
                  </p>
                  {leaderUser.current_streak && leaderUser.current_streak > 0 && (
                    <div className="flex items-center gap-1 text-xs text-orange-500">
                      <Flame className="h-3 w-3" />
                      <span>{leaderUser.current_streak} hari streak</span>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <p className="font-bold">{leaderUser.total_xp?.toLocaleString() || 0}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </motion.div>
            );
          })
        )}

        {!isLoading && leaderboard.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Belum ada data peringkat</p>
          </div>
        )}
      </div>
    </div>
  );
}
