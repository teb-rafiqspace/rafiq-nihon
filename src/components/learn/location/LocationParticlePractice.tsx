import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  sentence: string;
  blank: string;
  options: string[];
  correctAnswers: string[];
  explanation: string;
  exampleTranslation: string;
}

const questions: Question[] = [
  {
    id: '1',
    sentence: '会社 ___ 行きます。',
    blank: '___',
    options: ['に', 'へ', 'で', 'を'],
    correctAnswers: ['に', 'へ'],
    explanation: 'に dan へ keduanya bisa untuk tujuan. に lebih spesifik, へ lebih ke arah.',
    exampleTranslation: 'Pergi ke kantor.',
  },
  {
    id: '2',
    sentence: 'レストラン ___ 食べます。',
    blank: '___',
    options: ['に', 'へ', 'で', 'を'],
    correctAnswers: ['で'],
    explanation: 'で digunakan untuk tempat aktivitas berlangsung.',
    exampleTranslation: 'Makan di restoran.',
  },
  {
    id: '3',
    sentence: '電車 ___ 乗ります。',
    blank: '___',
    options: ['に', 'へ', 'で', 'を'],
    correctAnswers: ['に'],
    explanation: 'に digunakan dengan 乗ります (naik) untuk menunjukkan apa yang dinaiki.',
    exampleTranslation: 'Naik kereta.',
  },
  {
    id: '4',
    sentence: '駅 ___ 降ります。',
    blank: '___',
    options: ['に', 'へ', 'で', 'を'],
    correctAnswers: ['で'],
    explanation: 'で digunakan dengan 降ります (turun) untuk menunjukkan di mana turun.',
    exampleTranslation: 'Turun di stasiun.',
  },
  {
    id: '5',
    sentence: '橋 ___ 渡ります。',
    blank: '___',
    options: ['に', 'へ', 'で', 'を'],
    correctAnswers: ['を'],
    explanation: 'を digunakan untuk menunjukkan tempat yang dilalui/diseberangi.',
    exampleTranslation: 'Menyeberangi jembatan.',
  },
  {
    id: '6',
    sentence: '日本 ___ 来ました。',
    blank: '___',
    options: ['に', 'へ', 'で', 'を'],
    correctAnswers: ['に', 'へ'],
    explanation: 'に dan へ keduanya bisa untuk tujuan datang.',
    exampleTranslation: 'Datang ke Jepang.',
  },
  {
    id: '7',
    sentence: '部屋 ___ 入ります。',
    blank: '___',
    options: ['に', 'へ', 'で', 'を'],
    correctAnswers: ['に'],
    explanation: 'に digunakan dengan 入ります (masuk) untuk menunjukkan ke mana masuk.',
    exampleTranslation: 'Masuk ke kamar.',
  },
  {
    id: '8',
    sentence: '角 ___ 曲がります。',
    blank: '___',
    options: ['に', 'へ', 'で', 'を'],
    correctAnswers: ['を'],
    explanation: 'を digunakan dengan 曲がります (belok) untuk menunjukkan di mana belok.',
    exampleTranslation: 'Belok di sudut.',
  },
];

export function LocationParticlePractice() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showHint, setShowHint] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const question = questions[currentQuestion];

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

  const handleAnswer = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
    
    const isCorrect = question.correctAnswers.includes(option);
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    // Speak the complete sentence
    const completeSentence = question.sentence.replace(question.blank, question.correctAnswers[0]);
    setTimeout(() => speakJapanese(completeSentence), 300);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowHint(false);
    }
  };

  const isComplete = currentQuestion >= questions.length - 1 && isAnswered;
  const isCorrect = selectedAnswer ? question.correctAnswers.includes(selectedAnswer) : false;

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h3 className="font-bold text-lg font-jp">に・へ・で・を</h3>
        <p className="text-sm text-muted-foreground">Pilih partikel yang tepat</p>
      </div>

      {/* Particle explanation */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-muted/50 rounded-lg p-2">
          <span className="font-bold font-jp">に</span> = tujuan (ke)
        </div>
        <div className="bg-muted/50 rounded-lg p-2">
          <span className="font-bold font-jp">へ</span> = arah (menuju)
        </div>
        <div className="bg-muted/50 rounded-lg p-2">
          <span className="font-bold font-jp">で</span> = tempat aksi
        </div>
        <div className="bg-muted/50 rounded-lg p-2">
          <span className="font-bold font-jp">を</span> = melewati
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${((currentQuestion + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground">{currentQuestion + 1}/{questions.length}</span>
      </div>

      {/* Question */}
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-6 border border-border shadow-card"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="font-jp text-2xl font-medium">
            {question.sentence.split(question.blank).map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className={cn(
                    "inline-block min-w-[2em] border-b-2 mx-1 text-center",
                    isAnswered 
                      ? isCorrect ? "border-accent text-accent" : "border-destructive text-destructive"
                      : "border-primary"
                  )}>
                    {isAnswered ? (selectedAnswer || '') : ''}
                  </span>
                )}
              </span>
            ))}
          </p>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => speakJapanese(question.sentence.replace(question.blank, question.correctAnswers[0]))}
          >
            <Volume2 className={cn("w-5 h-5", isPlaying && "text-primary animate-pulse")} />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{question.exampleTranslation}</p>

        {/* Options */}
        <div className="grid grid-cols-4 gap-2">
          {question.options.map((option) => {
            const isOptionCorrect = question.correctAnswers.includes(option);
            const isSelected = selectedAnswer === option;
            
            return (
              <motion.button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={isAnswered}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "p-3 rounded-xl border-2 font-bold font-jp text-xl transition-all",
                  isAnswered && isOptionCorrect && "bg-accent/20 border-accent text-accent",
                  isAnswered && isSelected && !isOptionCorrect && "bg-destructive/10 border-destructive text-destructive",
                  !isAnswered && "bg-card border-border hover:border-primary",
                  isAnswered && !isSelected && !isOptionCorrect && "opacity-40"
                )}
              >
                {option}
              </motion.button>
            );
          })}
        </div>

        {/* Hint button */}
        {!isAnswered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHint(!showHint)}
            className="mt-4"
          >
            <Lightbulb className="w-4 h-4 mr-1" />
            {showHint ? 'Sembunyikan' : 'Petunjuk'}
          </Button>
        )}

        {showHint && !isAnswered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 p-3 bg-muted/50 rounded-lg text-sm"
          >
            💡 {question.explanation}
          </motion.div>
        )}
      </motion.div>

      {/* Feedback */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-4 rounded-xl",
              isCorrect ? "bg-accent/10 border border-accent" : "bg-destructive/10 border border-destructive"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <CheckCircle className="w-5 h-5 text-accent" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive" />
              )}
              <span className="font-semibold">
                {isCorrect ? 'Benar!' : `Jawaban: ${question.correctAnswers.join(' atau ')}`}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{question.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      {!isComplete ? (
        <Button onClick={handleNext} disabled={!isAnswered} className="w-full">
          Lanjut
        </Button>
      ) : (
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="font-bold text-lg">Selesai! 🎉</p>
          <p className="text-muted-foreground">Skor: {score.correct}/{score.total}</p>
        </div>
      )}
    </div>
  );
}
