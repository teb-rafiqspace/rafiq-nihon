import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Trophy, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface LessonQuizProps {
  questions: QuizQuestion[];
  xpReward: number;
  onComplete: (score: number, totalQuestions: number) => void;
}

export function LessonQuiz({ questions, xpReward, onComplete }: LessonQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  
  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  
  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    if (answer === currentQuestion.correctAnswer) {
      setCorrectCount(prev => prev + 1);
    }
  };
  
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };
  
  const handleComplete = () => {
    onComplete(correctCount, questions.length);
  };
  
  if (showResults) {
    const percentage = Math.round((correctCount / questions.length) * 100);
    const earnedXP = Math.round((correctCount / questions.length) * xpReward);
    const isPassing = percentage >= 60;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl p-6 shadow-card border border-border text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
            isPassing ? "bg-success/20" : "bg-destructive/20"
          )}
        >
          {isPassing ? (
            <Trophy className="h-10 w-10 text-success" />
          ) : (
            <XCircle className="h-10 w-10 text-destructive" />
          )}
        </motion.div>
        
        <h2 className="text-2xl font-bold mb-2">
          {isPassing ? 'Selamat! 🎉' : 'Coba Lagi!'}
        </h2>
        
        <p className="text-muted-foreground mb-4">
          {isPassing 
            ? 'Kamu berhasil menyelesaikan kuis ini!' 
            : 'Kamu perlu nilai minimal 60% untuk lulus'
          }
        </p>
        
        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{correctCount}/{questions.length}</p>
            <p className="text-sm text-muted-foreground">Benar</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{percentage}%</p>
            <p className="text-sm text-muted-foreground">Skor</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Zap className="h-5 w-5 text-amber-500" />
              <p className="text-3xl font-bold text-amber-500">+{earnedXP}</p>
            </div>
            <p className="text-sm text-muted-foreground">XP</p>
          </div>
        </div>
        
        <Button 
          variant={isPassing ? "default" : "outline"} 
          size="xl" 
          className="w-full"
          onClick={handleComplete}
        >
          {isPassing ? 'Lanjutkan' : 'Kembali ke Pelajaran'}
        </Button>
      </motion.div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="bg-card rounded-xl p-4 shadow-card border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Kuis</span>
          <span className="text-sm text-muted-foreground">{currentIndex + 1}/{questions.length}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-card rounded-2xl p-6 shadow-card border border-border"
        >
          <p className="text-lg font-medium mb-6">{currentQuestion.questionText}</p>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === currentQuestion.correctAnswer;
              
              let buttonState = 'default';
              if (isAnswered) {
                if (isCorrectOption) buttonState = 'correct';
                else if (isSelected) buttonState = 'incorrect';
              }
              
              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAnswer(option)}
                  disabled={isAnswered}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3",
                    buttonState === 'default' && "border-border hover:border-primary hover:bg-primary/5",
                    buttonState === 'correct' && "border-success bg-success/10",
                    buttonState === 'incorrect' && "border-destructive bg-destructive/10",
                    isSelected && buttonState === 'default' && "border-primary bg-primary/5"
                  )}
                >
                  <span className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2",
                    buttonState === 'default' && "border-border",
                    buttonState === 'correct' && "border-success bg-success text-white",
                    buttonState === 'incorrect' && "border-destructive bg-destructive text-white"
                  )}>
                    {buttonState === 'correct' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : buttonState === 'incorrect' ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </span>
                  <span className={cn(
                    "flex-1 font-medium",
                    buttonState === 'correct' && "text-success",
                    buttonState === 'incorrect' && "text-destructive"
                  )}>
                    {option}
                  </span>
                </motion.button>
              );
            })}
          </div>
          
          {/* Explanation */}
          <AnimatePresence>
            {isAnswered && currentQuestion.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-muted rounded-xl"
              >
                <p className="text-sm">
                  <span className="font-semibold">Penjelasan: </span>
                  {currentQuestion.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
      
      {/* Next Button */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button 
              size="xl" 
              className="w-full gap-2"
              onClick={handleNext}
            >
              {currentIndex < questions.length - 1 ? 'Lanjut' : 'Lihat Hasil'}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
