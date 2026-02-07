import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useStudyTimeDistribution } from '@/hooks/useAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, BookOpen, Target, Layers, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryIcons: Record<string, typeof BookOpen> = {
  lessons: BookOpen,
  quiz: Target,
  flashcard: Layers,
  speaking: Mic
};

export function StudyTimeDistribution() {
  const { data: distribution, isLoading } = useStudyTimeDistribution();

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-4 shadow-card space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  const totalMinutes = distribution?.reduce((sum, d) => sum + d.minutes, 0) || 0;
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm">{data.label}</p>
          <p className="text-xs text-muted-foreground">{data.minutes} menit ({data.percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show label for very small segments
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 shadow-card space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Distribusi Waktu</h3>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-primary">
            {totalHours > 0 && `${totalHours}j `}{remainingMinutes}m
          </p>
          <p className="text-[10px] text-muted-foreground">Total waktu</p>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={70}
              innerRadius={35}
              paddingAngle={2}
              dataKey="minutes"
            >
              {distribution?.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  className="stroke-background stroke-2"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {distribution?.map((item) => {
          const Icon = categoryIcons[item.category] || BookOpen;
          return (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <Icon className="h-4 w-4" style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.minutes} menit</p>
              </div>
              <span 
                className="text-xs font-bold"
                style={{ color: item.color }}
              >
                {item.percentage}%
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
