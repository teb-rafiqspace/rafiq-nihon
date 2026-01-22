import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Flag, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { MockTestQuestion, UserAnswer } from '@/hooks/useMockTest';

interface EnhancedTestQuestionProps {
  question: MockTestQuestion;
  questionNumber: number;
  totalQuestions: number;
  sectionName: string;
  sectionNameJp: string;
  answer: UserAnswer;
  isReviewMode: boolean;
  onAnswer: (answer: string) => void;
  onToggleFlag: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function EnhancedTestQuestion({
  question,
  questionNumber,
  totalQuestions,
  sectionName,
  sectionNameJp,
  answer,
  isReviewMode,
  onAnswer,
  onToggleFlag,
  onNext,
  onPrev
}: EnhancedTestQuestionProps) {
  const selectedAnswer = answer?.answer;
  const isFlagged = answer?.flagged;
  
  // Check if this is a reading comprehension question
  const isReadingQuestion = question.section === 'membaca';
  const hasPassage = question.question_text.includes('【読解】');
  
  // Extract passage and question from reading questions
  const extractReadingParts = (text: string) => {
    if (!hasPassage) return { passage: null, questionText: text };
    
    const parts = text.split(/Q[:：]\s*/);
    if (parts.length >= 2) {
      const passageMatch = parts[0].match(/「([^」]+)」/);
      const passage = passageMatch ? passageMatch[1] : parts[0].replace('【読解】', '').trim();
      const questionText = 'Q: ' + parts[1];
      return { passage, questionText };
    }
    return { passage: null, questionText: text };
  };
  
  const { passage, questionText } = extractReadingParts(question.question_text);
  
  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isReviewMode) return;
    
    switch (e.key) {
      case 'n':
      case 'N':
        onNext();
        break;
      case 'p':
      case 'P':
        onPrev();
        break;
      case 'f':
      case 'F':
        onToggleFlag();
        break;
      case '1':
      case 'a':
      case 'A':
        if (question.options[0]) onAnswer(question.options[0]);
        break;
      case '2':
      case 'b':
      case 'B':
        if (question.options[1]) onAnswer(question.options[1]);
        break;
      case '3':
      case 'c':
      case 'C':
        if (question.options[2]) onAnswer(question.options[2]);
        break;
      case '4':
      case 'd':
      case 'D':
        if (question.options[3]) onAnswer(question.options[3]);
        break;
      case 'ArrowUp':
        e.preventDefault();
        const currentIdx = question.options.indexOf(selectedAnswer || '');
        if (currentIdx > 0) {
          onAnswer(question.options[currentIdx - 1]);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        const currIdx = question.options.indexOf(selectedAnswer || '');
        if (currIdx < question.options.length - 1) {
          onAnswer(question.options[currIdx + 1]);
        }
        break;
      case 'Enter':
        if (selectedAnswer) onNext();
        break;
    }
  }, [isReviewMode, onNext, onPrev, onToggleFlag, onAnswer, question.options, selectedAnswer]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
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
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Soal {questionNumber}/{totalQuestions}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">
            Total: {questionNumber}/{totalQuestions}
          </span>
        </div>
        {!isReviewMode && (
          <button
            onClick={onToggleFlag}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              isFlagged 
                ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 ring-2 ring-amber-300 dark:ring-amber-600" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <Flag className={cn("h-4 w-4", isFlagged && "fill-current")} />
            {isFlagged ? 'Ditandai' : 'Tandai'}
          </button>
        )}
      </div>
      
      {/* Section Badge */}
      <div className="flex items-center gap-2">
        <span className="bg-gradient-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
          {sectionName}
        </span>
        <span className="text-xs text-muted-foreground font-japanese">
          {sectionNameJp}
        </span>
      </div>
      
      {/* Reading Passage (if applicable) */}
      {hasPassage && passage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary/30 rounded-2xl p-5 border border-secondary"
        >
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>Bacaan</span>
          </div>
          <p className="text-lg leading-relaxed font-japanese whitespace-pre-wrap">
            「{passage}」
          </p>
        </motion.div>
      )}
      
      {/* Question Text */}
      <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
        <p className="text-lg font-medium leading-relaxed">
          {hasPassage ? questionText : question.question_text}
        </p>
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
                "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 group",
                !isReviewMode && !isSelected && "border-border hover:border-primary hover:bg-primary/5 hover:shadow-md",
                !isReviewMode && isSelected && "border-primary bg-primary/10 shadow-md",
                showCorrect && "border-success bg-success/10",
                showIncorrect && "border-destructive bg-destructive/10"
              )}
            >
              <span className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border-2 shrink-0 transition-all",
                !isReviewMode && !isSelected && "border-border group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground",
                !isReviewMode && isSelected && "border-primary bg-primary text-primary-foreground",
                showCorrect && "border-success bg-success text-white",
                showIncorrect && "border-destructive bg-destructive text-white"
              )}>
                {showCorrect ? (
                  <CheckCircle className="h-5 w-5" />
                ) : showIncorrect ? (
                  <XCircle className="h-5 w-5" />
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
              
              {/* Keyboard hint */}
              {!isReviewMode && (
                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {optionLetter}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
      
      {/* Review Mode: Your Answer & Explanation */}
      <AnimatePresence>
        {isReviewMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {/* Your Answer */}
            {selectedAnswer && selectedAnswer !== question.correct_answer && (
              <div className="bg-destructive/10 rounded-xl p-4 border border-destructive/30">
                <p className="text-sm">
                  <span className="font-semibold text-destructive">Jawaban Anda: </span>
                  <span className="text-destructive">{selectedAnswer}</span>
                </p>
              </div>
            )}
            
            {/* Correct Answer */}
            <div className="bg-success/10 rounded-xl p-4 border border-success/30">
              <p className="text-sm">
                <span className="font-semibold text-success">Jawaban Benar: </span>
                <span className="text-success">{question.correct_answer}</span>
              </p>
            </div>
            
            {/* Explanation */}
            {question.explanation && (
              <div className="bg-muted rounded-xl p-4">
                <p className="text-sm">
                  <span className="font-semibold">💡 Penjelasan: </span>
                  {question.explanation}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Keyboard Shortcuts Hint (only show in test mode) */}
      {!isReviewMode && (
        <div className="text-center text-xs text-muted-foreground mt-4 hidden md:block">
          <span className="inline-flex items-center gap-4">
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">A-D</kbd> pilih</span>
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd> navigasi</span>
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">F</kbd> tandai</span>
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">N/P</kbd> next/prev</span>
          </span>
        </div>
      )}
    </motion.div>
  );
}
