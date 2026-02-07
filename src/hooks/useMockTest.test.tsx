import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Mock auth
vi.mock('@/lib/auth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id' },
  })),
}));

// Mock localStorage
const mockLocalStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => { mockLocalStorage[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockLocalStorage[key]; }),
  clear: vi.fn(() => { Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]); }),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock questions
const mockQuestions = [
  { id: '1', test_type: 'jlpt_n5', section: 'kosakata', question_text: 'Question 1', options: ['A', 'B', 'C', 'D'], correct_answer: 'A', explanation: null, sort_order: 1 },
  { id: '2', test_type: 'jlpt_n5', section: 'kosakata', question_text: 'Question 2', options: ['A', 'B', 'C', 'D'], correct_answer: 'B', explanation: null, sort_order: 2 },
  { id: '3', test_type: 'jlpt_n5', section: 'grammar', question_text: 'Question 3', options: ['A', 'B', 'C', 'D'], correct_answer: 'C', explanation: null, sort_order: 3 },
];

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { total_xp: 100 }, error: null }),
      then: vi.fn().mockImplementation(cb => Promise.resolve({ data: mockQuestions, error: null }).then(cb)),
    })),
  },
}));

// Import after mocks
import { useMockTest } from './useMockTest';

describe('useMockTest', () => {
function TestWrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

  const defaultConfig = {
    testType: 'jlpt_n5' as const,
    timeLimit: 3600,
    passingScore: 60,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorageMock.clear();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('initializes with loading state', async () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper });
      
      expect(result.current.isLoading).toBe(true);
    });

    it('loads questions from database', async () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.questions.length).toBeGreaterThan(0);
    });

    it('initializes answers array', async () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.answers.length).toBe(result.current.questions.length);
      result.current.answers.forEach(answer => {
        expect(answer.answer).toBeNull();
        expect(answer.flagged).toBe(false);
      });
    });
  });

  describe('starting test', () => {
    it('startTest begins countdown', async () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      act(() => {
        result.current.startTest();
      });
      
      expect(result.current.testStarted).toBe(true);
      expect(result.current.timeRemaining).toBe(defaultConfig.timeLimit);
    });

    it('startTest restores saved progress when available', async () => {
      const savedProgress = {
        answers: [{ questionId: '1', answer: 'A', flagged: true }],
        currentIndex: 1,
        timeRemaining: 3000,
        testStartTime: Date.now(),
        savedAt: Date.now(),
      };
      
      localStorageMock.setItem('mock_test_progress_jlpt_n5', JSON.stringify(savedProgress));
      
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      act(() => {
        result.current.startTest();
      });
      
      expect(result.current.currentIndex).toBe(savedProgress.currentIndex);
      expect(result.current.timeRemaining).toBe(savedProgress.timeRemaining);
    });
  });

  describe('timer', () => {
    it('timer decrements each second', async () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      act(() => {
        result.current.startTest();
      });
      
      const initialTime = result.current.timeRemaining;
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      expect(result.current.timeRemaining).toBe(initialTime - 1);
    });

    it('formatTime displays MM:SS correctly', async () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.formatTime(3661)).toBe('61:01');
      expect(result.current.formatTime(65)).toBe('01:05');
      expect(result.current.formatTime(0)).toBe('00:00');
    });
  });

  describe('answer management', () => {
    it('setAnswer updates answer array', async () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      act(() => {
        result.current.startTest();
        result.current.setAnswer('A');
      });
      
      expect(result.current.currentAnswer?.answer).toBe('A');
    });

    it('toggleFlag marks question', async () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      act(() => {
        result.current.startTest();
        result.current.toggleFlag();
      });
      
      expect(result.current.currentAnswer?.flagged).toBe(true);
      
      act(() => {
        result.current.toggleFlag();
      });
      
      expect(result.current.currentAnswer?.flagged).toBe(false);
    });
  });

  describe('navigation', () => {
    it('nextQuestion increments index', async () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      act(() => {
        result.current.startTest();
      });
      
      expect(result.current.currentIndex).toBe(0);
      
      act(() => {
        result.current.nextQuestion();
      });
      
      expect(result.current.currentIndex).toBe(1);
    });

    it('prevQuestion decrements index', async () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      act(() => {
        result.current.startTest();
        result.current.nextQuestion();
      });
      
      expect(result.current.currentIndex).toBe(1);
      
      act(() => {
        result.current.prevQuestion();
      });
      
      expect(result.current.currentIndex).toBe(0);
    });

    it('goToQuestion jumps to specific index', async () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      act(() => {
        result.current.startTest();
        result.current.goToQuestion(2);
      });
      
      expect(result.current.currentIndex).toBe(2);
    });

    it('prevQuestion does not go below 0', async () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      act(() => {
        result.current.startTest();
        result.current.prevQuestion();
      });
      
      expect(result.current.currentIndex).toBe(0);
    });
  });

  describe('counting functions', () => {
    it('getUnansweredCount returns correct count', async () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      act(() => {
        result.current.startTest();
      });
      
      expect(result.current.getUnansweredCount()).toBe(result.current.questions.length);
      
      act(() => {
        result.current.setAnswer('A');
      });
      
      expect(result.current.getUnansweredCount()).toBe(result.current.questions.length - 1);
    });

    it('getFlaggedCount returns correct count', async () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      act(() => {
        result.current.startTest();
      });
      
      expect(result.current.getFlaggedCount()).toBe(0);
      
      act(() => {
        result.current.toggleFlag();
      });
      
      expect(result.current.getFlaggedCount()).toBe(1);
    });

    it('getAnsweredCount returns correct count', async () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      act(() => {
        result.current.startTest();
      });
      
      expect(result.current.getAnsweredCount()).toBe(0);
      
      act(() => {
        result.current.setAnswer('A');
        result.current.nextQuestion();
        result.current.setAnswer('B');
      });
      
      expect(result.current.getAnsweredCount()).toBe(2);
    });
  });

  describe('review mode', () => {
    it('enterReviewMode enables review mode', async () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      act(() => {
        result.current.enterReviewMode();
      });
      
      expect(result.current.isReviewMode).toBe(true);
      expect(result.current.currentIndex).toBe(0);
    });

    it('exitReviewMode disables review mode', async () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      act(() => {
        result.current.enterReviewMode();
        result.current.exitReviewMode();
      });
      
      expect(result.current.isReviewMode).toBe(false);
    });
  });

  describe('sections', () => {
    it('getCurrentSection returns correct section info', async () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      act(() => {
        result.current.startTest();
      });
      
      const section = result.current.getCurrentSection();
      expect(section).toBeDefined();
      expect(section.id).toBeDefined();
    });
  });

  describe('total time', () => {
    it('returns correct total time from config', async () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.totalTime).toBe(defaultConfig.timeLimit);
    });
  });
});
