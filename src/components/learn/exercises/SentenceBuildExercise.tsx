import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { CheckCircle, XCircle, Volume2, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SentenceBuildExerciseProps {
  words: string[]; // Shuffled words
  correctOrder: string[]; // Correct word order
  translation: string;
  onComplete: (isCorrect: boolean) => void;
}

export function SentenceBuildExercise({
  words: initialWords,
  correctOrder,
  translation,
  onComplete,
}: SentenceBuildExerciseProps) {
  const [availableWords, setAvailableWords] = useState(initialWords);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const isCorrect = selectedWords.join('') === correctOrder.join('');
  
  const handleWordClick = (word: string, index: number) => {
    if (isChecked) return;
    
    const newAvailable = [...availableWords];
    newAvailable.splice(index, 1);
    setAvailableWords(newAvailable);
    setSelectedWords([...selectedWords, word]);
  };
  
  const handleSelectedWordClick = (word: string, index: number) => {
    if (isChecked) return;
    
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
    setAvailableWords([...availableWords, word]);
  };
  
  const handleCheck = () => {
    setIsChecked(true);
  };
  
  const handleReset = () => {
    setAvailableWords(initialWords);
    setSelectedWords([]);
    setIsChecked(false);
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
    
    const sentence = correctOrder.join('');
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(sentence);
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
          Susun kata-kata untuk membuat kalimat yang benar:
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          "{translation}"
        </p>
        
        {/* Answer Area */}
        <div className={cn(
          "min-h-[80px] p-4 rounded-xl border-2 border-dashed mb-6 flex flex-wrap gap-2 items-start",
          isChecked && isCorrect && "border-success bg-success/5",
          isChecked && !isCorrect && "border-destructive bg-destructive/5",
          !isChecked && selectedWords.length > 0 && "border-primary/50 bg-primary/5",
          !isChecked && selectedWords.length === 0 && "border-muted-foreground/30"
        )}>
          {selectedWords.length === 0 ? (
            <p className="text-muted-foreground text-sm">Ketuk kata-kata di bawah untuk menyusun kalimat...</p>
          ) : (
            selectedWords.map((word, index) => (
              <motion.button
                key={`selected-${index}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={() => handleSelectedWordClick(word, index)}
                disabled={isChecked}
                className={cn(
                  "px-4 py-2 rounded-lg font-jp text-lg font-medium transition-all",
                  !isChecked && "bg-primary text-primary-foreground hover:bg-primary/90",
                  isChecked && isCorrect && "bg-success text-success-foreground",
                  isChecked && !isCorrect && "bg-muted"
                )}
              >
                {word}
              </motion.button>
            ))
          )}
        </div>
        
        {/* Available Words */}
        <div className="flex flex-wrap gap-2 justify-center min-h-[60px]">
          <AnimatePresence mode="popLayout">
            {availableWords.map((word, index) => (
              <motion.button
                key={`available-${word}-${index}`}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={() => handleWordClick(word, index)}
                disabled={isChecked}
                className="px-4 py-2 rounded-lg border-2 border-border bg-muted/50 font-jp text-lg font-medium hover:border-primary hover:bg-primary/5 transition-all"
              >
                {word}
              </motion.button>
            ))}
          </AnimatePresence>
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
                      Jawaban yang benar: <span className="font-jp font-semibold">{correctOrder.join('')}</span>
                    </p>
                  )}
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
      
      {/* Action Buttons */}
      <div className="flex gap-3">
        {!isChecked ? (
          <>
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={handleReset}
              disabled={selectedWords.length === 0}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              size="lg"
              className="flex-1"
              onClick={handleCheck}
              disabled={availableWords.length > 0}
            >
              Periksa Jawaban
            </Button>
          </>
        ) : (
          <Button
            size="xl"
            className="w-full"
            onClick={handleNext}
          >
            Lanjut
          </Button>
        )}
      </div>
    </div>
  );
}
