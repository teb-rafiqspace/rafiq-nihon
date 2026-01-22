import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Grid3X3, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMockTest } from '@/hooks/useMockTest';
import { TestTimer } from '@/components/mocktest/TestTimer';
import { TestQuestion } from '@/components/mocktest/TestQuestion';
import { TestResults } from '@/components/mocktest/TestResults';
import { QuestionNavGrid } from '@/components/mocktest/QuestionNavGrid';
import { SubmitConfirmDialog } from '@/components/mocktest/SubmitConfirmDialog';
import { ExitConfirmDialog } from '@/components/mocktest/ExitConfirmDialog';
import { cn } from '@/lib/utils';

const TEST_CONFIGS = {
  kakunin: {
    testType: 'kakunin' as const,
    timeLimit: 30 * 60, // 30 minutes
    passingScore: 70,
    name: 'IM Japan Kakunin',
    description: 'Simulasi tes bahasa Kemnaker'
  },
  jlpt_n5: {
    testType: 'jlpt_n5' as const,
    timeLimit: 20 * 60, // 20 minutes
    passingScore: 60,
    name: 'JLPT N5 Mini Test',
    description: 'Latihan format JLPT'
  }
};

export default function MockTestView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const testType = (searchParams.get('type') as 'kakunin' | 'jlpt_n5') || 'kakunin';
  
  const config = TEST_CONFIGS[testType];
  
  const {
    questions,
    currentQuestion,
    currentIndex,
    currentAnswer,
    answers,
    timeRemaining,
    isLoading,
    isSubmitting,
    testResult,
    isReviewMode,
    setAnswer,
    toggleFlag,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    getUnansweredCount,
    getFlaggedCount,
    submitTest,
    enterReviewMode,
    formatTime
  } = useMockTest(config);
  
  const [showNavGrid, setShowNavGrid] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isLastQuestion = currentIndex === questions.length - 1;
  
  const handleExit = () => {
    setShowExitConfirm(true);
  };
  
  const handleConfirmExit = () => {
    navigate('/practice');
  };
  
  const handleSubmitClick = () => {
    setShowSubmitConfirm(true);
  };
  
  const handleConfirmSubmit = () => {
    setShowSubmitConfirm(false);
    submitTest();
  };
  
  const handleRetry = () => {
    window.location.reload();
  };
  
  // Show results screen
  if (testResult && !isReviewMode) {
    return (
      <TestResults
        result={testResult}
        testName={config.name}
        passingScore={config.passingScore}
        onReview={enterReviewMode}
        onRetry={handleRetry}
        onBack={() => navigate('/practice')}
        formatTime={formatTime}
      />
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat soal...</p>
        </div>
      </div>
    );
  }
  
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Tidak ada soal tersedia</p>
          <Button onClick={() => navigate('/practice')}>Kembali</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-md z-30 border-b border-border">
        <div className="pt-safe">
          <div className="container max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Exit Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleExit}
                className="text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Keluar
              </Button>
              
              {/* Timer (only show during test, not review) */}
              {!isReviewMode && (
                <TestTimer 
                  timeRemaining={timeRemaining} 
                  formatTime={formatTime} 
                />
              )}
              
              {/* Review Mode Badge */}
              {isReviewMode && (
                <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Mode Review
                </span>
              )}
              
              {/* Nav Grid Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowNavGrid(true)}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-primary rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Question Content */}
      <div className="container max-w-lg mx-auto px-4 pt-28">
        <TestQuestion
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          answer={currentAnswer}
          isReviewMode={isReviewMode}
          onAnswer={setAnswer}
          onToggleFlag={toggleFlag}
        />
      </div>
      
      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border pb-safe">
        <div className="container max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              className="flex-1"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Sebelumnya
            </Button>
            
            {isLastQuestion && !isReviewMode ? (
              <Button
                variant="default"
                size="lg"
                onClick={handleSubmitClick}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Menyimpan...' : 'Selesai'}
              </Button>
            ) : isLastQuestion && isReviewMode ? (
              <Button
                variant="default"
                size="lg"
                onClick={() => navigate('/practice')}
                className="flex-1"
              >
                Selesai Review
              </Button>
            ) : (
              <Button
                variant="default"
                size="lg"
                onClick={nextQuestion}
                className="flex-1"
              >
                Selanjutnya
                <ChevronRight className="h-5 w-5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Question Navigation Grid */}
      <QuestionNavGrid
        totalQuestions={questions.length}
        currentIndex={currentIndex}
        answers={answers}
        onSelect={goToQuestion}
        isOpen={showNavGrid}
        onClose={() => setShowNavGrid(false)}
      />
      
      {/* Submit Confirmation Dialog */}
      <SubmitConfirmDialog
        isOpen={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={handleConfirmSubmit}
        unansweredCount={getUnansweredCount()}
        flaggedCount={getFlaggedCount()}
      />
      
      {/* Exit Confirmation Dialog */}
      <ExitConfirmDialog
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={handleConfirmExit}
      />
    </div>
  );
}
