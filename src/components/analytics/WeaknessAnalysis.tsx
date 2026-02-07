import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWeaknessAnalysis, WeaknessItem } from '@/hooks/useAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Target, 
  Layers, 
  Mic, 
  ChevronRight,
  TrendingUp,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const typeIcons: Record<string, typeof Target> = {
  quiz: Target,
  flashcard: Layers,
  speaking: Mic
};

const typeLabels: Record<string, string> = {
  quiz: 'Kuis',
  flashcard: 'Flashcard',
  speaking: 'Speaking'
};

const typeColors: Record<string, string> = {
  quiz: 'text-chart-2 bg-chart-2/10',
  flashcard: 'text-chart-3 bg-chart-3/10',
  speaking: 'text-chart-4 bg-chart-4/10'
};

interface WeaknessCardProps {
  weakness: WeaknessItem;
  index: number;
}

function WeaknessCard({ weakness, index }: WeaknessCardProps) {
  const navigate = useNavigate();
  const Icon = typeIcons[weakness.type];
  const colorClass = typeColors[weakness.type];

  const handlePractice = () => {
    if (weakness.type === 'quiz') {
      navigate(`/practice?tab=quiz`);
    } else if (weakness.type === 'flashcard') {
      navigate(`/flashcard?deck=${weakness.id}`);
    } else if (weakness.type === 'speaking') {
      navigate(`/speaking`);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-destructive';
    if (score < 50) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-muted/30 rounded-xl p-3 space-y-2"
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg", colorClass)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{weakness.title}</h4>
          <p className="text-xs text-muted-foreground truncate">{weakness.titleJp}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground">{typeLabels[weakness.type]}</span>
            <span className="text-[10px] text-muted-foreground">•</span>
            <span className="text-[10px] text-muted-foreground">{weakness.attempts}x latihan</span>
            {weakness.lastAttempt && (
              <>
                <span className="text-[10px] text-muted-foreground">•</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(weakness.lastAttempt), { addSuffix: true, locale: id })}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className={cn("text-lg font-bold", getScoreColor(weakness.score))}>
            {weakness.score}%
          </span>
        </div>
      </div>

      <Progress 
        value={weakness.score} 
        className={cn(
          "h-1.5",
          weakness.score < 30 && "[&>div]:bg-destructive",
          weakness.score >= 30 && weakness.score < 50 && "[&>div]:bg-warning"
        )} 
      />

      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lightbulb className="h-3 w-3" />
          <span className="truncate">{weakness.recommendation}</span>
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-7 px-2 text-xs"
          onClick={handlePractice}
        >
          Latih
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}

export function WeaknessAnalysis() {
  const { data: weaknesses, isLoading } = useWeaknessAnalysis();

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-4 shadow-card space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!weaknesses || weaknesses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-4 shadow-card"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-success" />
          <h3 className="font-semibold">Analisis Kelemahan</h3>
        </div>
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="h-8 w-8 text-success" />
          </div>
          <h4 className="font-medium text-success mb-1">Luar Biasa! 🎉</h4>
          <p className="text-sm text-muted-foreground">
            Tidak ada kelemahan terdeteksi. Terus tingkatkan kemampuanmu!
          </p>
        </div>
      </motion.div>
    );
  }

  // Group by type
  const groupedByType = weaknesses.reduce((acc, w) => {
    if (!acc[w.type]) acc[w.type] = [];
    acc[w.type].push(w);
    return acc;
  }, {} as Record<string, WeaknessItem[]>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 shadow-card space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <h3 className="font-semibold">Analisis Kelemahan</h3>
        </div>
        <span className="text-xs text-muted-foreground">{weaknesses.length} topik</span>
      </div>

      {/* Summary by type */}
      <div className="flex gap-2">
        {Object.entries(groupedByType).map(([type, items]) => {
          const Icon = typeIcons[type];
          return (
            <div 
              key={type} 
              className={cn("flex-1 p-2 rounded-lg text-center", typeColors[type])}
            >
              <Icon className="h-4 w-4 mx-auto mb-1" />
              <p className="text-xs font-medium">{items.length}</p>
              <p className="text-[10px] opacity-70">{typeLabels[type]}</p>
            </div>
          );
        })}
      </div>

      {/* Weakness list */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {weaknesses.map((weakness, index) => (
          <WeaknessCard key={`${weakness.type}-${weakness.id}`} weakness={weakness} index={index} />
        ))}
      </div>
    </motion.div>
  );
}
