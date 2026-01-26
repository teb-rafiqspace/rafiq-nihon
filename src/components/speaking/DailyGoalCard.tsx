import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DailyGoalCardProps {
  currentMinutes: number;
  goalMinutes: number;
}

export function DailyGoalCard({ currentMinutes, goalMinutes }: DailyGoalCardProps) {
  const progress = Math.min((currentMinutes / goalMinutes) * 100, 100);
  const isComplete = currentMinutes >= goalMinutes;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 shadow-card"
    >
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        DAILY SPEAKING GOAL
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">
            {isComplete ? '✅ Goal completed!' : `Practice ${goalMinutes} minutes today`}
          </span>
          <span className="text-sm font-semibold">
            {currentMinutes}/{goalMinutes} min
          </span>
        </div>
        
        <Progress 
          value={progress} 
          className={`h-3 ${isComplete ? 'bg-success/20' : ''}`}
        />
        
        {isComplete && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-success text-center"
          >
            🎉 Great job! Keep up the momentum!
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
