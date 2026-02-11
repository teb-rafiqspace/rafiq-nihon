import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Grid3X3, ChevronLeft, ChevronRight, Languages, BookOpen, MessageSquare, FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMockTest } from '@/hooks/useMockTest';
import { TestStartScreen, JLPT_N5_SECTIONS, JLPT_N2_SECTIONS } from '@/components/mocktest/TestStartScreen';
import { EnhancedTimer } from '@/components/mocktest/EnhancedTimer';
import { EnhancedTestQuestion } from '@/components/mocktest/EnhancedTestQuestion';
import { EnhancedTestResults } from '@/components/mocktest/EnhancedTestResults';
import { SectionNavGrid } from '@/components/mocktest/SectionNavGrid';
import { EnhancedSubmitDialog } from '@/components/mocktest/EnhancedSubmitDialog';
import { ExitConfirmDialog } from '@/components/mocktest/ExitConfirmDialog';
import { cn } from '@/lib/utils';

const IELTS_SECTIONS = [
  { id: 'listening', name: 'Listening', nameJp: '', questions: 40, icon: <BookOpen className="h-4 w-4" /> },
  { id: 'reading', name: 'Reading', nameJp: '', questions: 40, icon: <FileSearch className="h-4 w-4" /> },
];

const TOEFL_SECTIONS = [
  { id: 'reading', name: 'Reading', nameJp: '', questions: 30, icon: <FileSearch className="h-4 w-4" /> },
  { id: 'listening', name: 'Listening', nameJp: '', questions: 28, icon: <BookOpen className="h-4 w-4" /> },
];

const TEST_CONFIGS = {
  kakunin: {
    testType: 'kakunin' as const,
    timeLimit: 30 * 60, // 30 minutes
    passingScore: 70,
    name: 'IM Japan Kakunin',
    nameJp: 'かくにんテスト',
    description: 'Simulasi tes bahasa Kemnaker',
    xpReward: 50,
    sections: [
      { id: 'kosakata', name: 'Kosakata', nameJp: 'ごい', questions: 15, icon: <BookOpen className="h-4 w-4" /> },
      { id: 'grammar', name: 'Tata Bahasa', nameJp: 'ぶんぽう', questions: 10, icon: <MessageSquare className="h-4 w-4" /> },
      { id: 'membaca', name: 'Pemahaman', nameJp: 'どっかい', questions: 5, icon: <FileSearch className="h-4 w-4" /> },
    ]
  },
  jlpt_n5: {
    testType: 'jlpt_n5' as const,
    timeLimit: 60 * 60, // 60 minutes
    passingScore: 60,
    name: 'JLPT N5 Mock Test',
    nameJp: 'もぎしけん',
    description: 'Tes latihan lengkap untuk persiapan JLPT N5',
    xpReward: 100,
    sections: JLPT_N5_SECTIONS
  },
  jlpt_n2: {
    testType: 'jlpt_n2' as const,
    timeLimit: 105 * 60, // 105 minutes
    passingScore: 60,
    name: 'JLPT N2 Mock Test',
    nameJp: '模擬試験 N2',
    description: 'Tes latihan lengkap untuk persiapan JLPT N2',
    xpReward: 200,
    sections: JLPT_N2_SECTIONS
  },
  ielts_mock: {
    testType: 'ielts_mock' as const,
    timeLimit: 170 * 60, // 170 minutes
    passingScore: 0,
    name: 'IELTS Practice Test',
    nameJp: '',
    description: 'Simulasi IELTS Academic (Listening & Reading)',
    xpReward: 200,
    sections: IELTS_SECTIONS
  },
  toefl_mock: {
    testType: 'toefl_mock' as const,
    timeLimit: 120 * 60, // 120 minutes
    passingScore: 0,
    name: 'TOEFL iBT Practice Test',
    nameJp: '',
    description: 'Simulasi TOEFL iBT (Reading & Listening)',
    xpReward: 200,
    sections: TOEFL_SECTIONS
  }
};

export default function MockTestView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const testType = (searchParams.get('type') as keyof typeof TEST_CONFIGS) || 'kakunin';
  
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
    testStarted,
    sections,
    setAnswer,
    toggleFlag,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    getUnansweredCount,
    getFlaggedCount,
    getUnansweredQuestions,
    getFlaggedQuestions,
    getAnsweredCount,
    submitTest,
    enterReviewMode,
    formatTime,
    startTest,
    getCurrentSection,
    totalTime
  } = useMockTest(config);
  
  const [showNavGrid, setShowNavGrid] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isLastQuestion = currentIndex === questions.length - 1;
  const currentSection = getCurrentSection();
  
  const handleExit = () => {
    setShowExitConfirm(true);
  };
  
  const handleConfirmExit = () => {
    navigate('/practice?tab=test');
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
  
  const handleGoToQuestion = (index: number) => {
    goToQuestion(index);
    setShowSubmitConfirm(false);
  };
  
  // Prepare sections for nav grid
  const navSections = sections.map(s => ({
    id: s.id,
    name: s.name,
    nameJp: s.nameJp,
    startIndex: s.startIndex,
    count: s.count
  }));
  
  // Show start screen before test begins
  if (!testStarted && !testResult) {
    return (
      <TestStartScreen
        testName={config.name}
        testNameJp={config.nameJp}
        totalQuestions={questions.length || config.sections.reduce((acc, s) => acc + s.questions, 0)}
        timeMinutes={config.timeLimit / 60}
        passingScore={config.passingScore}
        xpReward={config.xpReward}
        sections={config.sections}
        onStart={startTest}
        onBack={() => navigate('/practice?tab=test')}
        isLoading={isLoading}
      />
    );
  }
  
  // Show results screen
  if (testResult && !isReviewMode) {
    return (
      <EnhancedTestResults
        result={testResult}
        testName={config.name}
        testNameJp={config.nameJp}
        passingScore={config.passingScore}
        xpReward={config.xpReward}
        sections={navSections}
        onReview={enterReviewMode}
        onRetry={handleRetry}
        onBack={() => navigate('/practice?tab=test')}
        formatTime={formatTime}
        totalTime={totalTime}
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
          <Button onClick={() => navigate('/practice?tab=test')}>Kembali</Button>
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
            {/* Section & Timer Row */}
            <div className="flex items-center justify-between gap-4 mb-3">
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
                <EnhancedTimer 
                  timeRemaining={timeRemaining}
                  totalTime={totalTime}
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
            
            {/* Section Info */}
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{currentSection.name}</span>
                <span className="text-muted-foreground font-japanese">{currentSection.nameJp}</span>
              </div>
              <span className="text-muted-foreground">
                Soal {currentIndex + 1}/{questions.length}
              </span>
            </div>
            
            {/* Progress Bar with section markers */}
            <div className="relative">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-primary rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              
              {/* Section markers */}
              {sections.slice(0, -1).map((section) => {
                const markerPosition = ((section.startIndex + section.count) / questions.length) * 100;
                return (
                  <div
                    key={section.id}
                    className="absolute top-0 bottom-0 w-0.5 bg-background"
                    style={{ left: `${markerPosition}%` }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Question Content */}
      <div className="container max-w-lg mx-auto px-4 pt-36">
        <EnhancedTestQuestion
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          sectionName={currentSection.name}
          sectionNameJp={currentSection.nameJp}
          answer={currentAnswer}
          isReviewMode={isReviewMode}
          onAnswer={setAnswer}
          onToggleFlag={toggleFlag}
          onNext={nextQuestion}
          onPrev={prevQuestion}
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
                onClick={() => navigate('/practice?tab=test')}
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
      
      {/* Section Navigation Grid */}
      <SectionNavGrid
        sections={navSections}
        currentIndex={currentIndex}
        answers={answers}
        onSelect={goToQuestion}
        isOpen={showNavGrid}
        onClose={() => setShowNavGrid(false)}
      />
      
      {/* Enhanced Submit Confirmation Dialog */}
      <EnhancedSubmitDialog
        isOpen={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={handleConfirmSubmit}
        totalQuestions={questions.length}
        answeredCount={getAnsweredCount()}
        unansweredQuestions={getUnansweredQuestions()}
        flaggedQuestions={getFlaggedQuestions()}
        onGoToQuestion={handleGoToQuestion}
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
