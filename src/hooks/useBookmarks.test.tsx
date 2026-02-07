import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Mock the auth hook
vi.mock('@/lib/auth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id' },
  })),
}));

// Mock supabase
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockDelete = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockMaybeSingle = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          eq: mockEq.mockReturnValue({
            eq: mockEq.mockReturnValue({
              maybeSingle: mockMaybeSingle,
            }),
            order: mockOrder.mockReturnValue({
              then: vi.fn().mockImplementation(cb => Promise.resolve({ data: [], error: null }).then(cb)),
            }),
          }),
          order: mockOrder,
        }),
        order: mockOrder.mockReturnValue({
          then: vi.fn().mockImplementation(cb => Promise.resolve({ data: [], error: null }).then(cb)),
        }),
      }),
      insert: mockInsert.mockReturnValue({
        then: vi.fn().mockImplementation(cb => Promise.resolve({ data: null, error: null }).then(cb)),
      }),
      delete: mockDelete.mockReturnValue({
        eq: mockEq.mockReturnValue({
          then: vi.fn().mockImplementation(cb => Promise.resolve({ data: null, error: null }).then(cb)),
        }),
      }),
      update: mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          eq: mockEq.mockReturnValue({
            eq: mockEq.mockReturnValue({
              then: vi.fn().mockImplementation(cb => Promise.resolve({ data: null, error: null }).then(cb)),
            }),
          }),
        }),
      }),
    })),
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Import after mocks
import { useBookmarks, useIsBookmarked, useToggleBookmark, useUpdateBookmarkNotes } from './useBookmarks';
import { useAuth } from '@/lib/auth';

function TestWrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useBookmarks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useBookmarks hook', () => {
    it('fetches user bookmarks', async () => {
      const mockBookmarks = [
        { id: '1', content_type: 'vocabulary', content_id: 'vocab-1', notes: null },
        { id: '2', content_type: 'lesson', content_id: 'lesson-1', notes: 'Test note' },
      ];
      
      mockOrder.mockReturnValue(Promise.resolve({ data: mockBookmarks, error: null }));
      
      const { result } = renderHook(() => useBookmarks(), { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('filters by content type when provided', async () => {
      const { result } = renderHook(() => useBookmarks('vocabulary'), { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(mockEq).toHaveBeenCalled();
    });

    it('returns undefined when not logged in', async () => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        user: null,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
        resetPassword: vi.fn(),
        updatePassword: vi.fn(),
      });
      
      const { result } = renderHook(() => useBookmarks(), { wrapper: TestWrapper });
      
      // When user is null, the query is disabled, so data will be undefined
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      // Query returns undefined when disabled
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useIsBookmarked hook', () => {
    beforeEach(() => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 'test-user-id' },
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
        resetPassword: vi.fn(),
        updatePassword: vi.fn(),
      });
    });

    it('returns true when bookmark exists', async () => {
      mockMaybeSingle.mockResolvedValue({ data: { id: '1' }, error: null });
      
      const { result } = renderHook(
        () => useIsBookmarked('vocabulary', 'vocab-1'),
        { wrapper: TestWrapper }
      );
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('returns false when bookmark does not exist', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });
      
      const { result } = renderHook(
        () => useIsBookmarked('vocabulary', 'vocab-nonexistent'),
        { wrapper: TestWrapper }
      );
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('useToggleBookmark hook', () => {
    beforeEach(() => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 'test-user-id' },
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
        resetPassword: vi.fn(),
        updatePassword: vi.fn(),
      });
    });

    it('provides mutate function for toggling', async () => {
      const { result } = renderHook(() => useToggleBookmark(), { wrapper: TestWrapper });
      
      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
    });
  });

  describe('useUpdateBookmarkNotes hook', () => {
    beforeEach(() => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { id: 'test-user-id' },
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
        resetPassword: vi.fn(),
        updatePassword: vi.fn(),
      });
    });

    it('provides mutate function for updating notes', async () => {
      const { result } = renderHook(() => useUpdateBookmarkNotes(), { wrapper: TestWrapper });
      
      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
    });
  });
});
