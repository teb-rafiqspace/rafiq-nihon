import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronRight, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ParticleQuestion {
  sentence: string;
  blank: string;
  correctParticle: string;
  options: string[];
  explanation: string;
  translation: string;
  fullSentence: string;
}

const particleQuestions: ParticleQuestion[] = [
  {
    sentence: 'コーヒー___飲みます。',
    blank: 'を',
    correctParticle: 'を',
    options: ['を', 'に', 'で', 'が'],
    explanation: 'を marks the direct object of a verb.',
    translation: 'Saya minum kopi.',
    fullSentence: 'コーヒーを飲みます。'
  },
  {
    sentence: '学校___行きます。',
    blank: 'に',
    correctParticle: 'に',
    options: ['を', 'に', 'で', 'へ'],
    explanation: 'に indicates destination with motion verbs.',
    translation: 'Saya pergi ke sekolah.',
    fullSentence: '学校に行きます。'
  },
  {
    sentence: '電車___来ました。',
    blank: 'で',
    correctParticle: 'で',
    options: ['を', 'に', 'で', 'が'],
    explanation: 'で indicates the means or method of transportation.',
    translation: 'Saya datang dengan kereta.',
    fullSentence: '電車で来ました。'
  },
  {
    sentence: '朝ごはん___食べます。',
    blank: 'を',
    correctParticle: 'を',
    options: ['を', 'に', 'は', 'が'],
    explanation: 'を marks the direct object (what you eat).',
    translation: 'Saya makan sarapan.',
    fullSentence: '朝ごはんを食べます。'
  },
  {
    sentence: '7時___起きます。',
    blank: 'に',
    correctParticle: 'に',
    options: ['を', 'に', 'で', 'が'],
    explanation: 'に marks the specific time of an action.',
    translation: 'Saya bangun jam 7.',
    fullSentence: '7時に起きます。'
  },
  {
    sentence: '日本語___勉強します。',
    blank: 'を',
    correctParticle: 'を',
    options: ['を', 'に', 'で', 'は'],
    explanation: 'を marks the direct object (what you study).',
    translation: 'Saya belajar bahasa Jepang.',
    fullSentence: '日本語を勉強します。'
  },
  {
    sentence: '図書館___本を読みます。',
    blank: 'で',
    correctParticle: 'で',
    options: ['を', 'に', 'で', 'へ'],
    explanation: 'で indicates the location where an action takes place.',
    translation: 'Saya membaca buku di perpustakaan.',
    fullSentence: '図書館で本を読みます。'
  },
  {
    sentence: '友達___会います。',
    blank: 'に',
    correctParticle: 'に',
    options: ['を', 'に', 'と', 'が'],
    explanation: 'に indicates the person you meet (with 会う verb).',
    translation: 'Saya bertemu teman.',
    fullSentence: '友達に会います。'
  },
  {
    sentence: '家___帰ります。',
    blank: 'に',
    correctParticle: 'に',
    options: ['を', 'に', 'で', 'へ'],
    explanation: 'に indicates the destination of returning.',
    translation: 'Saya pulang ke rumah.',
    fullSentence: '家に帰ります。'
  },
  {
    sentence: 'テレビ___見ます。',
    blank: 'を',
    correctParticle: 'を',
    options: ['を', 'に', 'で', 'が'],
    explanation: 'を marks the direct object (what you watch).',
    translation: 'Saya menonton TV.',
    fullSentence: 'テレビを見ます。'
  },
];

interface ParticlePracticeProps {
  onComplete?: (correct: number, total: number) => void;
}

export function ParticlePractice({ onComplete }: ParticlePracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = particleQuestions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctParticle;
  const progress = ((currentIndex + 1) / particleQuestions.length) * 100;

  const handleAnswer = useCallback((particle: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(particle);
    setIsAnswered(true);
    
    if (particle === currentQuestion.correctParticle) {
      setCorrectCount(prev => prev + 1);
    }
  }, [isAnswered, currentQuestion]);

  const handleNext = useCallback(() => {
    if (currentIndex < particleQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
      onComplete?.(correctCount + (isCorrect ? 1 : 0), particleQuestions.length);
    }
  }, [currentIndex, correctCount, isCorrect, onComplete]);

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setShowResults(false);
  }, []);

  if (showResults) {
    const finalScore = correctCount;
    const percentage = Math.round((finalScore / particleQuestions.length) * 100);
    const passed = percentage >= 70;

    return (
      <Card className="bg-card border-border shadow-card">
        <CardContent className="p-6 text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl"
          >
            {passed ? '🎉' : '📚'}
          </motion.div>
          <h3 className="text-xl font-bold">
            {passed ? 'Bagus Sekali!' : 'Terus Berlatih!'}
          </h3>
          <div className="text-3xl font-bold text-primary">
            {finalScore}/{particleQuestions.length}
          </div>
          <p className="text-muted-foreground">
            {percentage}% benar
          </p>
          <Button onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Ulangi
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Particle Practice</span>
          <span className="text-sm text-muted-foreground font-normal">
            {currentIndex + 1}/{particleQuestions.length}
          </span>
        </CardTitle>
        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
          <motion.div
            className="h-full bg-gradient-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Instruction */}
            <p className="text-sm text-muted-foreground text-center">
              Lengkapi kalimat dengan partikel yang tepat:
            </p>

            {/* Sentence with blank */}
            <div className="p-4 bg-muted/50 rounded-xl text-center">
              <div className="text-2xl font-bold text-foreground">
                {currentQuestion.sentence.split('___').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className={cn(
                        "inline-block min-w-[2rem] px-2 mx-1 border-b-2 transition-colors",
                        isAnswered && isCorrect && "text-green-600 border-green-500",
                        isAnswered && !isCorrect && "text-red-600 border-red-500",
                        !isAnswered && "border-primary"
                      )}>
                        {selectedAnswer || '___'}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-4 gap-2">
              {currentQuestion.options.map((particle, index) => (
                <motion.button
                  key={index}
                  whileHover={!isAnswered ? { scale: 1.05 } : {}}
                  whileTap={!isAnswered ? { scale: 0.95 } : {}}
                  onClick={() => handleAnswer(particle)}
                  disabled={isAnswered}
                  className={cn(
                    "py-3 px-4 rounded-lg text-lg font-bold transition-all border-2",
                    !isAnswered && "border-border hover:border-primary hover:bg-primary/5",
                    isAnswered && particle === currentQuestion.correctParticle && "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400",
                    isAnswered && selectedAnswer === particle && particle !== currentQuestion.correctParticle && "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400",
                    isAnswered && selectedAnswer !== particle && particle !== currentQuestion.correctParticle && "opacity-50"
                  )}
                >
                  {particle}
                </motion.button>
              ))}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "p-4 rounded-xl",
                    isCorrect ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className={cn(
                        "font-medium",
                        isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                      )}>
                        {isCorrect ? 'Benar!' : `Salah. Jawaban yang benar: ${currentQuestion.correctParticle}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {currentQuestion.explanation}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {currentQuestion.fullSentence}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        "{currentQuestion.translation}"
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next button */}
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center"
              >
                <Button onClick={handleNext} className="gap-2">
                  {currentIndex < particleQuestions.length - 1 ? 'Lanjut' : 'Lihat Hasil'}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
