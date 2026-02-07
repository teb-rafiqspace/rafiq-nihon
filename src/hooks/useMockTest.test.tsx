import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
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
      order: vi.fn().mockResolvedValue({ data: mockQuestions, error: null }),
      single: vi.fn().mockResolvedValue({ data: { total_xp: 100 }, error: null }),
    })),
  },
}));

// Import after mocks
import { useMockTest } from './useMockTest';

function TestWrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useMockTest', () => {
  const defaultConfig = {
    testType: 'jlpt_n5' as const,
    timeLimit: 3600,
    passingScore: 60,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('initialization', () => {
    it('initializes with loading state', () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper: TestWrapper });
      
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('timer utilities', () => {
    it('formatTime displays MM:SS correctly', () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper: TestWrapper });
      
      expect(result.current.formatTime(3661)).toBe('61:01');
      expect(result.current.formatTime(65)).toBe('01:05');
      expect(result.current.formatTime(0)).toBe('00:00');
    });
  });

  describe('total time', () => {
    it('returns correct total time from config', () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper: TestWrapper });
      
      expect(result.current.totalTime).toBe(defaultConfig.timeLimit);
    });
  });

  describe('questions loaded', () => {
    it('initializes with testStarted false', () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper: TestWrapper });
      
      expect(result.current.testStarted).toBe(false);
    });

    it('has startTest function available', () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper: TestWrapper });
      
      expect(result.current.startTest).toBeDefined();
      expect(typeof result.current.startTest).toBe('function');
    });

    it('has navigation functions available', () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper: TestWrapper });
      
      expect(result.current.nextQuestion).toBeDefined();
      expect(result.current.prevQuestion).toBeDefined();
      expect(result.current.goToQuestion).toBeDefined();
    });

    it('has answer management functions available', () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper: TestWrapper });
      
      expect(result.current.setAnswer).toBeDefined();
      expect(result.current.toggleFlag).toBeDefined();
    });

    it('has counting functions available', () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper: TestWrapper });
      
      expect(result.current.getUnansweredCount).toBeDefined();
      expect(result.current.getFlaggedCount).toBeDefined();
      expect(result.current.getAnsweredCount).toBeDefined();
    });

    it('has review mode functions available', () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper: TestWrapper });
      
      expect(result.current.enterReviewMode).toBeDefined();
      expect(result.current.exitReviewMode).toBeDefined();
    });

    it('has section functions available', () => {
      const { result } = renderHook(() => useMockTest(defaultConfig), { wrapper: TestWrapper });
      
      expect(result.current.getCurrentSection).toBeDefined();
    });
  });
});
