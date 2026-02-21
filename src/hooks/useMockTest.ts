import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useQueryClient } from '@tanstack/react-query';

export interface MockTestQuestion {
  id: string;
  test_type: string;
  section: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  sort_order: number;
}

export interface TestAttempt {
  id: string;
  user_id: string;
  test_type: string;
  score: number;
  total_questions: number;
  time_spent_seconds: number | null;
  passed: boolean;
  completed_at: string;
}

export interface UserAnswer {
  questionId: string;
  answer: string | null;
  flagged: boolean;
}

export interface TestResult {
  score: number;
  totalQuestions: number;
  passed: boolean;
  timeSpent: number;
  sectionResults: {
    section: string;
    correct: number;
    total: number;
  }[];
}

export interface TestSection {
  id: string;
  name: string;
  nameJp: string;
  startIndex: number;
  count: number;
}

interface MockTestConfig {
  testType: 'kakunin' | 'jlpt_n5' | 'jlpt_n2' | 'ielts_mock' | 'toefl_mock';
  timeLimit: number; // in seconds
  passingScore: number; // percentage
}

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const STORAGE_KEY_PREFIX = 'mock_test_progress_';

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function shuffleQuestionsWithOptions(questions: MockTestQuestion[]): MockTestQuestion[] {
  return questions.map(q => {
    const shuffledOptions = shuffleArray(q.options);
    return { ...q, options: shuffledOptions };
  });
}

function shuffleWithinSections(questions: MockTestQuestion[]): MockTestQuestion[] {
  const sectionGroups: Record<string, MockTestQuestion[]> = {};
  const sectionOrder: string[] = [];

  questions.forEach(q => {
    if (!sectionGroups[q.section]) {
      sectionGroups[q.section] = [];
      sectionOrder.push(q.section);
    }
    sectionGroups[q.section].push(q);
  });

  const result: MockTestQuestion[] = [];
  sectionOrder.forEach(section => {
    const shuffled = shuffleArray(sectionGroups[section]);
    result.push(...shuffleQuestionsWithOptions(shuffled));
  });
  return result;
}

export function useMockTest(config: MockTestConfig) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [questions, setQuestions] = useState<MockTestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(config.timeLimit);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testStartTime, setTestStartTime] = useState<number | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [sections, setSections] = useState<TestSection[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  
  const storageKey = `${STORAGE_KEY_PREFIX}${config.testType}`;
  
  // Calculate sections from questions
  const calculateSections = useCallback((questionList: MockTestQuestion[]): TestSection[] => {
    const sectionMap: Record<string, { count: number; startIndex: number }> = {};
    let currentStartIndex = 0;
    
    questionList.forEach((q, index) => {
      if (!sectionMap[q.section]) {
        sectionMap[q.section] = { count: 0, startIndex: currentStartIndex };
        currentStartIndex = index;
        sectionMap[q.section].startIndex = index;
      }
      sectionMap[q.section].count++;
    });
    
    const sectionInfo: Record<string, { name: string; nameJp: string }> = {
      'kosakata': { name: 'Kosakata', nameJp: 'ごい' },
      'grammar': { name: 'Tata Bahasa', nameJp: 'ぶんぽう' },
      'membaca': { name: 'Pemahaman Bacaan', nameJp: 'どっかい' },
      'listening': { name: 'Listening', nameJp: '' },
      'reading': { name: 'Reading', nameJp: '' },
    };
    
    return Object.entries(sectionMap).map(([id, data]) => ({
      id,
      name: sectionInfo[id]?.name || id,
      nameJp: sectionInfo[id]?.nameJp || '',
      startIndex: data.startIndex,
      count: data.count
    }));
  }, []);
  
  // Load saved progress from localStorage
  const loadSavedProgress = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        // Check if saved data is still valid (less than 2 hours old)
        if (data.savedAt && Date.now() - data.savedAt < 2 * 60 * 60 * 1000) {
          return data;
        }
      }
    } catch (e) {
      console.error('Error loading saved progress:', e);
    }
    return null;
  }, [storageKey]);
  
  // Save progress to localStorage
  const saveProgress = useCallback(() => {
    if (!testStarted || testResult) return;

    try {
      const data = {
        answers,
        currentIndex,
        timeRemaining,
        testStartTime,
        questionIds: questions.map(q => q.id),
        savedAt: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving progress:', e);
    }
  }, [answers, currentIndex, timeRemaining, testStartTime, testStarted, testResult, storageKey, questions]);
  
  // Clear saved progress
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
        const { data, error } = await supabase
          .from('mock_test_questions')
          .select('*')
          .eq('test_type', config.testType)
          .order('sort_order', { ascending: true });
        
        if (error) throw error;
        
        const formattedQuestions: MockTestQuestion[] = (data || []).map(q => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string)
        }));
        
        // Check for saved progress to restore question order
        const saved = loadSavedProgress();
        let orderedQuestions: MockTestQuestion[];
        if (saved && saved.questionIds) {
          const questionMap = new Map(formattedQuestions.map(q => [q.id, q]));
          orderedQuestions = saved.questionIds
            .map((id: string) => questionMap.get(id))
            .filter(Boolean) as MockTestQuestion[];
          const savedIds = new Set(saved.questionIds);
          formattedQuestions.forEach(q => {
            if (!savedIds.has(q.id)) orderedQuestions.push(q);
          });
        } else {
          orderedQuestions = shuffleWithinSections(formattedQuestions);
        }

        setQuestions(orderedQuestions);
        setSections(calculateSections(orderedQuestions));

        const initialAnswers = orderedQuestions.map(q => ({
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
  
  // Start the test
  const startTest = useCallback(() => {
    // Check for saved progress
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
          // Auto submit when time runs out
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [testStarted, isLoading, testResult, isReviewMode]);
  
  // Auto-save
  useEffect(() => {
    if (!testStarted || testResult) return;
    
    autoSaveRef.current = setInterval(() => {
      saveProgress();
    }, AUTO_SAVE_INTERVAL);
    
    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [testStarted, testResult, saveProgress]);
  
  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveProgress();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveProgress]);
  
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  
  // Get current section info
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
  
  const getUnansweredCount = useCallback(() => {
    return answers.filter(a => a.answer === null).length;
  }, [answers]);
  
  const getFlaggedCount = useCallback(() => {
    return answers.filter(a => a.flagged).length;
  }, [answers]);
  
  const getUnansweredQuestions = useCallback(() => {
    return answers
      .map((a, i) => a.answer === null ? i : -1)
      .filter(i => i !== -1);
  }, [answers]);
  
  const getFlaggedQuestions = useCallback(() => {
    return answers
      .map((a, i) => a.flagged ? i : -1)
      .filter(i => i !== -1);
  }, [answers]);
  
  const getAnsweredCount = useCallback(() => {
    return answers.filter(a => a.answer !== null).length;
  }, [answers]);
  
  const calculateResults = useCallback((): TestResult => {
    const timeSpent = testStartTime ? Math.round((Date.now() - testStartTime) / 1000) : config.timeLimit;
    
    // Calculate score
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
    
    const percentage = (correctCount / questions.length) * 100;
    const passed = percentage >= config.passingScore;
    
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
      sectionResults
    };
  }, [questions, answers, testStartTime, config.timeLimit, config.passingScore]);
  
  const submitTest = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current);
    }
    
    setIsSubmitting(true);
    
    const result = calculateResults();
    setTestResult(result);
    
    // Clear saved progress
    clearSavedProgress();
    
    // Save to database
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
        
        // Award XP based on score (only if passed)
        if (result.passed) {
          const xpMap: Record<string, number> = { jlpt_n5: 100, jlpt_n2: 200, ielts_mock: 200, toefl_mock: 200 };
          const xpEarned = xpMap[config.testType] || 50;
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('total_xp')
            .eq('user_id', user.id)
            .single();
          
          if (profile) {
            await supabase
              .from('profiles')
              .update({ total_xp: (profile.total_xp || 0) + xpEarned })
              .eq('user_id', user.id);
          }
        }
        
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        queryClient.invalidateQueries({ queryKey: ['test-history'] });
      } catch (error) {
        console.error('Error saving test result:', error);
      }
    }
    
    setIsSubmitting(false);
  }, [user, config.testType, answers, calculateResults, queryClient, clearSavedProgress]);
  
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
