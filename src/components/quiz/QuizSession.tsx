import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lightbulb, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QuizSet, QuizQuestion } from '@/hooks/useQuizPractice';
import { QuizOptions } from './QuizDetail';

interface QuizSessionProps {
  quiz: QuizSet;
  questions: QuizQuestion[];
  options: QuizOptions;
  onComplete: (results: QuizSessionResult) => void;
  onExit: () => void;
}

export interface QuizSessionResult {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  answers: Record<string, string>;
  mistakes: { question: QuizQuestion; userAnswer: string }[];
}

export function QuizSession({ quiz, questions, options, onComplete, onExit }: QuizSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [mistakes, setMistakes] = useState<{ question: QuizQuestion; userAnswer: string }[]>([]);
  const [startTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(options.enableTimer ? 300 : null);

  // Shuffle questions if option is enabled
  const shuffledQuestions = useMemo(() => {
    if (!options.shuffle) return questions;
    return [...questions].sort(() => Math.random() - 0.5);
  }, [questions, options.shuffle]);

  const currentQuestion = shuffledQuestions[currentIndex];
  const progress = ((currentIndex + 1) / shuffledQuestions.length) * 100;
  const isCorrect = selectedAnswer === currentQuestion?.correct_answer;

  // Timer effect
  useEffect(() => {
    if (!options.enableTimer || timeLeft === null) return;

    if (timeLeft <= 0) {
      handleComplete();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, options.enableTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handleAnswer = (answerId: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answerId);
    setIsAnswered(true);
    setAnswers({ ...answers, [currentQuestion.id]: answerId });

    if (answerId === currentQuestion.correct_answer) {
      setScore(score + 1);
    } else {
      setMistakes([...mistakes, { question: currentQuestion, userAnswer: answerId }]);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= shuffledQuestions.length) {
      handleComplete();
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowHint(false);
    }
  };

  const handleComplete = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onComplete({
      score,
      totalQuestions: shuffledQuestions.length,
      timeSpent,
      answers,
      mistakes
    });
  };

  const getUserAnswerText = (answerId: string) => {
    const option = currentQuestion.options?.find(o => o.id === answerId);
    return option?.text || answerId;
  };

  if (!currentQuestion) return null;

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onExit}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-medium">{quiz.title_jp}</span>
        </div>
        <div className="flex items-center gap-3">
          {isAnswered && (
            <span className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              ✅ {score}/{currentIndex + 1}
            </span>
          )}
          {timeLeft !== null && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              timeLeft < 60 ? 'text-red-600' : 'text-muted-foreground'
            }`}>
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-1">
          <span>Q{currentIndex + 1}/{shuffledQuestions.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {/* Feedback Banner */}
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-4 text-center ${
                isCorrect
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-red-50 border-2 border-red-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                {isCorrect ? (
                  <>
                    <Check className="h-6 w-6 text-green-600" />
                    <span className="text-lg font-bold text-green-800">Benar!</span>
                  </>
                ) : (
                  <>
                    <X className="h-6 w-6 text-red-600" />
                    <span className="text-lg font-bold text-red-800">Salah</span>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Question */}
          <div className="bg-card rounded-xl p-6 border border-border">
            {currentQuestion.question_type === 'fill_blank' ? (
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Lengkapi kalimat:</p>
                <p className="text-2xl font-bold">
                  {currentQuestion.question_text.replace('[___]', '[ ___ ]')}
                </p>
              </div>
            ) : (
              <p className="text-xl font-medium text-center">
                {currentQuestion.question_text}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => {
              const isSelected = selectedAnswer === option.id;
              const isCorrectOption = option.id === currentQuestion.correct_answer;

              let optionClass = 'bg-card border-border hover:border-primary/50';
              
              if (isAnswered) {
                if (isCorrectOption) {
                  optionClass = 'bg-green-50 border-green-500 border-2';
                } else if (isSelected && !isCorrect) {
                  optionClass = 'bg-red-50 border-red-500 border-2';
                } else {
                  optionClass = 'bg-muted/30 border-border opacity-60';
                }
              } else if (isSelected) {
                optionClass = 'bg-primary/10 border-primary border-2';
              }

              return (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: isAnswered ? 1 : 1.01 }}
                  whileTap={{ scale: isAnswered ? 1 : 0.99 }}
                  onClick={() => handleAnswer(option.id)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${optionClass}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-muted-foreground">
                        {option.id}.
                      </span>
                      <span className={`font-medium ${
                        isAnswered && isCorrectOption ? 'text-green-700' : ''
                      } ${
                        isAnswered && isSelected && !isCorrect ? 'text-red-700' : ''
                      }`}>
                        {option.text}
                      </span>
                    </div>
                    {isAnswered && (
                      <>
                        {isCorrectOption && (
                          <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                            ✅ Benar
                          </span>
                        )}
                        {isSelected && !isCorrect && (
                          <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                            ❌ Jawaban Anda
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Explanation (after answer) */}
          {isAnswered && currentQuestion.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 rounded-xl p-4 border border-blue-200"
            >
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-blue-800 mb-1">Penjelasan:</p>
                  <p className="text-sm text-blue-700">{currentQuestion.explanation}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Hint (before answer) */}
          {!isAnswered && options.showHints && currentQuestion.hint && (
            <>
              {showHint ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 rounded-xl p-4 border border-amber-200"
                >
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-800 mb-1">Hint:</p>
                      <p className="text-sm text-amber-700">{currentQuestion.hint}</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowHint(true)}
                  className="w-full"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Tampilkan Hint
                </Button>
              )}
            </>
          )}

          {/* Next Button */}
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button onClick={handleNext} className="w-full h-12 text-lg">
                {currentIndex + 1 >= shuffledQuestions.length
                  ? 'Lihat Hasil'
                  : 'Pertanyaan Selanjutnya →'}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
