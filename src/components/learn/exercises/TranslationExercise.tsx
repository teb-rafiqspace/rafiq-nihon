import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Volume2, Loader2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface TranslationExerciseProps {
  prompt: string; // Indonesian sentence
  correctAnswers: string[]; // Multiple acceptable Japanese answers
  hints?: string[];
  onComplete: (isCorrect: boolean) => void;
}

export function TranslationExercise({
  prompt,
  correctAnswers,
  hints = [],
  onComplete,
}: TranslationExerciseProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Normalize for comparison (remove spaces, punctuation differences)
  const normalizeAnswer = (text: string) => {
    return text
      .trim()
      .replace(/\s+/g, '')
      .replace(/[。、！？]/g, '')
      .replace(/[.!?,]/g, '');
  };
  
  const isCorrect = correctAnswers.some(
    answer => normalizeAnswer(userAnswer) === normalizeAnswer(answer)
  );
  
  const handleCheck = () => {
    if (userAnswer.trim()) {
      setIsChecked(true);
    }
  };
  
  const handleShowHint = () => {
    if (currentHintIndex < hints.length) {
      setShowHint(true);
      setCurrentHintIndex(prev => Math.min(prev + 1, hints.length));
    }
  };
  
  const handleNext = () => {
    onComplete(isCorrect);
  };
  
  const speakAnswer = () => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(correctAnswers[0]);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    speechSynthesis.speak(utterance);
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
        {/* Instruction */}
        <p className="text-sm text-muted-foreground font-medium mb-2">
          Terjemahkan ke dalam bahasa Jepang:
        </p>
        
        {/* Prompt */}
        <p className="text-xl font-semibold mb-6">
          "{prompt}"
        </p>
        
        {/* Hints */}
        {showHint && hints.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4"
          >
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                💡 {hints.slice(0, currentHintIndex).join(' • ')}
              </p>
            </div>
          </motion.div>
        )}
        
        {/* Answer Input */}
        <div className="space-y-3">
          <Textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Ketik jawabanmu dalam huruf Jepang..."
            disabled={isChecked}
            className={cn(
              "font-jp text-lg min-h-[100px] resize-none",
              isChecked && isCorrect && "border-success bg-success/5",
              isChecked && !isCorrect && "border-destructive bg-destructive/5"
            )}
          />
          
          {!isChecked && hints.length > 0 && currentHintIndex < hints.length && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShowHint}
              className="gap-2 text-muted-foreground"
            >
              <HelpCircle className="h-4 w-4" />
              {showHint ? 'Petunjuk lagi' : 'Butuh petunjuk?'}
            </Button>
          )}
        </div>
        
        {/* Feedback */}
        <AnimatePresence>
          {isChecked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              <div className={cn(
                "p-4 rounded-xl",
                isCorrect ? "bg-success/10" : "bg-destructive/10"
              )}>
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={cn(
                      "font-semibold mb-2",
                      isCorrect ? "text-success" : "text-destructive"
                    )}>
                      {isCorrect ? 'Benar!' : 'Kurang tepat!'}
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                      Jawaban yang diterima:
                    </p>
                    {correctAnswers.map((answer, idx) => (
                      <p key={idx} className="font-jp font-semibold text-foreground">
                        {answer}
                      </p>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={speakAnswer}
                    className="flex-shrink-0"
                  >
                    {isPlaying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Action Button */}
      {!isChecked ? (
        <Button
          size="xl"
          className="w-full"
          onClick={handleCheck}
          disabled={!userAnswer.trim()}
        >
          Periksa Jawaban
        </Button>
      ) : (
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
    </div>
  );
}
