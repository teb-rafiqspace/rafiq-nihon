import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWeeklyStats } from '@/hooks/useWeeklyProgress';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Clock, Zap, BookOpen, Calendar, Target } from 'lucide-react';

export function WeeklyProgressChart() {
  const { weeklyProgress, isLoading, summary } = useWeeklyStats();

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-4 shadow-card space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  const statCards = [
    {
      icon: Zap,
      label: 'Total XP',
      value: summary.totalXP.toLocaleString(),
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: Clock,
      label: 'Waktu Belajar',
      value: `${summary.totalMinutes} mnt`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: BookOpen,
      label: 'Pelajaran',
      value: summary.totalLessons.toString(),
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Calendar,
      label: 'Hari Aktif',
      value: `${summary.activeDays}/7`,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 shadow-card space-y-4"
    >
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Perkembangan Mingguan</h3>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-2">
        {statCards.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${stat.bgColor} rounded-xl p-2 text-center`}
          >
            <stat.icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
            <div className="text-sm font-bold">{stat.value}</div>
            <div className="text-[10px] text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="xp" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-8">
          <TabsTrigger value="xp" className="text-xs">XP</TabsTrigger>
          <TabsTrigger value="time" className="text-xs">Waktu</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs">Aktivitas</TabsTrigger>
        </TabsList>

        <TabsContent value="xp" className="mt-3">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyProgress}>
                <defs>
                  <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="dayName" 
                  tick={{ fontSize: 10 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  className="text-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="xp"
                  name="XP"
                  stroke="hsl(var(--primary))"
                  fill="url(#xpGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <p className="text-xs text-muted-foreground">
              Rata-rata: <span className="font-semibold text-primary">{summary.avgXPPerDay} XP</span> per hari
            </p>
          </div>
        </TabsContent>

        <TabsContent value="time" className="mt-3">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="dayName" 
                  tick={{ fontSize: 10 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  className="text-muted-foreground"
                  unit=" mnt"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="studyMinutes"
                  name="Menit Belajar"
                  fill="hsl(var(--chart-2))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <p className="text-xs text-muted-foreground">
              Total minggu ini: <span className="font-semibold text-primary">{summary.totalMinutes} menit</span>
            </p>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-3">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="dayName" 
                  tick={{ fontSize: 10 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  className="text-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '10px' }}
                  iconSize={8}
                />
                <Bar dataKey="lessonsCompleted" name="Pelajaran" fill="hsl(var(--chart-1))" stackId="a" />
                <Bar dataKey="quizzesTaken" name="Kuis" fill="hsl(var(--chart-2))" stackId="a" />
                <Bar dataKey="flashcardsReviewed" name="Flashcard" fill="hsl(var(--chart-3))" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <p className="text-xs text-muted-foreground">
              {summary.activeDays} dari 7 hari aktif belajar
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
