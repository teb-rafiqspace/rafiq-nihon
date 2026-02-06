import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Target, Lightbulb, TrendingUp } from 'lucide-react';
import { useRecommendations, Recommendation } from '@/hooks/useRecommendations';
import { cn } from '@/lib/utils';

const TYPE_ICONS: Record<Recommendation['type'], string> = {
  quiz: '📝',
  flashcard: '🎴',
  speaking: '🎤'
};

const PRIORITY_STYLES: Record<Recommendation['priority'], string> = {
  high: 'border-l-destructive bg-destructive/10',
  medium: 'border-l-warning bg-warning/10',
  low: 'border-l-primary bg-primary/10'
};

function RecommendationItem({ 
  rec, 
  index, 
  onClick 
}: { 
  rec: Recommendation; 
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl border-l-4 transition-all text-left",
        PRIORITY_STYLES[rec.priority]
      )}
    >
      <div className="text-2xl">{TYPE_ICONS[rec.type]}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
            {rec.reasonIcon} {rec.reason}
          </span>
          {rec.bestScore !== null && (
            <span className={cn(
              "text-xs font-medium",
              rec.bestScore < 60 ? "text-destructive" : "text-warning"
            )}>
              {rec.bestScore}%
            </span>
          )}
        </div>
        <p className="font-medium text-sm truncate">{rec.title}</p>
        <p className="text-xs text-muted-foreground font-jp truncate">{rec.titleJp}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    </motion.button>
  );
}

export function RecommendationCard() {
  const navigate = useNavigate();
  const { 
    recommendations, 
    overallSuggestion, 
    hasWeakTopics,
    weakTopicsCount 
  } = useRecommendations(4);

  if (recommendations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl shadow-elevated p-5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Rekomendasi Belajar</h2>
            <p className="text-xs text-muted-foreground">Saran berdasarkan progressmu</p>
          </div>
        </div>
        <div className="text-center py-6">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-muted-foreground">
            Mulai latihan untuk mendapatkan rekomendasi personal!
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl shadow-elevated p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Rekomendasi Untukmu</h2>
            <p className="text-xs text-muted-foreground">
              {hasWeakTopics 
                ? `${weakTopicsCount} topik perlu diperkuat`
                : 'Saran belajar hari ini'
              }
            </p>
          </div>
        </div>
        {hasWeakTopics && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-sm font-bold"
          >
            {weakTopicsCount}
          </motion.div>
        )}
      </div>

      {/* Overall Suggestion */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-muted/50 rounded-xl p-3 mb-4 flex items-center gap-3"
      >
        <TrendingUp className="h-5 w-5 text-primary flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          {overallSuggestion.message}
        </p>
      </motion.div>

      {/* Recommendations List */}
      <div className="space-y-2">
        {recommendations.map((rec, index) => (
          <RecommendationItem
            key={rec.id}
            rec={rec}
            index={index}
            onClick={() => navigate(rec.route)}
          />
        ))}
      </div>

      {/* View All Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => navigate('/practice?tab=progres')}
        className="w-full mt-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-colors"
      >
        Lihat Semua Progress →
      </motion.button>
    </motion.div>
  );
}
