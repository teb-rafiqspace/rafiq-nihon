import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useQuizPractice, QuizSet, QuizQuestion } from '@/hooks/useQuizPractice';
import { DailyChallengeCard } from './DailyChallengeCard';
import { QuizGrid } from './QuizGrid';
import { QuizDetail, QuizOptions } from './QuizDetail';
import { QuizSession, QuizSessionResult } from './QuizSession';
import { QuizResults } from './QuizResults';
import { useToast } from '@/hooks/use-toast';

type ViewState = 'home' | 'detail' | 'session' | 'results';

export function QuizPracticeSection() {
  const {
    regularQuizSets,
    dailyChallenge,
    dailyProgress,
    streak,
    loadingQuizSets,
    getQuizStats,
    getBestPercentage,
    fetchQuestions,
    saveResult,
    getTimeUntilReset
  } = useQuizPractice();

  const { toast } = useToast();

  const [viewState, setViewState] = useState<ViewState>('home');
  const [selectedQuiz, setSelectedQuiz] = useState<QuizSet | null>(null);
  const [quizOptions, setQuizOptions] = useState<QuizOptions>({
    shuffle: true,
    showHints: true,
    enableTimer: false
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [sessionResult, setSessionResult] = useState<QuizSessionResult | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isDaily, setIsDaily] = useState(false);

  const handleSelectQuiz = (quiz: QuizSet) => {
    setSelectedQuiz(quiz);
    setIsDaily(false);
    setViewState('detail');
  };

  const handleStartDailyChallenge = async () => {
    if (!dailyChallenge) return;
    
    setSelectedQuiz(dailyChallenge);
    setIsDaily(true);
    setQuizOptions({
      shuffle: true,
      showHints: true,
      enableTimer: true
    });
    
    await loadAndStartQuiz(dailyChallenge.id);
  };

  const handleStartQuiz = async (options: QuizOptions) => {
    if (!selectedQuiz) return;
    setQuizOptions(options);
    await loadAndStartQuiz(selectedQuiz.id);
  };

  const loadAndStartQuiz = async (quizId: string) => {
    setIsLoadingQuestions(true);
    try {
      const fetchedQuestions = await fetchQuestions(quizId);
      
      if (fetchedQuestions.length === 0) {
        toast({
          title: 'Tidak ada pertanyaan',
          description: 'Quiz ini belum memiliki pertanyaan.',
          variant: 'destructive'
        });
        setViewState('home');
        return;
      }
      
      setQuestions(fetchedQuestions);
      setViewState('session');
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat pertanyaan.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleCompleteSession = async (results: QuizSessionResult) => {
    setSessionResult(results);
    setViewState('results');

    if (!selectedQuiz) return;

    try {
      await saveResult.mutateAsync({
        quizSetId: selectedQuiz.id,
        score: results.score,
        totalQuestions: results.totalQuestions,
        timeSpent: results.timeSpent,
        answers: results.answers,
        isDaily
      });

      toast({
        title: 'Quiz Selesai!',
        description: `Kamu mendapat ${results.score}/${results.totalQuestions} dan +${isDaily ? results.score + 50 : results.score} XP!`
      });
    } catch (error) {
      console.error('Error saving result:', error);
    }
  };

  const handleRetryMistakes = () => {
    if (!sessionResult || sessionResult.mistakes.length === 0) return;
    
    const mistakeQuestions = sessionResult.mistakes.map(m => m.question);
    setQuestions(mistakeQuestions);
    setSessionResult(null);
    setViewState('session');
  };

  const handleTryAgain = () => {
    if (!selectedQuiz) return;
    loadAndStartQuiz(selectedQuiz.id);
  };

  const handleBack = () => {
    setViewState('home');
    setSelectedQuiz(null);
    setSessionResult(null);
    setQuestions([]);
    setIsDaily(false);
  };

  const handleExitSession = () => {
    setViewState(selectedQuiz ? 'detail' : 'home');
  };

  if (loadingQuizSets) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pb-6">
      <AnimatePresence mode="wait">
        {viewState === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                📝 Latihan Kuis
              </h2>
              <p className="text-muted-foreground text-sm">
                Pilih topik yang ingin dilatih
              </p>
            </div>

            {/* Daily Challenge */}
            {dailyChallenge && (
              <DailyChallengeCard
                challenge={dailyChallenge}
                progress={dailyProgress}
                streak={streak}
                onStart={handleStartDailyChallenge}
                getTimeUntilReset={getTimeUntilReset}
              />
            )}

            {/* Separator */}
            <div className="border-t border-border my-6" />

            {/* Quiz Grid */}
            <QuizGrid
              quizSets={regularQuizSets}
              getBestPercentage={getBestPercentage}
              onSelectQuiz={handleSelectQuiz}
            />
          </motion.div>
        )}

        {viewState === 'detail' && selectedQuiz && (
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QuizDetail
              quiz={selectedQuiz}
              stats={getQuizStats(selectedQuiz.id)}
              onBack={handleBack}
              onStart={handleStartQuiz}
            />
          </motion.div>
        )}

        {viewState === 'session' && selectedQuiz && (
          <motion.div
            key="session"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {isLoadingQuestions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <QuizSession
                quiz={selectedQuiz}
                questions={questions}
                options={quizOptions}
                onComplete={handleCompleteSession}
                onExit={handleExitSession}
              />
            )}
          </motion.div>
        )}

        {viewState === 'results' && selectedQuiz && sessionResult && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QuizResults
              quiz={selectedQuiz}
              results={sessionResult}
              previousBest={getBestPercentage(selectedQuiz.id)}
              isDaily={isDaily}
              streak={streak}
              onRetryMistakes={handleRetryMistakes}
              onTryAgain={handleTryAgain}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
