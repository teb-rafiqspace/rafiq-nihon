import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FillBlankExerciseProps {
  sentence: string; // Japanese sentence with ___ for blank
  hint?: string;
  options: string[];
  correctAnswer: string;
  translation: string;
  onComplete: (isCorrect: boolean) => void;
}

export function FillBlankExercise({
  sentence,
  hint,
  options,
  correctAnswer,
  translation,
  onComplete,
}: FillBlankExerciseProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const isCorrect = selectedAnswer === correctAnswer;
  
  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);
  };
  
  const handleNext = () => {
    onComplete(isCorrect);
  };
  
  const speakSentence = () => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    
    const fullSentence = sentence.replace('___', correctAnswer);
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(fullSentence);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    speechSynthesis.speak(utterance);
  };
  
  // Split sentence at blank
  const parts = sentence.split('___');
  
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
        {/* Instruction */}
        <p className="text-sm text-muted-foreground font-medium mb-4">
          Lengkapi dengan bentuk yang benar:
        </p>
        
        {/* Sentence with blank */}
        <div className="text-center mb-6">
          <p className="font-jp text-2xl leading-relaxed">
            {parts[0]}
            <span className={cn(
              "inline-block min-w-[80px] mx-1 px-3 py-1 rounded-lg border-2 border-dashed transition-all",
              isAnswered && isCorrect && "border-success bg-success/10",
              isAnswered && !isCorrect && "border-destructive bg-destructive/10",
              !isAnswered && "border-primary/50 bg-primary/5"
            )}>
              {selectedAnswer || '___'}
            </span>
            {parts[1]}
          </p>
          
          {hint && !isAnswered && (
            <p className="text-sm text-muted-foreground mt-2">
              ({hint})
            </p>
          )}
        </div>
        
        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === correctAnswer;
            
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
                transition={{ delay: index * 0.05 }}
                onClick={() => handleAnswer(option)}
                disabled={isAnswered}
                className={cn(
                  "p-4 rounded-xl border-2 font-jp text-lg font-medium transition-all",
                  buttonState === 'default' && "border-border hover:border-primary hover:bg-primary/5",
                  buttonState === 'correct' && "border-success bg-success/10 text-success",
                  buttonState === 'incorrect' && "border-destructive bg-destructive/10 text-destructive",
                  isSelected && buttonState === 'default' && "border-primary bg-primary/5"
                )}
              >
                {option}
              </motion.button>
            );
          })}
        </div>
        
        {/* Feedback */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              <div className={cn(
                "p-4 rounded-xl flex items-start gap-3",
                isCorrect ? "bg-success/10" : "bg-destructive/10"
              )}>
                {isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={cn(
                    "font-semibold",
                    isCorrect ? "text-success" : "text-destructive"
                  )}>
                    {isCorrect ? 'Benar!' : 'Kurang tepat!'}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Jawaban yang benar: <span className="font-jp font-semibold">{correctAnswer}</span>
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    {translation}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={speakSentence}
                  className="flex-shrink-0"
                >
                  {isPlaying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Next Button */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              size="xl"
              className="w-full"
              onClick={handleNext}
            >
              Lanjut
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
