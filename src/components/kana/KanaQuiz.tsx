import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { KanaCharacter, useUpdateKanaProgress } from '@/hooks/useKana';
import { Volume2, Check, X, Zap, Trophy, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

type QuizType = 'audio' | 'reading' | 'romaji' | 'word';

interface QuizQuestion {
  type: QuizType;
  correctAnswer: KanaCharacter;
  options: KanaCharacter[];
  prompt?: string;
}

interface KanaQuizProps {
  characters: KanaCharacter[];
  onComplete: (score: number, total: number) => void;
  questionCount?: number;
}

export function KanaQuiz({ characters, onComplete, questionCount = 10 }: KanaQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const updateProgress = useUpdateKanaProgress();
  
  // Generate quiz questions
  const questions = useMemo(() => {
    if (characters.length < 4) return [];
    
    const shuffled = [...characters].sort(() => Math.random() - 0.5);
    const selectedChars = shuffled.slice(0, Math.min(questionCount, characters.length));
    
    return selectedChars.map((char): QuizQuestion => {
      // Randomly select quiz type
      const types: QuizType[] = ['audio', 'reading', 'romaji'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      // Get 3 wrong options
      const wrongOptions = characters
        .filter(c => c.id !== char.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const options = [...wrongOptions, char].sort(() => Math.random() - 0.5);
      
      return {
        type,
        correctAnswer: char,
        options,
      };
    });
  }, [characters, questionCount]);
  
  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  
  const speakCharacter = (text: string) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.8;
    utterance.pitch = 1.1;
    
    const voices = speechSynthesis.getVoices();
    const japaneseVoice = voices.find(v => v.lang.startsWith('ja'));
    if (japaneseVoice) utterance.voice = japaneseVoice;
    
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };
  
  const handleAnswer = async (optionId: string) => {
    if (isAnswered || !currentQuestion) return;
    
    setSelectedAnswer(optionId);
    setIsAnswered(true);
    
    const isCorrect = optionId === currentQuestion.correctAnswer.id;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
    
    // Update progress
    await updateProgress.mutateAsync({
      kanaId: currentQuestion.correctAnswer.id,
      isCorrect,
    });
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
  
  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setShowResults(false);
  };
  
  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Minimal 4 karakter diperlukan untuk kuis
        </p>
      </div>
    );
  }
  
  if (showResults) {
    const percentage = Math.round((correctCount / questions.length) * 100);
    const xpEarned = correctCount * 2;
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
            <X className="h-10 w-10 text-destructive" />
          )}
        </motion.div>
        
        <h2 className="text-2xl font-bold mb-2">
          {isPassing ? 'Hebat! 🎉' : 'Coba Lagi!'}
        </h2>
        
        <p className="text-muted-foreground mb-4">
          {isPassing 
            ? 'Kamu berhasil menyelesaikan kuis ini!' 
            : 'Latihan membuat sempurna!'
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
              <p className="text-3xl font-bold text-amber-500">+{xpEarned}</p>
            </div>
            <p className="text-sm text-muted-foreground">XP</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Button 
            variant="default" 
            size="xl" 
            className="w-full"
            onClick={handleComplete}
          >
            Lanjutkan
          </Button>
          {!isPassing && (
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full gap-2"
              onClick={handleRestart}
            >
              <RotateCcw className="h-4 w-4" />
              Ulangi Kuis
            </Button>
          )}
        </div>
      </motion.div>
    );
  }
  
  if (!currentQuestion) return null;
  
  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="bg-card rounded-xl p-4 shadow-card border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Kuis Kana</span>
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
          {/* Question Prompt */}
          <div className="text-center mb-6">
            {currentQuestion.type === 'audio' && (
              <>
                <p className="text-muted-foreground mb-4">Dengarkan dan pilih karakter yang benar</p>
                <Button
                  variant="outline"
                  size="xl"
                  className="gap-2"
                  onClick={() => speakCharacter(currentQuestion.correctAnswer.character)}
                  disabled={isPlaying}
                >
                  <Volume2 className={cn("h-6 w-6", isPlaying && "animate-pulse")} />
                  {isPlaying ? 'Memutar...' : 'Putar Suara'}
                </Button>
              </>
            )}
            
            {currentQuestion.type === 'reading' && (
              <>
                <p className="text-muted-foreground mb-4">Apa bacaan karakter ini?</p>
                <span className="text-6xl font-jp font-bold">
                  {currentQuestion.correctAnswer.character}
                </span>
              </>
            )}
            
            {currentQuestion.type === 'romaji' && (
              <>
                <p className="text-muted-foreground mb-4">
                  Pilih karakter untuk "{currentQuestion.correctAnswer.romaji}"
                </p>
                <span className="text-4xl font-bold text-primary">
                  {currentQuestion.correctAnswer.romaji}
                </span>
              </>
            )}
          </div>
          
          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option.id;
              const isCorrect = option.id === currentQuestion.correctAnswer.id;
              
              let buttonState = 'default';
              if (isAnswered) {
                if (isCorrect) buttonState = 'correct';
                else if (isSelected) buttonState = 'incorrect';
              }
              
              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAnswer(option.id)}
                  disabled={isAnswered}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1",
                    buttonState === 'default' && "border-border hover:border-primary hover:bg-primary/5",
                    buttonState === 'correct' && "border-success bg-success/10",
                    buttonState === 'incorrect' && "border-destructive bg-destructive/10"
                  )}
                >
                  {currentQuestion.type === 'reading' ? (
                    <>
                      <span className="text-lg font-medium">{option.romaji}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl font-jp font-medium">{option.character}</span>
                      {isAnswered && (
                        <span className="text-xs text-muted-foreground">{option.romaji}</span>
                      )}
                    </>
                  )}
                  
                  {buttonState === 'correct' && (
                    <Check className="h-4 w-4 text-success mt-1" />
                  )}
                  {buttonState === 'incorrect' && (
                    <X className="h-4 w-4 text-destructive mt-1" />
                  )}
                </motion.button>
              );
            })}
          </div>
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
              className="w-full"
              onClick={handleNext}
            >
              {currentIndex < questions.length - 1 ? 'Lanjut' : 'Lihat Hasil'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
