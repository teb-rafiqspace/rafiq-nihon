import { motion } from 'framer-motion';
import { HelpCircle, Type, Clock, Puzzle, Zap, MapPin, Briefcase, Flame } from 'lucide-react';
import { QuizSet } from '@/hooks/useQuizPractice';

const iconMap: Record<string, React.ReactNode> = {
  'Type': <Type className="h-6 w-6" />,
  'Clock': <Clock className="h-6 w-6" />,
  'Puzzle': <Puzzle className="h-6 w-6" />,
  'Zap': <Zap className="h-6 w-6" />,
  'MapPin': <MapPin className="h-6 w-6" />,
  'Briefcase': <Briefcase className="h-6 w-6" />,
  'Flame': <Flame className="h-6 w-6" />,
  'HelpCircle': <HelpCircle className="h-6 w-6" />
};

interface QuizGridProps {
  quizSets: QuizSet[];
  getBestPercentage: (quizSetId: string) => number | null;
  onSelectQuiz: (quiz: QuizSet) => void;
}

export function QuizGrid({ quizSets, getBestPercentage, onSelectQuiz }: QuizGridProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📚</span>
        <h3 className="font-semibold text-lg">Latihan per Topik</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quizSets.map((quiz, index) => {
          const bestScore = getBestPercentage(quiz.id);
          const icon = iconMap[quiz.icon_name || 'HelpCircle'] || iconMap['HelpCircle'];

          return (
            <motion.button
              key={quiz.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectQuiz(quiz)}
              className="bg-card rounded-xl p-4 text-left border border-border hover:border-primary/30 hover:shadow-lg transition-all active:scale-95"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3"
                style={{ backgroundColor: quiz.color || '#3B82F6' }}
              >
                {icon}
              </div>

              <p className="font-bold text-lg leading-tight">{quiz.title_jp}</p>
              <p className="text-sm text-muted-foreground mb-2">{quiz.title_id}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {quiz.question_count} soal
                </span>
                <span className={`text-xs font-medium ${
                  bestScore !== null 
                    ? bestScore >= 80 
                      ? 'text-green-600' 
                      : bestScore >= 60 
                        ? 'text-amber-600' 
                        : 'text-red-600'
                    : 'text-muted-foreground'
                }`}>
                  {bestScore !== null ? `Best: ${bestScore}%` : 'Best: --'}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
