import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Flag, CheckCircle, XCircle } from 'lucide-react';
import { MockTestQuestion, UserAnswer } from '@/hooks/useMockTest';

interface TestQuestionProps {
  question: MockTestQuestion;
  questionNumber: number;
  totalQuestions: number;
  answer: UserAnswer;
  isReviewMode: boolean;
  onAnswer: (answer: string) => void;
  onToggleFlag: () => void;
}

export function TestQuestion({
  question,
  questionNumber,
  totalQuestions,
  answer,
  isReviewMode,
  onAnswer,
  onToggleFlag
}: TestQuestionProps) {
  const selectedAnswer = answer?.answer;
  const isFlagged = answer?.flagged;
  
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {/* Question Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Soal {questionNumber}/{totalQuestions}
        </span>
        {!isReviewMode && (
          <button
            onClick={onToggleFlag}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              isFlagged 
                ? "bg-amber-100 text-amber-700" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <Flag className={cn("h-4 w-4", isFlagged && "fill-current")} />
            {isFlagged ? 'Ditandai' : 'Tandai'}
          </button>
        )}
      </div>
      
      {/* Section Badge */}
      <div className="inline-flex">
        <span className="bg-secondary text-secondary-foreground text-xs font-medium px-2.5 py-1 rounded-full capitalize">
          {question.section}
        </span>
      </div>
      
      {/* Question Text */}
      <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
        <p className="text-lg font-medium leading-relaxed">{question.question_text}</p>
      </div>
      
      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const optionLetter = String.fromCharCode(65 + index);
          const isSelected = selectedAnswer === option;
          const isCorrect = option === question.correct_answer;
          const showCorrect = isReviewMode && isCorrect;
          const showIncorrect = isReviewMode && isSelected && !isCorrect;
          
          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => !isReviewMode && onAnswer(option)}
              disabled={isReviewMode}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3",
                !isReviewMode && !isSelected && "border-border hover:border-primary hover:bg-primary/5",
                !isReviewMode && isSelected && "border-primary bg-primary/10",
                showCorrect && "border-success bg-success/10",
                showIncorrect && "border-destructive bg-destructive/10"
              )}
            >
              <span className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0",
                !isReviewMode && !isSelected && "border-border",
                !isReviewMode && isSelected && "border-primary bg-primary text-primary-foreground",
                showCorrect && "border-success bg-success text-white",
                showIncorrect && "border-destructive bg-destructive text-white"
              )}>
                {showCorrect ? (
                  <CheckCircle className="h-4 w-4" />
                ) : showIncorrect ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  optionLetter
                )}
              </span>
              <span className={cn(
                "flex-1 font-medium",
                showCorrect && "text-success",
                showIncorrect && "text-destructive"
              )}>
                {option}
              </span>
            </motion.button>
          );
        })}
      </div>
      
      {/* Explanation (Review Mode) */}
      <AnimatePresence>
        {isReviewMode && question.explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-muted rounded-xl p-4"
          >
            <p className="text-sm">
              <span className="font-semibold">Penjelasan: </span>
              {question.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
