import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Mock auth
vi.mock('@/lib/auth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id' },
  })),
}));

// Mock profile data
const mockProfile = {
  id: 'profile-1',
  user_id: 'test-user-id',
  full_name: 'Test User',
  avatar_url: null,
  learning_goal: 'general',
  skill_level: 'beginner',
  daily_goal_minutes: 15,
  current_streak: 5,
  longest_streak: 10,
  total_xp: 500,
  current_level: 3,
  lessons_completed: 15,
  last_active_at: new Date().toISOString(),
  onboarding_completed: true,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: new Date().toISOString(),
};

// Mock supabase
const mockMaybeSingle = vi.fn();
const mockSingle = vi.fn();
const mockUpdate = vi.fn();
const mockSelect = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
      }),
      update: mockUpdate.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      }),
    })),
  },
}));

// Import after mocks
import { useProfile, useUpdateProfile } from './useProfile';
import { useAuth } from '@/lib/auth';

describe('useProfile', () => {
  let queryClient: QueryClient;
  
  function TestWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    mockMaybeSingle.mockResolvedValue({ data: mockProfile, error: null });
    mockSingle.mockResolvedValue({ data: mockProfile, error: null });
  });

  describe('useProfile hook', () => {
    it('fetches profile for logged in user', async () => {
      const { result } = renderHook(() => useProfile(), { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.data).toEqual(mockProfile);
    });

    it('returns null when not logged in', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        session: null,
        loading: false,
        isEmailVerified: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
        resetPassword: vi.fn(),
        updatePassword: vi.fn(),
        resendVerificationEmail: vi.fn(),
      });
      
      const { result } = renderHook(() => useProfile(), { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      // Query should not run when user is null
      expect(result.current.data).toBeUndefined();
    });

    it('handles fetch errors', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: new Error('Database error') });
      
      vi.mocked(useAuth).mockReturnValue({
        user: { id: 'test-user-id' } as any,
        session: null,
        loading: false,
        isEmailVerified: true,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
        resetPassword: vi.fn(),
        updatePassword: vi.fn(),
        resendVerificationEmail: vi.fn(),
      });
      
      const { result } = renderHook(() => useProfile(), { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useUpdateProfile hook', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        user: { id: 'test-user-id' } as any,
        session: null,
        loading: false,
        isEmailVerified: true,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
        resetPassword: vi.fn(),
        updatePassword: vi.fn(),
        resendVerificationEmail: vi.fn(),
      });
    });

    it('provides mutate function for updating profile', () => {
      const { result } = renderHook(() => useUpdateProfile(), { wrapper: TestWrapper });
      
      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
    });

    it('updates profile successfully', async () => {
      const updatedProfile = { ...mockProfile, full_name: 'Updated Name' };
      mockSingle.mockResolvedValue({ data: updatedProfile, error: null });
      
      const { result } = renderHook(() => useUpdateProfile(), { wrapper: TestWrapper });
      
      await act(async () => {
        await result.current.mutateAsync({ full_name: 'Updated Name' });
      });
      
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('handles update errors', async () => {
      mockSingle.mockResolvedValue({ data: null, error: new Error('Update failed') });
      
      const { result } = renderHook(() => useUpdateProfile(), { wrapper: TestWrapper });
      
      await expect(
        act(async () => {
          await result.current.mutateAsync({ full_name: 'New Name' });
        })
      ).rejects.toThrow();
    });

    it('invalidates profile cache on success', async () => {
      mockSingle.mockResolvedValue({ data: mockProfile, error: null });
      
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      
      const { result } = renderHook(() => useUpdateProfile(), { wrapper: TestWrapper });
      
      await act(async () => {
        await result.current.mutateAsync({ full_name: 'New Name' });
      });
      
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['profile', 'test-user-id'] });
    });
  });
});
