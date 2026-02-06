import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Target, Layers, Mic, 
  ChevronRight, CheckCircle2, Clock, AlertCircle,
  Trophy, Flame, BookOpen
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useProgressTracking, TopicProgress, TrackProgress } from '@/hooks/useProgressTracking';
import { cn } from '@/lib/utils';

const categoryLabels: Record<string, string> = {
  grammar: 'Tata Bahasa',
  vocabulary: 'Kosakata',
  reading: 'Membaca',
  kana: 'Kana',
  numbers: 'Angka',
  workplace: 'Tempat Kerja',
  daily_life: 'Kehidupan Sehari-hari',
  social: 'Sosial',
  travel: 'Perjalanan',
  business: 'Bisnis',
  keigo: 'Bahasa Hormat',
  opinion: 'Menyatakan Pendapat',
  problem_solving: 'Penyelesaian Masalah',
  greetings: 'Salam',
  pronunciation: 'Pengucapan'
};

const typeIcons = {
  quiz: Target,
  flashcard: Layers,
  speaking: Mic
};

const typeLabels = {
  quiz: 'Kuis',
  flashcard: 'Flashcard',
  speaking: 'Speaking'
};

interface TopicCardProps {
  topic: TopicProgress;
}

function TopicCard({ topic }: TopicCardProps) {
  const Icon = typeIcons[topic.type];
  
  const statusConfig = {
    mastered: { color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2, label: 'Dikuasai' },
    in_progress: { color: 'text-warning', bg: 'bg-warning/10', icon: Clock, label: 'Sedang Belajar' },
    not_started: { color: 'text-muted-foreground', bg: 'bg-muted', icon: AlertCircle, label: 'Belum Mulai' }
  };

  const config = statusConfig[topic.status];
  const StatusIcon = config.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-3 rounded-xl border transition-all",
        topic.status === 'mastered' && "border-success/30 bg-success/5",
        topic.status === 'in_progress' && "border-warning/30 bg-warning/5",
        topic.status === 'not_started' && "border-border bg-card"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg", config.bg)}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm truncate">{topic.title}</h4>
            <StatusIcon className={cn("h-4 w-4 flex-shrink-0", config.color)} />
          </div>
          <p className="text-xs text-muted-foreground truncate">{topic.titleJp}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground">
              {typeLabels[topic.type]}
            </span>
            {topic.bestScore !== null && (
              <span className={cn("text-xs font-medium", config.color)}>
                {topic.bestScore}%
              </span>
            )}
            {topic.attempts > 0 && (
              <span className="text-xs text-muted-foreground">
                {topic.attempts}x latihan
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface TrackSectionProps {
  trackProgress: TrackProgress;
  topics: TopicProgress[];
  isExpanded: boolean;
  onToggle: () => void;
}

function TrackSection({ trackProgress, topics, isExpanded, onToggle }: TrackSectionProps) {
  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden">
      <button 
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">{trackProgress.label}</h3>
            <p className="text-sm text-muted-foreground">
              {trackProgress.masteredTopics}/{trackProgress.totalTopics} topik dikuasai
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-lg font-bold text-primary">{trackProgress.overallPercentage}%</span>
          </div>
          <ChevronRight className={cn(
            "h-5 w-5 text-muted-foreground transition-transform",
            isExpanded && "rotate-90"
          )} />
        </div>
      </button>
      
      <div className="px-4 pb-1">
        <Progress value={trackProgress.overallPercentage} className="h-2" />
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-2 space-y-4">
              {trackProgress.categories.map(cat => (
                <div key={cat.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {categoryLabels[cat.category] || cat.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {cat.mastered}/{cat.total}
                    </span>
                  </div>
                  <Progress value={cat.percentage} className="h-1.5" />
                </div>
              ))}
              
              <div className="grid gap-2 pt-2">
                {topics.map(topic => (
                  <TopicCard key={`${topic.type}-${topic.id}`} topic={topic} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProgressOverview() {
  const { 
    overallStats, 
    trackProgress, 
    weakTopics, 
    recentlyPracticed,
    getTopicsByTrack 
  } = useProgressTracking();
  
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-primary/20">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Progres Keseluruhan</h2>
            <p className="text-sm text-muted-foreground">
              {overallStats.mastered} dari {overallStats.total} topik dikuasai
            </p>
          </div>
        </div>
        
        <Progress value={overallStats.percentage} className="h-3 mb-4" />
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-success/10 rounded-xl p-3 text-center">
            <CheckCircle2 className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">{overallStats.mastered}</p>
            <p className="text-xs text-muted-foreground">Dikuasai</p>
          </div>
          <div className="bg-warning/10 rounded-xl p-3 text-center">
            <Clock className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-warning">{overallStats.inProgress}</p>
            <p className="text-xs text-muted-foreground">Belajar</p>
          </div>
          <div className="bg-muted rounded-xl p-3 text-center">
            <AlertCircle className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-bold">{overallStats.notStarted}</p>
            <p className="text-xs text-muted-foreground">Belum</p>
          </div>
        </div>
      </motion.div>

      {/* Weak Topics - Need Improvement */}
      {weakTopics.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-4 shadow-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold">Perlu Latihan Lagi</h3>
          </div>
          <div className="space-y-2">
            {weakTopics.slice(0, 3).map(topic => (
              <TopicCard key={`weak-${topic.type}-${topic.id}`} topic={topic} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Recently Practiced */}
      {recentlyPracticed.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl p-4 shadow-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Terakhir Dipelajari</h3>
          </div>
          <div className="space-y-2">
            {recentlyPracticed.map(topic => (
              <TopicCard key={`recent-${topic.type}-${topic.id}`} topic={topic} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Progress by Track */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Progres per Track
        </h3>
        {trackProgress.map((track, index) => (
          <motion.div
            key={track.track}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
          >
            <TrackSection
              trackProgress={track}
              topics={getTopicsByTrack(track.track)}
              isExpanded={expandedTrack === track.track}
              onToggle={() => setExpandedTrack(
                expandedTrack === track.track ? null : track.track
              )}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
