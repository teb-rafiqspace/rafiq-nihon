import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';

// Mock auth - must be before vi.mock()
vi.mock('@/lib/auth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id' },
  })),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock supabase - must use inline functions only
vi.mock('@/integrations/supabase/client', () => {
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  
  return {
    supabase: {
      from: vi.fn(() => ({
        select: mockSelect.mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
            single: vi.fn().mockResolvedValue({ data: { chats_remaining: 5, plan_type: 'free' }, error: null }),
          }),
        }),
        insert: mockInsert.mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: 'msg-1' }, error: null }),
          }),
        }),
        update: mockUpdate.mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      })),
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { access_token: 'test-token' } },
          error: null,
        }),
      },
    },
  };
});

// Mock fetch for streaming
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocks
import { useRafiqChat } from './useRafiqChat';

describe('useRafiqChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('initialization', () => {
    it('initializes with empty messages', () => {
      const { result } = renderHook(() => useRafiqChat());
      
      expect(result.current.messages).toEqual([]);
    });

    it('starts loading history on mount', async () => {
      const { result } = renderHook(() => useRafiqChat());
      
      expect(result.current.isLoadingHistory).toBe(true);
      
      await waitFor(() => {
        expect(result.current.isLoadingHistory).toBe(false);
      });
    });

    it('loads remaining chats count', async () => {
      const { result } = renderHook(() => useRafiqChat());
      
      await waitFor(() => {
        expect(result.current.isLoadingHistory).toBe(false);
      });
      
      expect(result.current.remainingChats).toBeDefined();
    });
  });

  describe('sendMessage', () => {
    it('adds user message to list', async () => {
      // Setup streaming response mock
      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({ 
            done: false, 
            value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n') 
          })
          .mockResolvedValueOnce({ done: true }),
      };
      
      mockFetch.mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      });
      
      const { result } = renderHook(() => useRafiqChat());
      
      await waitFor(() => {
        expect(result.current.isLoadingHistory).toBe(false);
      });
      
      await act(async () => {
        await result.current.sendMessage('Hello, Rafiq!');
      });
      
      const userMessages = result.current.messages.filter(m => m.role === 'user');
      expect(userMessages.length).toBeGreaterThan(0);
    });

    it('prevents send while loading', async () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      const { result } = renderHook(() => useRafiqChat());
      
      await waitFor(() => {
        expect(result.current.isLoadingHistory).toBe(false);
      });
      
      // Start first message
      act(() => {
        result.current.sendMessage('First message');
      });
      
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('error handling', () => {
    it('handles API errors gracefully', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ error: 'Server error' }),
      });
      
      const { result } = renderHook(() => useRafiqChat());
      
      await waitFor(() => {
        expect(result.current.isLoadingHistory).toBe(false);
      });
      
      await act(async () => {
        await result.current.sendMessage('Hello');
      });
      
      // Should not be loading after error
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('auth token', () => {
    it('sendMessage includes auth token in request', async () => {
      const mockReader = {
        read: vi.fn().mockResolvedValue({ done: true }),
      };
      
      mockFetch.mockResolvedValue({
        ok: true,
        body: { getReader: () => mockReader },
      });
      
      const { result } = renderHook(() => useRafiqChat());
      
      await waitFor(() => {
        expect(result.current.isLoadingHistory).toBe(false);
      });
      
      await act(async () => {
        await result.current.sendMessage('Test');
      });
      
      // Check that fetch was called with Authorization header
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer'),
          }),
        })
      );
    });
  });
});
