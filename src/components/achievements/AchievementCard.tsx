import { motion } from 'framer-motion';
import { Lock, Check } from 'lucide-react';
import { AchievementProgress, BADGE_ICONS } from '@/hooks/useAchievements';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AchievementCardProps {
  achievement: AchievementProgress;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export function AchievementCard({ 
  achievement, 
  size = 'md',
  showProgress = true 
}: AchievementCardProps) {
  const { badge, earned, progress, currentValue, targetValue } = achievement;
  const icon = BADGE_ICONS[badge.icon] || '🎯';
  
  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };
  
  const iconSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative p-4 rounded-2xl border transition-all",
        earned 
          ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30"
          : "bg-muted/30 border-border"
      )}
    >
      {/* Badge icon */}
      <div className="flex items-center gap-4">
        <div className={cn(
          "relative flex items-center justify-center rounded-xl",
          sizeClasses[size],
          earned 
            ? "bg-gradient-to-br from-primary/20 to-accent/20"
            : "bg-muted"
        )}>
          <span className={iconSizes[size]}>
            {earned ? icon : <Lock className="h-6 w-6 text-muted-foreground" />}
          </span>
          
          {/* Earned indicator */}
          {earned && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <Check className="h-3 w-3 text-primary-foreground" />
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-semibold truncate",
            earned ? "text-foreground" : "text-muted-foreground"
          )}>
            {badge.name}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {badge.description}
          </p>
          
          {/* Progress */}
          {showProgress && !earned && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{currentValue}</span>
                <span>{targetValue}</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}
          
          {earned && (
            <p className="text-xs text-primary mt-1 font-medium">
              ✓ Tercapai
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
