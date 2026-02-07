import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from './auth';

// Mock Supabase client
const mockOnAuthStateChange = vi.fn();
const mockGetSession = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockSignOut = vi.fn();
const mockResetPasswordForEmail = vi.fn();
const mockUpdateUser = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: (...args: any[]) => mockOnAuthStateChange(...args),
      getSession: () => mockGetSession(),
      signInWithPassword: (params: any) => mockSignInWithPassword(params),
      signUp: (params: any) => mockSignUp(params),
      signInWithOAuth: (params: any) => mockSignInWithOAuth(params),
      signOut: () => mockSignOut(),
      resetPasswordForEmail: (email: string, options: any) => mockResetPasswordForEmail(email, options),
      updateUser: (params: any) => mockUpdateUser(params),
    },
  },
}));

describe('AuthProvider', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: { full_name: 'Test User' },
  };

  const mockSession = {
    access_token: 'test-token',
    user: mockUser,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('initialization', () => {
    it('starts with loading state', () => {
      mockGetSession.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('sets user after getSession resolves', async () => {
      mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
    });

    it('handles session restoration from storage', async () => {
      mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.session).toEqual(mockSession);
      });
    });
  });

  describe('signUp', () => {
    it('creates user with correct parameters', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
      mockSignUp.mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      await act(async () => {
        await result.current.signUp('test@example.com', 'password123', 'Test User');
      });
      
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: expect.stringContaining('/'),
          data: {
            full_name: 'Test User',
          },
        },
      });
    });

    it('returns error on failure', async () => {
      const mockError = new Error('Sign up failed');
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
      mockSignUp.mockResolvedValue({ data: null, error: mockError });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      let signUpResult: { error: Error | null };
      await act(async () => {
        signUpResult = await result.current.signUp('test@example.com', 'password123', 'Test');
      });
      
      expect(signUpResult!.error).toEqual(mockError);
    });
  });

  describe('signIn', () => {
    it('calls signInWithPassword with correct credentials', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
      mockSignInWithPassword.mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });
      
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('returns error on failure', async () => {
      const mockError = new Error('Invalid credentials');
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
      mockSignInWithPassword.mockResolvedValue({ data: null, error: mockError });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      let signInResult: { error: Error | null };
      await act(async () => {
        signInResult = await result.current.signIn('test@example.com', 'wrongpassword');
      });
      
      expect(signInResult!.error).toEqual(mockError);
    });
  });

  describe('signInWithGoogle', () => {
    it('initiates OAuth flow', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
      mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      await act(async () => {
        await result.current.signInWithGoogle();
      });
      
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/'),
        },
      });
    });
  });

  describe('signOut', () => {
    it('clears user and session', async () => {
      mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });
      mockSignOut.mockResolvedValue({ error: null });
      
      // Simulate auth state change callback
      let authCallback: any;
      mockOnAuthStateChange.mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => expect(result.current.session).toEqual(mockSession));
      
      await act(async () => {
        await result.current.signOut();
        // Simulate auth state change to signed out
        authCallback('SIGNED_OUT', null);
      });
      
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('sends password reset email', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
      mockResetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      await act(async () => {
        await result.current.resetPassword('test@example.com');
      });
      
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: expect.stringContaining('/reset-password'),
      });
    });
  });

  describe('updatePassword', () => {
    it('updates password successfully', async () => {
      mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });
      mockUpdateUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      let updateResult: { error: Error | null };
      await act(async () => {
        updateResult = await result.current.updatePassword('newpassword123');
      });
      
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'newpassword123' });
      expect(updateResult!.error).toBeNull();
    });
  });

  describe('onAuthStateChange', () => {
    it('updates user when auth state changes', async () => {
      let authCallback: any;
      mockOnAuthStateChange.mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      expect(result.current.user).toBeNull();
      
      // Simulate sign in event
      act(() => {
        authCallback('SIGNED_IN', mockSession);
      });
      
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
    });
  });
});
