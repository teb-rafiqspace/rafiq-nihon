import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Mock auth
vi.mock('@/lib/auth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id' },
  })),
}));

// Mock quiz data
const mockQuizSets = [
  { id: 'quiz-1', title_jp: 'クイズ1', title_id: 'Quiz 1', category: 'vocabulary', is_daily: false, is_premium: false },
  { id: 'quiz-2', title_jp: 'デイリー', title_id: 'Daily', category: 'grammar', is_daily: true, is_premium: false },
  { id: 'quiz-3', title_jp: 'プレミアム', title_id: 'Premium', category: 'kanji', is_daily: false, is_premium: true },
];

const mockHistory = [
  { id: 'h1', quiz_set_id: 'quiz-1', score: 8, total_questions: 10, completed_at: '2024-01-15T10:00:00Z' },
  { id: 'h2', quiz_set_id: 'quiz-1', score: 9, total_questions: 10, completed_at: '2024-01-16T10:00:00Z' },
];

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table) => {
      if (table === 'practice_quiz_sets') {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: mockQuizSets, error: null }),
        };
      }
      if (table === 'user_practice_history') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: mockHistory, error: null }),
          insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      if (table === 'user_daily_progress') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
          upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      if (table === 'practice_quiz_questions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [
              { id: 'q1', question_text: 'Question 1', correct_answer: 'A', options: [{ id: 'A', text: 'Option A' }] },
            ],
            error: null,
          }),
        };
      }
      if (table === 'profiles') {
        return {
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
    }),
  },
}));

// Import after mocks
import { useQuizPractice } from './useQuizPractice';

function TestWrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useQuizPractice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('data fetching', () => {
    it('fetches quiz sets from database', async () => {
      const { result } = renderHook(() => useQuizPractice(), { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(result.current.loadingQuizSets).toBe(false);
      });
      
      expect(result.current.quizSets.length).toBeGreaterThan(0);
    });

    it('separates daily from regular sets', async () => {
      const { result } = renderHook(() => useQuizPractice(), { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(result.current.loadingQuizSets).toBe(false);
      });
      
      expect(result.current.regularQuizSets.every(q => !q.is_daily)).toBe(true);
      expect(result.current.dailyChallenge?.is_daily).toBe(true);
    });

    it('fetches user quiz history', async () => {
      const { result } = renderHook(() => useQuizPractice(), { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(result.current.loadingHistory).toBe(false);
      });
      
      expect(result.current.quizHistory.length).toBeGreaterThan(0);
    });
  });

  describe('quiz stats', () => {
    it('calculates quiz stats correctly', async () => {
      const { result } = renderHook(() => useQuizPractice(), { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(result.current.loadingHistory).toBe(false);
      });
      
      const stats = result.current.getQuizStats('quiz-1');
      
      expect(stats.attempts).toBe(2);
      expect(stats.bestScore).toBe(9);
      expect(stats.bestPercentage).toBe(90);
    });

    it('getBestPercentage returns highest score', async () => {
      const { result } = renderHook(() => useQuizPractice(), { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(result.current.loadingHistory).toBe(false);
      });
      
      const bestPercentage = result.current.getBestPercentage('quiz-1');
      
      expect(bestPercentage).toBe(90);
    });

    it('getBestPercentage returns null for unattempted quiz', async () => {
      const { result } = renderHook(() => useQuizPractice(), { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(result.current.loadingHistory).toBe(false);
      });
      
      const bestPercentage = result.current.getBestPercentage('quiz-nonexistent');
      
      expect(bestPercentage).toBeNull();
    });

    it('calculates average correctly', async () => {
      const { result } = renderHook(() => useQuizPractice(), { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(result.current.loadingHistory).toBe(false);
      });
      
      const stats = result.current.getQuizStats('quiz-1');
      
      // Average of 8 and 9 is 8.5
      expect(stats.averageScore).toBe(8.5);
      expect(stats.averagePercentage).toBe(85);
    });
  });

  describe('fetchQuestions', () => {
    it('loads quiz questions', async () => {
      const { result } = renderHook(() => useQuizPractice(), { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(result.current.loadingQuizSets).toBe(false);
      });
      
      const questions = await result.current.fetchQuestions('quiz-1');
      
      expect(questions.length).toBeGreaterThan(0);
      expect(questions[0].question_text).toBeDefined();
    });
  });

  describe('saveResult', () => {
    it('provides mutation function', async () => {
      const { result } = renderHook(() => useQuizPractice(), { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(result.current.loadingQuizSets).toBe(false);
      });
      
      expect(result.current.saveResult.mutate).toBeDefined();
      expect(result.current.saveResult.mutateAsync).toBeDefined();
    });
  });

  describe('getTimeUntilReset', () => {
    it('calculates time until midnight correctly', async () => {
      const { result } = renderHook(() => useQuizPractice(), { wrapper: TestWrapper });
      
      const timeUntilReset = result.current.getTimeUntilReset();
      
      expect(timeUntilReset).toHaveProperty('hours');
      expect(timeUntilReset).toHaveProperty('minutes');
      expect(timeUntilReset).toHaveProperty('seconds');
      
      // Hours should be between 0 and 23
      expect(timeUntilReset.hours).toBeGreaterThanOrEqual(0);
      expect(timeUntilReset.hours).toBeLessThanOrEqual(23);
      
      // Minutes and seconds should be between 0 and 59
      expect(timeUntilReset.minutes).toBeGreaterThanOrEqual(0);
      expect(timeUntilReset.minutes).toBeLessThanOrEqual(59);
      expect(timeUntilReset.seconds).toBeGreaterThanOrEqual(0);
      expect(timeUntilReset.seconds).toBeLessThanOrEqual(59);
    });
  });

  describe('streak', () => {
    it('returns streak count', async () => {
      const { result } = renderHook(() => useQuizPractice(), { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(result.current.loadingQuizSets).toBe(false);
      });
      
      expect(typeof result.current.streak).toBe('number');
    });
  });
});
