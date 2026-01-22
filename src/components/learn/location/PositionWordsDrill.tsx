import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PositionWord {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'inside' | 'front' | 'back';
}

const positionWords: PositionWord[] = [
  { id: 'ue', word: '上', reading: 'ue', meaning: 'Atas', position: 'top' },
  { id: 'shita', word: '下', reading: 'shita', meaning: 'Bawah', position: 'bottom' },
  { id: 'hidari', word: '左', reading: 'hidari', meaning: 'Kiri', position: 'left' },
  { id: 'migi', word: '右', reading: 'migi', meaning: 'Kanan', position: 'right' },
  { id: 'naka', word: '中', reading: 'naka', meaning: 'Dalam', position: 'inside' },
  { id: 'mae', word: '前', reading: 'mae', meaning: 'Depan', position: 'front' },
  { id: 'ushiro', word: '後ろ', reading: 'ushiro', meaning: 'Belakang', position: 'back' },
];

interface Question {
  item: string;
  emoji: string;
  correctPosition: string;
  isLiving: boolean;
}

const questions: Question[] = [
  { item: '猫', emoji: '🐱', correctPosition: 'top', isLiving: true },
  { item: '本', emoji: '📚', correctPosition: 'inside', isLiving: false },
  { item: '犬', emoji: '🐕', correctPosition: 'left', isLiving: true },
  { item: '鍵', emoji: '🔑', correctPosition: 'bottom', isLiving: false },
  { item: '人', emoji: '👤', correctPosition: 'right', isLiving: true },
  { item: 'ボール', emoji: '⚽', correctPosition: 'front', isLiving: false },
];

export function PositionWordsDrill() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const question = questions[currentQuestion];
  const correctWord = positionWords.find(w => w.position === question.correctPosition)!;

  useEffect(() => {
    const loadVoice = () => {
      const voices = speechSynthesis.getVoices();
      const jpVoice = voices.find(v => v.lang.startsWith('ja')) || null;
      setSelectedVoice(jpVoice);
    };
    loadVoice();
    speechSynthesis.onvoiceschanged = loadVoice;
  }, []);

  const speakJapanese = useCallback((text: string) => {
    if (isPlaying) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    speechSynthesis.speak(utterance);
  }, [isPlaying, selectedVoice]);

  const handleAnswer = (positionId: string) => {
    if (isAnswered) return;
    setSelectedAnswer(positionId);
    setIsAnswered(true);
    
    const isCorrect = positionId === correctWord.id;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    // Speak the correct sentence
    const verb = question.isLiving ? 'います' : 'あります';
    const sentence = `${question.item}は箱の${correctWord.word}に${verb}。`;
    setTimeout(() => speakJapanese(sentence), 500);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore({ correct: 0, total: 0 });
  };

  const getItemPosition = (pos: string) => {
    switch (pos) {
      case 'top': return { top: '5%', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom': return { bottom: '5%', left: '50%', transform: 'translateX(-50%)' };
      case 'left': return { top: '50%', left: '5%', transform: 'translateY(-50%)' };
      case 'right': return { top: '50%', right: '5%', transform: 'translateY(-50%)' };
      case 'inside': return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      case 'front': return { bottom: '15%', left: '50%', transform: 'translateX(-50%)' };
      case 'back': return { top: '15%', left: '50%', transform: 'translateX(-50%)' };
      default: return {};
    }
  };

  const isComplete = currentQuestion >= questions.length - 1 && isAnswered;

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h3 className="font-bold text-lg font-jp">位置の言葉</h3>
        <p className="text-sm text-muted-foreground">Kata posisi - Di mana benda itu?</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground">{currentQuestion + 1}/{questions.length}</span>
      </div>

      {/* Visual box with item */}
      <div className="relative bg-muted/30 rounded-2xl p-8 border border-border aspect-square max-w-xs mx-auto">
        {/* Position labels */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-jp">上 (ue)</div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-jp">下 (shita)</div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-jp writing-mode-vertical">左</div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-jp writing-mode-vertical">右</div>

        {/* Center box */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-card border-2 border-dashed border-border rounded-lg flex items-center justify-center">
          <span className="text-3xl">📦</span>
        </div>

        {/* Item at position */}
        <motion.div
          key={currentQuestion}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute text-3xl"
          style={getItemPosition(question.correctPosition) as React.CSSProperties}
        >
          {question.emoji}
        </motion.div>
      </div>

      {/* Question */}
      <div className="text-center">
        <p className="font-jp text-lg">
          <span className="text-2xl mr-2">{question.emoji}</span>
          {question.item}はどこに{question.isLiving ? 'いますか' : 'ありますか'}？
        </p>
      </div>

      {/* Answer options */}
      <div className="grid grid-cols-3 gap-2">
        {positionWords.slice(0, 6).map((word) => {
          const isCorrect = word.id === correctWord.id;
          const isSelected = selectedAnswer === word.id;
          
          return (
            <motion.button
              key={word.id}
              onClick={() => handleAnswer(word.id)}
              disabled={isAnswered}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "p-3 rounded-xl border transition-all text-center",
                isAnswered && isCorrect && "bg-accent text-accent-foreground border-accent",
                isAnswered && isSelected && !isCorrect && "bg-destructive/10 text-destructive border-destructive",
                !isAnswered && "bg-card border-border hover:border-primary/50",
                isAnswered && !isSelected && !isCorrect && "opacity-50"
              )}
            >
              <div className="text-lg font-bold font-jp">{word.word}</div>
              <div className="text-xs opacity-80">{word.meaning}</div>
            </motion.button>
          );
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "p-4 rounded-xl",
              selectedAnswer === correctWord.id ? "bg-accent/10 border border-accent" : "bg-destructive/10 border border-destructive"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              {selectedAnswer === correctWord.id ? (
                <CheckCircle className="w-5 h-5 text-accent" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive" />
              )}
              <span className="font-semibold">
                {selectedAnswer === correctWord.id ? 'Benar!' : 'Kurang tepat'}
              </span>
            </div>
            <p className="text-sm font-jp">
              {question.item}は箱の{correctWord.word}に{question.isLiving ? 'います' : 'あります'}。
            </p>
            <Button
              size="icon"
              variant="ghost"
              className="mt-2"
              onClick={() => speakJapanese(`${question.item}は箱の${correctWord.word}に${question.isLiving ? 'います' : 'あります'}。`)}
            >
              <Volume2 className={cn("w-4 h-4", isPlaying && "text-primary animate-pulse")} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-2">
        {isComplete ? (
          <Button onClick={handleReset} className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Ulangi ({score.correct}/{score.total})
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!isAnswered} className="flex-1">
            Lanjut
          </Button>
        )}
      </div>
    </div>
  );
}
