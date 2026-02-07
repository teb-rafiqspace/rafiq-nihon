import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  Layers, 
  HelpCircle,
  TrendingUp,
  Zap,
  Crown,
  Flame
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminStats } from '@/hooks/useAdmin';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: string;
  color: string;
  delay: number;
}

function StatCard({ title, value, icon: Icon, description, trend, color, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 text-xs text-accent mt-1">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  return (
    <AdminLayout 
      title="Dashboard" 
      description="Overview statistik dan performa aplikasi"
    >
      {isLoading ? (
        <StatsLoading />
      ) : stats ? (
        <div className="space-y-6">
          {/* User Stats */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Pengguna</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Users"
                value={stats.total_users?.toLocaleString() || 0}
                icon={Users}
                description="Semua pengguna terdaftar"
                color="bg-gradient-primary"
                delay={0}
              />
              <StatCard
                title="Active (7 hari)"
                value={stats.active_users_7d?.toLocaleString() || 0}
                icon={Zap}
                description="Aktif dalam 7 hari terakhir"
                color="bg-gradient-secondary"
                delay={0.05}
              />
              <StatCard
                title="Premium Users"
                value={stats.premium_users?.toLocaleString() || 0}
                icon={Crown}
                description="Pengguna berbayar"
                color="bg-gradient-xp"
                delay={0.1}
              />
              <StatCard
                title="Avg. Streak"
                value={Math.round(stats.avg_streak || 0)}
                icon={Flame}
                description="Rata-rata streak aktif"
                color="bg-gradient-streak"
                delay={0.15}
              />
            </div>
          </section>

          {/* Content Stats */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Konten</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Chapters"
                value={stats.total_chapters?.toLocaleString() || 0}
                icon={BookOpen}
                description="Total bab pembelajaran"
                color="bg-gradient-success"
                delay={0.2}
              />
              <StatCard
                title="Lessons"
                value={stats.total_lessons?.toLocaleString() || 0}
                icon={BookOpen}
                description="Total pelajaran"
                color="bg-gradient-success"
                delay={0.25}
              />
              <StatCard
                title="Flashcard Decks"
                value={stats.total_decks?.toLocaleString() || 0}
                icon={Layers}
                description={`${stats.total_flashcards?.toLocaleString() || 0} kartu`}
                color="bg-gradient-indigo"
                delay={0.3}
              />
              <StatCard
                title="Quiz Sets"
                value={stats.total_quiz_sets?.toLocaleString() || 0}
                icon={HelpCircle}
                description={`${stats.total_quiz_questions?.toLocaleString() || 0} pertanyaan`}
                color="bg-secondary"
                delay={0.35}
              />
            </div>
          </section>

          {/* XP Stats */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Engagement</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard
                title="Total XP Earned"
                value={stats.total_xp_earned?.toLocaleString() || 0}
                icon={Zap}
                description="XP yang dikumpulkan semua pengguna"
                color="bg-gradient-xp"
                delay={0.4}
              />
              <StatCard
                title="Active (30 hari)"
                value={stats.active_users_30d?.toLocaleString() || 0}
                icon={Users}
                description="Aktif dalam 30 hari terakhir"
                color="bg-gradient-secondary"
                delay={0.45}
              />
            </div>
          </section>
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-12">
          Tidak dapat memuat statistik
        </div>
      )}
    </AdminLayout>
  );
}
