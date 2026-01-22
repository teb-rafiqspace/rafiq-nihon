import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, RotateCcw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { CardWithProgress, DeckWithProgress } from '@/hooks/useFlashcardsDB';

interface FlashcardQuizProps {
  deck: DeckWithProgress;
  cards: CardWithProgress[];
  onBack: () => void;
  onComplete: (results: QuizResults) => void;
}

export interface QuizResults {
  correct: number;
  incorrect: number;
  timeSpent: number;
  mistakes: { card: CardWithProgress; userAnswer: string }[];
}

type QuestionType = 'multiple_choice' | 'type_answer';

interface Question {
  card: CardWithProgress;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
}

export function FlashcardQuiz({ deck, cards, onBack, onComplete }: FlashcardQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [results, setResults] = useState<QuizResults>({
    correct: 0,
    incorrect: 0,
    timeSpent: 0,
    mistakes: [],
  });
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Generate questions
  const questions: Question[] = useMemo(() => {
    return cards.slice(0, 10).map((card, index) => {
      // Alternate between question types
      const type: QuestionType = index % 3 === 2 ? 'type_answer' : 'multiple_choice';
      
      if (type === 'multiple_choice') {
        // Generate 4 options including the correct answer
        const correctAnswer = card.back_text;
        const otherCards = cards.filter(c => c.id !== card.id);
        const wrongOptions = otherCards
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(c => c.back_text);
        
        const options = [...wrongOptions, correctAnswer].sort(() => Math.random() - 0.5);
        
        return { card, type, options, correctAnswer };
      }
      
      return { card, type, correctAnswer: card.back_text };
    });
  }, [cards]);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const checkAnswer = () => {
    const userAnswer = currentQuestion.type === 'multiple_choice' ? selectedAnswer : typedAnswer.trim().toLowerCase();
    const correct = userAnswer === currentQuestion.correctAnswer.toLowerCase();
    
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setResults(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setResults(prev => ({
        ...prev,
        incorrect: prev.incorrect + 1,
        mistakes: [...prev.mistakes, { card: currentQuestion.card, userAnswer: userAnswer || '' }],
      }));
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setTypedAnswer('');
      setShowResult(false);
    } else {
      onComplete({
        ...results,
        timeSpent: Math.floor((Date.now() - startTime) / 1000),
      });
    }
  };

  if (!currentQuestion) {
    return <div>No questions available</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="font-medium">Quiz: {deck.title_jp}</span>
        <span className="text-sm text-muted-foreground">⏱️ {formatTime(elapsedTime)}</span>
      </div>

      {/* Progress */}
      <div className="space-y-1 mb-6">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Q{currentIndex + 1}/{questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1"
        >
          <div className="text-center mb-8">
            <p className="text-5xl font-bold font-jp mb-4">{currentQuestion.card.front_text}</p>
            <p className="text-muted-foreground">
              {currentQuestion.type === 'multiple_choice' 
                ? 'What is the meaning of this character?'
                : 'Type the meaning in Indonesian:'}
            </p>
          </div>

          {/* Answer Options */}
          {!showResult && (
            <>
              {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={`w-full justify-start text-left h-auto py-4 px-4 ${
                        selectedAnswer === option ? 'border-primary bg-primary/10' : ''
                      }`}
                      onClick={() => setSelectedAnswer(option)}
                    >
                      <span className="font-medium mr-3">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                      {selectedAnswer === option && (
                        <Check className="h-4 w-4 ml-auto text-primary" />
                      )}
                    </Button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'type_answer' && (
                <div className="space-y-4">
                  <Input
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    className="text-center text-lg"
                    onKeyDown={(e) => e.key === 'Enter' && typedAnswer && checkAnswer()}
                  />
                </div>
              )}

              <Button
                className="w-full mt-6"
                disabled={
                  (currentQuestion.type === 'multiple_choice' && !selectedAnswer) ||
                  (currentQuestion.type === 'type_answer' && !typedAnswer.trim())
                }
                onClick={checkAnswer}
              >
                Check Answer
              </Button>
            </>
          )}

          {/* Result Feedback */}
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-6 text-center ${
                isCorrect 
                  ? 'bg-success/10 border border-success/20' 
                  : 'bg-destructive/10 border border-destructive/20'
              }`}
            >
              <div className="text-4xl mb-3">{isCorrect ? '✅' : '❌'}</div>
              <h3 className="text-xl font-bold mb-2">
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </h3>
              
              {!isCorrect && (
                <div className="text-sm space-y-2 mb-4">
                  <p className="text-muted-foreground">
                    Your answer: <span className="text-destructive">{selectedAnswer || typedAnswer}</span>
                  </p>
                  <p>
                    Correct answer: <span className="text-success font-medium">{currentQuestion.correctAnswer}</span>
                  </p>
                </div>
              )}

              <p className="text-lg font-medium">
                {currentQuestion.card.front_text} = {currentQuestion.correctAnswer}
              </p>

              {currentQuestion.card.back_subtext && (
                <p className="text-sm text-muted-foreground mt-2">
                  ({currentQuestion.card.back_subtext})
                </p>
              )}

              {isCorrect && (
                <p className="text-success font-medium mt-2">+5 XP</p>
              )}

              <Button className="mt-6" onClick={nextQuestion}>
                {currentIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  'See Results'
                )}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
