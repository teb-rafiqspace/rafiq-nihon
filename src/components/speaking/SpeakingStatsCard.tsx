import { motion } from 'framer-motion';
import { Target, MessageCircle, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SpeakingStatsCardProps {
  accuracy: number;
  fluency: number;
  practiceHours: number;
}

export function SpeakingStatsCard({ accuracy, fluency, practiceHours }: SpeakingStatsCardProps) {
  const stats = [
    { 
      icon: Target, 
      label: 'Accuracy', 
      value: `${accuracy}%`, 
      progress: accuracy,
      color: 'text-indigo-500'
    },
    { 
      icon: MessageCircle, 
      label: 'Fluency', 
      value: `${fluency}%`, 
      progress: fluency,
      color: 'text-purple-500'
    },
    { 
      icon: Clock, 
      label: 'Practice', 
      value: `${practiceHours} hrs`, 
      progress: Math.min(practiceHours * 10, 100),
      color: 'text-blue-500'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 shadow-card"
    >
      <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
        📊 YOUR SPEAKING STATS
      </h3>
      
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className={`flex justify-center mb-1 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="text-lg font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground mb-2">{stat.label}</div>
            <Progress 
              value={stat.progress} 
              className="h-1.5"
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
