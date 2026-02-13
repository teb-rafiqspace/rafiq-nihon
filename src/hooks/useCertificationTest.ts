import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useQueryClient } from '@tanstack/react-query';
import { generateCertificateNumber, Certificate } from './useCertificates';

export interface CertTestQuestion {
  id: string;
  test_type: string;
  section: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  sort_order: number;
}

export interface CertUserAnswer {
  questionId: string;
  answer: string | null;
  flagged: boolean;
}

export interface CertTestResult {
  score: number;
  totalQuestions: number;
  passed: boolean;
  timeSpent: number;
  scorePercent: number;
  sectionResults: {
    section: string;
    correct: number;
    total: number;
  }[];
}

export interface CertTestSection {
  id: string;
  name: string;
  nameJp: string;
  startIndex: number;
  count: number;
}

export interface CertTestConfig {
  testType: string;
  name: string;
  timeLimit: number;
  passingScore: number;
  xpReward: number;
  sections: {
    id: string;
    name: string;
    nameJp: string;
    questions: number;
  }[];
}

const AUTO_SAVE_INTERVAL = 30000;
const STORAGE_KEY_PREFIX = 'cert_test_progress_';

export function useCertificationTest(config: CertTestConfig) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [questions, setQuestions] = useState<CertTestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<CertUserAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(config.timeLimit);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<CertTestResult | null>(null);
  const [testStartTime, setTestStartTime] = useState<number | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [sections, setSections] = useState<CertTestSection[]>([]);
  const [earnedCertificate, setEarnedCertificate] = useState<Certificate | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  const storageKey = `${STORAGE_KEY_PREFIX}${config.testType}`;

  const calculateSections = useCallback((questionList: CertTestQuestion[]): CertTestSection[] => {
    const sectionMap: Record<string, { count: number; startIndex: number }> = {};

    questionList.forEach((q, index) => {
      if (!sectionMap[q.section]) {
        sectionMap[q.section] = { count: 0, startIndex: index };
      }
      sectionMap[q.section].count++;
    });

    const sectionInfo: Record<string, { name: string; nameJp: string }> = {};
    config.sections.forEach(s => {
      sectionInfo[s.id] = { name: s.name, nameJp: s.nameJp };
    });

    return Object.entries(sectionMap).map(([id, data]) => ({
      id,
      name: sectionInfo[id]?.name || id,
      nameJp: sectionInfo[id]?.nameJp || '',
      startIndex: data.startIndex,
      count: data.count
    }));
  }, [config.sections]);

  const loadSavedProgress = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.savedAt && Date.now() - data.savedAt < 2 * 60 * 60 * 1000) {
          return data;
        }
      }
    } catch (e) {
      console.error('Error loading saved progress:', e);
    }
    return null;
  }, [storageKey]);

  const saveProgress = useCallback(() => {
    if (!testStarted || testResult) return;
    try {
      const data = {
        answers,
        currentIndex,
        timeRemaining,
        testStartTime,
        savedAt: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving progress:', e);
    }
  }, [answers, currentIndex, timeRemaining, testStartTime, testStarted, testResult, storageKey]);

  const clearSavedProgress = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.error('Error clearing progress:', e);
    }
  }, [storageKey]);

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await (supabase
          .from('certification_test_questions' as any)
          .select('*')
          .eq('test_type', config.testType)
          .order('sort_order', { ascending: true }) as any);

        if (error) throw error;

        const formattedQuestions: CertTestQuestion[] = ((data || []) as any[]).map((q: any) => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string)
        }));

        setQuestions(formattedQuestions);
        setSections(calculateSections(formattedQuestions));

        const initialAnswers = formattedQuestions.map(q => ({
          questionId: q.id,
          answer: null,
          flagged: false
        }));
        setAnswers(initialAnswers);
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [config.testType, calculateSections]);

  const startTest = useCallback(() => {
    const saved = loadSavedProgress();
    if (saved && saved.answers) {
      setAnswers(saved.answers);
      setCurrentIndex(saved.currentIndex || 0);
      setTimeRemaining(saved.timeRemaining || config.timeLimit);
      setTestStartTime(saved.testStartTime || Date.now());
    } else {
      setTestStartTime(Date.now());
      setTimeRemaining(config.timeLimit);
    }
    setTestStarted(true);
  }, [config.timeLimit, loadSavedProgress]);

  // Timer
  useEffect(() => {
    if (!testStarted || isLoading || testResult || isReviewMode) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testStarted, isLoading, testResult, isReviewMode]);

  // Auto-save
  useEffect(() => {
    if (!testStarted || testResult) return;

    autoSaveRef.current = setInterval(() => {
      saveProgress();
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [testStarted, testResult, saveProgress]);

  // Save on unload
  useEffect(() => {
    const handleBeforeUnload = () => saveProgress();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveProgress]);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];

  const getCurrentSection = useCallback(() => {
    const section = sections.find(s =>
      currentIndex >= s.startIndex && currentIndex < s.startIndex + s.count
    );
    return section || { id: '', name: '', nameJp: '', startIndex: 0, count: 0 };
  }, [sections, currentIndex]);

  const setAnswer = useCallback((answer: string) => {
    setAnswers(prev => prev.map((a, i) =>
      i === currentIndex ? { ...a, answer } : a
    ));
  }, [currentIndex]);

  const toggleFlag = useCallback(() => {
    setAnswers(prev => prev.map((a, i) =>
      i === currentIndex ? { ...a, flagged: !a.flagged } : a
    ));
  }, [currentIndex]);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  }, [questions.length]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, questions.length]);

  const prevQuestion = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const getUnansweredCount = useCallback(() => answers.filter(a => a.answer === null).length, [answers]);
  const getFlaggedCount = useCallback(() => answers.filter(a => a.flagged).length, [answers]);
  const getUnansweredQuestions = useCallback(() => answers.map((a, i) => a.answer === null ? i : -1).filter(i => i !== -1), [answers]);
  const getFlaggedQuestions = useCallback(() => answers.map((a, i) => a.flagged ? i : -1).filter(i => i !== -1), [answers]);
  const getAnsweredCount = useCallback(() => answers.filter(a => a.answer !== null).length, [answers]);

  const calculateResults = useCallback((): CertTestResult => {
    const timeSpent = testStartTime ? Math.round((Date.now() - testStartTime) / 1000) : config.timeLimit;

    let correctCount = 0;
    const sectionCounts: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q, i) => {
      const userAnswer = answers[i]?.answer;
      const isCorrect = userAnswer === q.correct_answer;
      if (isCorrect) correctCount++;

      if (!sectionCounts[q.section]) {
        sectionCounts[q.section] = { correct: 0, total: 0 };
      }
      sectionCounts[q.section].total++;
      if (isCorrect) sectionCounts[q.section].correct++;
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercent >= config.passingScore;

    const sectionResults = Object.entries(sectionCounts).map(([section, data]) => ({
      section,
      correct: data.correct,
      total: data.total
    }));

    return {
      score: correctCount,
      totalQuestions: questions.length,
      passed,
      timeSpent: Math.min(timeSpent, config.timeLimit),
      scorePercent,
      sectionResults
    };
  }, [questions, answers, testStartTime, config.timeLimit, config.passingScore]);

  const submitTest = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoSaveRef.current) clearInterval(autoSaveRef.current);

    setIsSubmitting(true);

    const result = calculateResults();
    setTestResult(result);
    clearSavedProgress();

    if (user) {
      try {
        // Save test attempt
        await supabase.from('test_attempts').insert({
          user_id: user.id,
          test_type: config.testType,
          score: result.score,
          total_questions: result.totalQuestions,
          time_spent_seconds: result.timeSpent,
          passed: result.passed,
          answers: answers.map(a => ({ questionId: a.questionId, answer: a.answer }))
        });

        // If passed, create certificate
        if (result.passed) {
          const certNumber = generateCertificateNumber(config.testType);
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, total_xp')
            .eq('user_id', user.id)
            .single();

          const displayName = profile?.full_name || user.email?.split('@')[0] || 'User';

          const sectionScores = result.sectionResults.map(s => ({
            section: s.section,
            correct: s.correct,
            total: s.total,
            percent: Math.round((s.correct / s.total) * 100)
          }));

          const { data: cert } = await supabase
            .from('certificates' as any)
            .insert({
              user_id: user.id,
              certificate_number: certNumber,
              test_type: config.testType,
              display_name: displayName,
              score: result.score,
              total_questions: result.totalQuestions,
              score_percent: result.scorePercent,
              passing_score: config.passingScore,
              time_spent_seconds: result.timeSpent,
              section_scores: sectionScores,
            })
            .select()
            .single();

          if (cert) {
            setEarnedCertificate(cert as unknown as Certificate);
          }

          // Award XP
          if (profile) {
            await supabase
              .from('profiles')
              .update({ total_xp: (profile.total_xp || 0) + config.xpReward })
              .eq('user_id', user.id);
          }
        }

        queryClient.invalidateQueries({ queryKey: ['profile'] });
        queryClient.invalidateQueries({ queryKey: ['test-history'] });
        queryClient.invalidateQueries({ queryKey: ['certificates'] });
      } catch (error) {
        console.error('Error saving test result:', error);
      }
    }

    setIsSubmitting(false);
  }, [user, config, answers, calculateResults, queryClient, clearSavedProgress]);

  const enterReviewMode = useCallback(() => {
    setIsReviewMode(true);
    setCurrentIndex(0);
  }, []);

  const exitReviewMode = useCallback(() => {
    setIsReviewMode(false);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
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
    exitReviewMode,
    formatTime,
    startTest,
    getCurrentSection,
    totalTime: config.timeLimit
  };
}
