import { motion } from 'framer-motion';
import { useKanaStats } from '@/hooks/useKana';
import { Trophy, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanaProgressCardProps {
  type: 'hiragana' | 'katakana';
}

export function KanaProgressCard({ type }: KanaProgressCardProps) {
  const stats = useKanaStats(type);
  
  const isMaster = stats.percentage === 100;
  const label = type === 'hiragana' ? 'Hiragana' : 'Katakana';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl p-5 border relative overflow-hidden",
        isMaster 
          ? "bg-gradient-success border-success/30" 
          : "bg-card border-border shadow-card"
      )}
    >
      {isMaster && (
        <div className="absolute inset-0 bg-[url('/sparkles.svg')] opacity-20" />
      )}
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isMaster ? (
              <Trophy className="h-5 w-5 text-white" />
            ) : (
              <BookOpen className="h-5 w-5 text-primary" />
            )}
            <h3 className={cn(
              "font-semibold",
              isMaster ? "text-white" : "text-foreground"
            )}>
              {label}
            </h3>
          </div>
          
          {isMaster && (
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
              <Sparkles className="h-3 w-3 text-white" />
              <span className="text-xs text-white font-medium">Master!</span>
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className={cn(
          "h-3 rounded-full overflow-hidden mb-3",
          isMaster ? "bg-white/20" : "bg-muted"
        )}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              isMaster ? "bg-white" : "bg-gradient-primary"
            )}
          />
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div>
              <span className={cn(
                "font-bold",
                isMaster ? "text-white" : "text-success"
              )}>
                {stats.learned}
              </span>
              <span className={cn(
                "ml-1",
                isMaster ? "text-white/80" : "text-muted-foreground"
              )}>
                dipelajari
              </span>
            </div>
            {stats.learning > 0 && (
              <div>
                <span className={cn(
                  "font-bold",
                  isMaster ? "text-white" : "text-primary"
                )}>
                  {stats.learning}
                </span>
                <span className={cn(
                  "ml-1",
                  isMaster ? "text-white/80" : "text-muted-foreground"
                )}>
                  sedang belajar
                </span>
              </div>
            )}
          </div>
          
          <span className={cn(
            "font-bold text-lg",
            isMaster ? "text-white" : "text-foreground"
          )}>
            {stats.percentage}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}
