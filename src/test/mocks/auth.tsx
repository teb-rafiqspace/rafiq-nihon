import React, { createContext, useContext, ReactNode } from 'react';
import { vi } from 'vitest';
import { User, Session } from '@supabase/supabase-js';

// Mock user data
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-id-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: { full_name: 'Test User' },
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
  ...overrides,
} as User);

// Mock session data
export const createMockSession = (user: User = createMockUser()): Session => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user,
});

// Auth context type
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

// Default mock auth context values
export const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  user: null,
  session: null,
  loading: false,
  signUp: vi.fn().mockResolvedValue({ error: null }),
  signIn: vi.fn().mockResolvedValue({ error: null }),
  signInWithGoogle: vi.fn().mockResolvedValue({ error: null }),
  signOut: vi.fn().mockResolvedValue(undefined),
  resetPassword: vi.fn().mockResolvedValue({ error: null }),
  updatePassword: vi.fn().mockResolvedValue({ error: null }),
  ...overrides,
});

// Create the context
export const MockAuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock AuthProvider component
interface MockAuthProviderProps {
  children: ReactNode;
  overrides?: Partial<AuthContextType>;
}

export function MockAuthProvider({ children, overrides = {} }: MockAuthProviderProps) {
  const value = createMockAuthContext(overrides);
  
  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
}

// Hook to use the mock auth context
export function useMockAuth(): AuthContextType {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
}

// Helper to create authenticated mock provider
export function createAuthenticatedProvider(userOverrides?: Partial<User>) {
  const user = createMockUser(userOverrides);
  const session = createMockSession(user);
  
  return function AuthenticatedProvider({ children }: { children: ReactNode }) {
    return (
      <MockAuthProvider overrides={{ user, session, loading: false }}>
        {children}
      </MockAuthProvider>
    );
  };
}

// Helper to create loading provider
export function LoadingAuthProvider({ children }: { children: ReactNode }) {
  return (
    <MockAuthProvider overrides={{ loading: true }}>
      {children}
    </MockAuthProvider>
  );
}
