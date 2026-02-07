import { vi } from 'vitest';

// Mock user and session data
export const mockUser = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: { full_name: 'Test User' },
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
};

export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
};

// Create chainable query builder mock
export const createQueryBuilder = () => {
  const builder: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: vi.fn().mockImplementation((callback) => 
      Promise.resolve({ data: [], error: null }).then(callback)
    ),
  };
  return builder;
};

// Create mock supabase client
export const createMockSupabase = () => {
  const queryBuilder = createQueryBuilder();
  
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      }),
    },
    from: vi.fn().mockReturnValue(queryBuilder),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  };
};

// Default mock instance
export const mockSupabase = createMockSupabase();

// Helper to reset all mocks
export const resetSupabaseMocks = () => {
  vi.clearAllMocks();
};

// Helper to mock authenticated state
export const mockAuthenticatedState = (supabase: ReturnType<typeof createMockSupabase>) => {
  supabase.auth.getSession.mockResolvedValue({
    data: { session: mockSession },
    error: null,
  });
  supabase.auth.getUser.mockResolvedValue({
    data: { user: mockUser },
    error: null,
  });
};

// Helper to mock unauthenticated state
export const mockUnauthenticatedState = (supabase: ReturnType<typeof createMockSupabase>) => {
  supabase.auth.getSession.mockResolvedValue({
    data: { session: null },
    error: null,
  });
  supabase.auth.getUser.mockResolvedValue({
    data: { user: null },
    error: null,
  });
};
