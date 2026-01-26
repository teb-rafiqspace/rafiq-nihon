import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PracticeModeCardProps {
  icon: string;
  title: string;
  titleJp: string;
  description: string;
  lessonCount: number;
  completedCount?: number;
  color: string;
  onClick: () => void;
  delay?: number;
}

export function PracticeModeCard({
  icon,
  title,
  titleJp,
  description,
  lessonCount,
  completedCount = 0,
  color,
  onClick,
  delay = 0
}: PracticeModeCardProps) {
  const progress = lessonCount > 0 ? (completedCount / lessonCount) * 100 : 0;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full p-4 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg transition-all duration-200 text-left relative overflow-hidden group`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <div className="text-3xl">{icon}</div>
          <ChevronRight className="h-5 w-5 opacity-80 group-hover:translate-x-1 transition-transform" />
        </div>
        
        <h3 className="font-bold text-base mb-0.5">{title}</h3>
        <p className="text-xs opacity-90 mb-2">{description}</p>
        
        <div className="flex items-center justify-between text-xs opacity-90">
          <span>{lessonCount} lessons</span>
          {completedCount > 0 && (
            <span>{completedCount}/{lessonCount}</span>
          )}
        </div>
        
        {completedCount > 0 && (
          <Progress 
            value={progress} 
            className="h-1 mt-2 bg-white/30"
          />
        )}
      </div>
    </motion.button>
  );
}
