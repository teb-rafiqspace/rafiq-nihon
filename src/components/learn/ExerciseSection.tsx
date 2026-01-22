import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FillBlankExercise } from './exercises/FillBlankExercise';
import { SentenceBuildExercise } from './exercises/SentenceBuildExercise';
import { ListeningExercise } from './exercises/ListeningExercise';
import { TranslationExercise } from './exercises/TranslationExercise';
import { Badge } from '@/components/ui/badge';

export type ExerciseType = 'fill-blank' | 'sentence-build' | 'listening' | 'translation';

export interface Exercise {
  id: string;
  type: ExerciseType;
  data: any;
}

interface ExerciseSectionProps {
  exercises: Exercise[];
  onComplete: (correctCount: number, totalCount: number) => void;
}

export function ExerciseSection({ exercises, onComplete }: ExerciseSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  
  const currentExercise = exercises[currentIndex];
  const progress = ((currentIndex + 1) / exercises.length) * 100;
  
  const handleExerciseComplete = (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
    
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // All exercises completed
      const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
      onComplete(finalCorrect, exercises.length);
    }
  };
  
  const getExerciseTypeLabel = (type: ExerciseType) => {
    switch (type) {
      case 'fill-blank': return 'Isi Bagian Kosong';
      case 'sentence-build': return 'Susun Kalimat';
      case 'listening': return 'Mendengarkan';
      case 'translation': return 'Terjemahan';
      default: return 'Latihan';
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="bg-card rounded-xl p-4 shadow-card border border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Latihan</span>
            <Badge variant="outline" className="text-xs">
              {getExerciseTypeLabel(currentExercise?.type)}
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1}/{exercises.length}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Exercise Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {currentExercise?.type === 'fill-blank' && (
            <FillBlankExercise
              sentence={currentExercise.data.sentence}
              hint={currentExercise.data.hint}
              options={currentExercise.data.options}
              correctAnswer={currentExercise.data.correctAnswer}
              translation={currentExercise.data.translation}
              onComplete={handleExerciseComplete}
            />
          )}
          
          {currentExercise?.type === 'sentence-build' && (
            <SentenceBuildExercise
              words={currentExercise.data.words}
              correctOrder={currentExercise.data.correctOrder}
              translation={currentExercise.data.translation}
              onComplete={handleExerciseComplete}
            />
          )}
          
          {currentExercise?.type === 'listening' && (
            <ListeningExercise
              audioText={currentExercise.data.audioText}
              options={currentExercise.data.options}
              correctAnswer={currentExercise.data.correctAnswer}
              onComplete={handleExerciseComplete}
            />
          )}
          
          {currentExercise?.type === 'translation' && (
            <TranslationExercise
              prompt={currentExercise.data.prompt}
              correctAnswers={currentExercise.data.correctAnswers}
              hints={currentExercise.data.hints}
              onComplete={handleExerciseComplete}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
