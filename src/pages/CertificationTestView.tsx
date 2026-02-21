import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Grid3X3, ChevronLeft, ChevronRight, BookOpen, MessageSquare, FileSearch, Headphones, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCertificationTest, CertTestConfig } from '@/hooks/useCertificationTest';
import { TestStartScreen } from '@/components/mocktest/TestStartScreen';
import { EnhancedTimer } from '@/components/mocktest/EnhancedTimer';
import { EnhancedTestQuestion } from '@/components/mocktest/EnhancedTestQuestion';
import { EnhancedTestResults } from '@/components/mocktest/EnhancedTestResults';
import { SectionNavGrid } from '@/components/mocktest/SectionNavGrid';
import { EnhancedSubmitDialog } from '@/components/mocktest/EnhancedSubmitDialog';
import { ExitConfirmDialog } from '@/components/mocktest/ExitConfirmDialog';
import { CertificateUnlockedModal } from '@/components/certificate/CertificateUnlockedModal';
import { useTestProctor } from '@/hooks/useTestProctor';
import { useFaceProctor } from '@/hooks/useFaceProctor';
import { useAudioProctor } from '@/hooks/useAudioProctor';
import { ProctoringCamera } from '@/components/mocktest/ProctoringCamera';
import { ProctoringSetup } from '@/components/mocktest/ProctoringSetup';
import { ViolationWarningModal } from '@/components/mocktest/ViolationWarningModal';

const CERT_TEST_CONFIGS: Record<string, CertTestConfig> = {
  cert_kakunin: {
    testType: 'cert_kakunin',
    name: 'Sertifikasi IM Japan Kakunin',
    timeLimit: 30 * 60,
    passingScore: 75,
    xpReward: 100,
    sections: [
      { id: 'kosakata', name: 'Kosakata', nameJp: 'ごい', questions: 15 },
      { id: 'grammar', name: 'Tata Bahasa', nameJp: 'ぶんぽう', questions: 10 },
      { id: 'membaca', name: 'Pemahaman', nameJp: 'どっかい', questions: 5 },
    ]
  },
  cert_jlpt_n5: {
    testType: 'cert_jlpt_n5',
    name: 'Sertifikasi JLPT N5',
    timeLimit: 60 * 60,
    passingScore: 65,
    xpReward: 150,
    sections: [
      { id: 'hiragana', name: 'Hiragana', nameJp: 'ひらがな', questions: 10 },
      { id: 'katakana', name: 'Katakana', nameJp: 'カタカナ', questions: 5 },
      { id: 'kosakata', name: 'Kosakata', nameJp: 'ごい', questions: 15 },
      { id: 'grammar', name: 'Tata Bahasa', nameJp: 'ぶんぽう', questions: 15 },
      { id: 'membaca', name: 'Pemahaman Bacaan', nameJp: 'どっかい', questions: 10 },
    ]
  },
  cert_jlpt_n4: {
    testType: 'cert_jlpt_n4',
    name: 'Sertifikasi JLPT N4',
    timeLimit: 75 * 60,
    passingScore: 65,
    xpReward: 200,
    sections: [
      { id: 'kosakata', name: 'Kosakata', nameJp: 'ごい', questions: 20 },
      { id: 'grammar', name: 'Tata Bahasa', nameJp: 'ぶんぽう', questions: 20 },
      { id: 'membaca', name: 'Pemahaman Bacaan', nameJp: 'どっかい', questions: 15 },
    ]
  },
  cert_jlpt_n3: {
    testType: 'cert_jlpt_n3',
    name: 'Sertifikasi JLPT N3',
    timeLimit: 90 * 60,
    passingScore: 65,
    xpReward: 250,
    sections: [
      { id: 'kosakata', name: 'Kosakata', nameJp: 'ごい', questions: 20 },
      { id: 'grammar', name: 'Tata Bahasa', nameJp: 'ぶんぽう', questions: 20 },
      { id: 'membaca', name: 'Pemahaman Bacaan', nameJp: 'どっかい', questions: 15 },
      { id: 'listening', name: 'Mendengarkan', nameJp: 'ちょうかい', questions: 15 },
    ]
  },
  cert_jlpt_n2: {
    testType: 'cert_jlpt_n2',
    name: 'Sertifikasi JLPT N2',
    timeLimit: 105 * 60,
    passingScore: 65,
    xpReward: 300,
    sections: [
      { id: 'kosakata', name: 'Kosakata', nameJp: 'ごい', questions: 25 },
      { id: 'grammar', name: 'Tata Bahasa', nameJp: 'ぶんぽう', questions: 25 },
      { id: 'membaca', name: 'Pemahaman Bacaan', nameJp: 'どっかい', questions: 20 },
      { id: 'listening', name: 'Mendengarkan', nameJp: 'ちょうかい', questions: 20 },
    ]
  },
  cert_jlpt_n1: {
    testType: 'cert_jlpt_n1',
    name: 'Sertifikasi JLPT N1',
    timeLimit: 120 * 60,
    passingScore: 65,
    xpReward: 400,
    sections: [
      { id: 'kosakata', name: 'Kosakata', nameJp: 'ごい', questions: 30 },
      { id: 'grammar', name: 'Tata Bahasa', nameJp: 'ぶんぽう', questions: 30 },
      { id: 'membaca', name: 'Pemahaman Bacaan', nameJp: 'どっかい', questions: 30 },
      { id: 'listening', name: 'Mendengarkan', nameJp: 'ちょうかい', questions: 30 },
    ]
  }
};

const SECTION_ICONS: Record<string, React.ReactNode> = {
  hiragana: <BookOpen className="h-4 w-4" />,
  katakana: <BookOpen className="h-4 w-4" />,
  kosakata: <BookOpen className="h-4 w-4" />,
  grammar: <MessageSquare className="h-4 w-4" />,
  membaca: <FileSearch className="h-4 w-4" />,
  listening: <Headphones className="h-4 w-4" />,
};

export default function CertificationTestView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const testType = searchParams.get('type') || 'cert_kakunin';

  const config = CERT_TEST_CONFIGS[testType] || CERT_TEST_CONFIGS.cert_kakunin;

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
    earnedCertificate,
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
  } = useCertificationTest(config, violations);

  const [showNavGrid, setShowNavGrid] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showCertModal, setShowCertModal] = useState(true);
  const [showProctoringSetup, setShowProctoringSetup] = useState(false);
  const [proctoringEnabled, setProctoringEnabled] = useState(false);

  // Proctoring hooks
  const handleAutoSubmit = useCallback(() => {
    submitTest();
  }, [submitTest]);

  const {
    violations,
    warningCount,
    isFullscreen,
    latestViolation,
    startProctoring,
    stopProctoring,
    addViolation,
    dismissWarning,
  } = useTestProctor({ onAutoSubmit: handleAutoSubmit, enabled: proctoringEnabled });

  const {
    videoRef,
    isCameraActive,
    faceStatus,
    startCamera,
    stopCamera,
  } = useFaceProctor({ addViolation, enabled: proctoringEnabled });

  const {
    isMicActive,
    startAudioMonitor,
    stopAudioMonitor,
  } = useAudioProctor({ addViolation, enabled: proctoringEnabled });

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isLastQuestion = currentIndex === questions.length - 1;
  const currentSection = getCurrentSection();

  const handleExit = () => setShowExitConfirm(true);
  const handleConfirmExit = () => navigate('/practice?tab=test');
  const handleSubmitClick = () => setShowSubmitConfirm(true);
  const handleConfirmSubmit = () => {
    setShowSubmitConfirm(false);
    submitTest();
  };
  const handleRetry = () => window.location.reload();
  const handleGoToQuestion = (index: number) => {
    goToQuestion(index);
    setShowSubmitConfirm(false);
  };

  const navSections = sections.map(s => ({
    id: s.id,
    name: s.name,
    nameJp: s.nameJp,
    startIndex: s.startIndex,
    count: s.count
  }));

  // Sections with icons for the start screen
  const startScreenSections = config.sections.map(s => ({
    ...s,
    icon: SECTION_ICONS[s.id] || <BookOpen className="h-4 w-4" />,
  }));

  const handleProctoredStart = useCallback(() => {
    setProctoringEnabled(true);
    startProctoring();
    startCamera();
    startAudioMonitor();
    startTest();
    setShowProctoringSetup(false);
  }, [startProctoring, startCamera, startAudioMonitor, startTest]);

  const handleTestStart = useCallback(() => {
    setShowProctoringSetup(true);
  }, []);

  const handleNonProctoredStart = useCallback(() => {
    startTest();
  }, [startTest]);

  // Show proctoring setup screen
  if (showProctoringSetup && !testStarted) {
    return (
      <ProctoringSetup
        onReady={handleProctoredStart}
        onBack={() => setShowProctoringSetup(false)}
      />
    );
  }

  // Show start screen before test begins
  if (!testStarted && !testResult) {
    return (
      <TestStartScreen
        testName={config.name}
        testNameJp=""
        totalQuestions={questions.length || config.sections.reduce((acc, s) => acc + s.questions, 0)}
        timeMinutes={config.timeLimit / 60}
        passingScore={config.passingScore}
        xpReward={config.xpReward}
        sections={startScreenSections}
        onStart={handleTestStart}
        onBack={() => navigate('/practice?tab=test')}
        isLoading={isLoading}
      />
    );
  }

  // Show results screen
  if (testResult && !isReviewMode) {
    // Adapt CertTestResult to TestResult format expected by EnhancedTestResults
    const adaptedResult = {
      score: testResult.score,
      totalQuestions: testResult.totalQuestions,
      passed: testResult.passed,
      timeSpent: testResult.timeSpent,
      sectionResults: testResult.sectionResults,
    };

    return (
      <>
        <EnhancedTestResults
          result={adaptedResult}
          testName={config.name}
          testNameJp=""
          passingScore={config.passingScore}
          xpReward={config.xpReward}
          sections={navSections}
          onReview={enterReviewMode}
          onRetry={handleRetry}
          onBack={() => navigate('/practice?tab=test')}
          formatTime={formatTime}
          totalTime={totalTime}
        />
        {earnedCertificate && showCertModal && (
          <CertificateUnlockedModal
            certificate={earnedCertificate}
            testName={config.name}
            onClose={() => setShowCertModal(false)}
          />
        )}
      </>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat soal sertifikasi...</p>
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
            <div className="flex items-center justify-between gap-4 mb-3">
              <Button variant="ghost" size="sm" onClick={handleExit} className="text-muted-foreground">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Keluar
              </Button>

              {!isReviewMode && (
                <EnhancedTimer
                  timeRemaining={timeRemaining}
                  totalTime={totalTime}
                  formatTime={formatTime}
                />
              )}

              {isReviewMode && (
                <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Mode Review
                </span>
              )}

              <Button variant="outline" size="icon" onClick={() => setShowNavGrid(true)}>
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                <span className="font-medium">{currentSection.name}</span>
                <span className="text-muted-foreground font-japanese">{currentSection.nameJp}</span>
              </div>
              <span className="text-muted-foreground">
                Soal {currentIndex + 1}/{questions.length}
              </span>
            </div>

            <div className="relative">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
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
                size="lg"
                onClick={handleSubmitClick}
                disabled={isSubmitting}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isSubmitting ? 'Menyimpan...' : 'Selesai'}
              </Button>
            ) : isLastQuestion && isReviewMode ? (
              <Button
                size="lg"
                onClick={() => navigate('/practice?tab=test')}
                className="flex-1"
              >
                Selesai Review
              </Button>
            ) : (
              <Button
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

      <SectionNavGrid
        sections={navSections}
        currentIndex={currentIndex}
        answers={answers}
        onSelect={goToQuestion}
        isOpen={showNavGrid}
        onClose={() => setShowNavGrid(false)}
      />

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

      <ExitConfirmDialog
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={() => {
          if (proctoringEnabled) {
            stopProctoring();
            stopCamera();
            stopAudioMonitor();
          }
          handleConfirmExit();
        }}
      />

      {/* Proctoring overlays */}
      {proctoringEnabled && isCameraActive && (
        <ProctoringCamera
          videoRef={videoRef}
          faceStatus={faceStatus}
          isCameraActive={isCameraActive}
        />
      )}

      <ViolationWarningModal
        isOpen={!!latestViolation}
        violation={latestViolation}
        warningCount={warningCount}
        maxWarnings={3}
        onDismiss={dismissWarning}
      />
    </div>
  );
}
