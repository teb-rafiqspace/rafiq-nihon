import { motion } from 'framer-motion';
import { Clock, FileText, ChevronRight, CheckCircle, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface WritingPromptCardProps {
  title: string;
  taskType: string;
  taskTypeLabel: string;
  wordLimitMin: number;
  wordLimitMax: number;
  timeLimitMinutes: number;
  difficulty: number;
  isPremium: boolean;
  isLocked: boolean;
  submissionCount: number;
  onClick: () => void;
  delay?: number;
}

export function WritingPromptCard({
  title,
  taskTypeLabel,
  wordLimitMin,
  wordLimitMax,
  timeLimitMinutes,
  difficulty,
  isPremium,
  isLocked,
  submissionCount,
  onClick,
  delay = 0,
}: WritingPromptCardProps) {
  const difficultyLabel = ['', 'Easy', 'Medium', 'Hard', 'Advanced', 'Expert'][difficulty] || '';

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        "w-full bg-card rounded-xl p-4 shadow-card hover:shadow-elevated transition-all text-left border border-border",
        isLocked && "opacity-60 cursor-not-allowed"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          submissionCount > 0
            ? "bg-success text-white"
            : "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
        )}>
          {submissionCount > 0 ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <FileText className="h-5 w-5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {taskTypeLabel}
            </Badge>
            {isPremium && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Premium
              </Badge>
            )}
          </div>

          <h3 className="font-semibold text-sm mb-2 line-clamp-2">{title}</h3>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{wordLimitMin}-{wordLimitMax} words</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{timeLimitMinutes} min</span>
            </div>
            <span className={cn(
              "px-1.5 py-0.5 rounded text-xs",
              difficulty <= 2 ? "bg-success/10 text-success" :
              difficulty <= 3 ? "bg-amber-500/10 text-amber-600" :
              "bg-destructive/10 text-destructive"
            )}>
              {difficultyLabel}
            </span>
          </div>

          {submissionCount > 0 && (
            <p className="text-xs text-success mt-1">
              {submissionCount} submission{submissionCount > 1 ? 's' : ''}
            </p>
          )}
        </div>

        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
      </div>
    </motion.button>
  );
}
