import { motion } from 'framer-motion';
import { format, parseISO, startOfWeek, addDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { useActivityHeatmap, DailyActivity } from '@/hooks/useAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const intensityColors = [
  'bg-muted',
  'bg-success/20',
  'bg-success/40',
  'bg-success/60',
  'bg-success'
];

export function ActivityHeatmap() {
  const { data: activities, isLoading } = useActivityHeatmap();

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-4 shadow-card space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Group activities by week
  const weeks: DailyActivity[][] = [];
  let currentWeek: DailyActivity[] = [];

  activities?.forEach((activity, index) => {
    const date = parseISO(activity.date);
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    
    currentWeek.push(activity);
    
    if (index === (activities?.length || 0) - 1) {
      weeks.push(currentWeek);
    }
  });

  // Calculate stats
  const totalXP = activities?.reduce((sum, a) => sum + a.xp, 0) || 0;
  const totalMinutes = activities?.reduce((sum, a) => sum + a.minutesStudied, 0) || 0;
  const activeDays = activities?.filter(a => a.intensity > 0).length || 0;

  const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 shadow-card space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Aktivitas Belajar</h3>
        </div>
        <span className="text-xs text-muted-foreground">90 hari terakhir</span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-muted/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-primary">{activeDays}</p>
          <p className="text-[10px] text-muted-foreground">Hari Aktif</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-primary">{totalXP.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Total XP</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-primary">{Math.round(totalMinutes / 60)}j</p>
          <p className="text-[10px] text-muted-foreground">Jam Belajar</p>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1">
            {dayLabels.map((day, i) => (
              <div key={day} className="h-3 flex items-center">
                {i % 2 === 1 && (
                  <span className="text-[8px] text-muted-foreground w-6">{day}</span>
                )}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <TooltipProvider delayDuration={100}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const activity = week.find(a => {
                    const date = parseISO(a.date);
                    return date.getDay() === dayIndex;
                  });

                  if (!activity) {
                    return <div key={dayIndex} className="w-3 h-3" />;
                  }

                  return (
                    <Tooltip key={dayIndex}>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: weekIndex * 0.01 }}
                          className={cn(
                            "w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
                            intensityColors[activity.intensity]
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <div className="space-y-1">
                          <p className="font-medium">
                            {format(parseISO(activity.date), 'EEEE, d MMMM', { locale: id })}
                          </p>
                          <div className="flex items-center gap-2">
                            <span>{activity.xp} XP</span>
                            <span>•</span>
                            <span>{activity.minutesStudied} menit</span>
                          </div>
                          {activity.itemsStudied > 0 && (
                            <p className="text-muted-foreground">
                              {activity.itemsStudied} item dipelajari
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </TooltipProvider>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-[10px] text-muted-foreground">Sedikit</span>
        {intensityColors.map((color, i) => (
          <div key={i} className={cn("w-3 h-3 rounded-sm", color)} />
        ))}
        <span className="text-[10px] text-muted-foreground">Banyak</span>
      </div>
    </motion.div>
  );
}
