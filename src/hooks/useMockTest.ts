import React, { useState, useEffect, useCallback, useRef } from 'react';
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

interface MockTestConfig {
  testType: 'kakunin' | 'jlpt_n5';
  timeLimit: number; // in seconds
  passingScore: number; // percentage
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
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
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
        
        setQuestions(formattedQuestions);
        setAnswers(formattedQuestions.map(q => ({
          questionId: q.id,
          answer: null,
          flagged: false
        })));
        setTestStartTime(Date.now());
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuestions();
  }, [config.testType]);
  
  // Timer
  useEffect(() => {
    if (isLoading || testResult || isReviewMode) return;
    
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
  }, [isLoading, testResult, isReviewMode]);
  
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  
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
      timeSpent,
      sectionResults
    };
  }, [questions, answers, testStartTime, config.timeLimit, config.passingScore]);
  
  const submitTest = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setIsSubmitting(true);
    
    const result = calculateResults();
    setTestResult(result);
    
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
        
        // Award XP based on score
        const xpEarned = Math.round((result.score / result.totalQuestions) * 50);
        
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
        
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        queryClient.invalidateQueries({ queryKey: ['test-history'] });
      } catch (error) {
        console.error('Error saving test result:', error);
      }
    }
    
    setIsSubmitting(false);
  }, [user, config.testType, answers, calculateResults, queryClient]);
  
  const enterReviewMode = useCallback(() => {
    setIsReviewMode(true);
    setCurrentIndex(0);
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
  };
}
