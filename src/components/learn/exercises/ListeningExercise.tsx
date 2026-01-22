import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Loader2, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ListeningExerciseProps {
  audioText: string; // Japanese text to speak
  options: { label: string; value: string }[];
  correctAnswer: string;
  onComplete: (isCorrect: boolean) => void;
}

export function ListeningExercise({
  audioText,
  options,
  correctAnswer,
  onComplete,
}: ListeningExerciseProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  const isCorrect = selectedAnswer === correctAnswer;
  
  useEffect(() => {
    const findBestVoice = () => {
      const voices = speechSynthesis.getVoices();
      const japaneseVoices = voices.filter(voice => voice.lang.startsWith('ja'));
      
      if (japaneseVoices.length === 0) return;
      
      const femaleVoiceKeywords = ['haruka', 'nanami', 'ayumi', 'kyoko', 'mizuki', 'female'];
      
      let bestVoice = japaneseVoices.find(voice => {
        const nameLower = voice.name.toLowerCase();
        return femaleVoiceKeywords.some(keyword => nameLower.includes(keyword));
      });
      
      if (!bestVoice) {
        bestVoice = japaneseVoices.find(v => v.name.includes('Google')) || japaneseVoices[0];
      }
      
      setSelectedVoice(bestVoice);
    };
    
    findBestVoice();
    speechSynthesis.onvoiceschanged = findBestVoice;
    
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);
  
  const playAudio = useCallback(() => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(audioText);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      setPlayCount(prev => prev + 1);
    };
    utterance.onerror = () => setIsPlaying(false);
    
    speechSynthesis.speak(utterance);
  }, [isPlaying, audioText, selectedVoice]);
  
  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);
  };
  
  const handleNext = () => {
    onComplete(isCorrect);
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
        {/* Instruction */}
        <p className="text-sm text-muted-foreground font-medium mb-6">
          Dengarkan dan pilih arti yang benar:
        </p>
        
        {/* Audio Player */}
        <div className="flex justify-center mb-8">
          <motion.button
            onClick={playAudio}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center transition-all",
              isPlaying 
                ? "bg-primary text-primary-foreground" 
                : "bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            {isPlaying ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Loader2 className="h-10 w-10 animate-spin" />
              </motion.div>
            ) : (
              <Volume2 className="h-10 w-10" />
            )}
          </motion.button>
        </div>
        
        <p className="text-center text-sm text-muted-foreground mb-6">
          {playCount === 0 ? 'Ketuk untuk mendengarkan' : `Diputar ${playCount}x`}
        </p>
        
        {/* Options */}
        <div className="grid grid-cols-1 gap-3">
          {options.map((option, index) => {
            const isSelected = selectedAnswer === option.value;
            const isCorrectOption = option.value === correctAnswer;
            
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
                onClick={() => handleAnswer(option.value)}
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
                  {option.label}
                </span>
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
                "p-4 rounded-xl",
                isCorrect ? "bg-success/10" : "bg-destructive/10"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <p className={cn(
                    "font-semibold",
                    isCorrect ? "text-success" : "text-destructive"
                  )}>
                    {isCorrect ? 'Benar!' : 'Kurang tepat!'}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Audio: <span className="font-jp font-semibold">{audioText}</span>
                </p>
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
