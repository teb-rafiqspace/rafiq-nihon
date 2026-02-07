import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import { MockAuthProvider, AuthContextType, createMockUser, createMockSession } from '../mocks/auth';
import { TooltipProvider } from '@/components/ui/tooltip';

// Create a fresh query client for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

// Mock I18n Provider
interface MockI18nContextType {
  language: string;
  setLanguage: (lang: string) => void;
  currentLanguage: { code: string; name: string; nativeName: string; flag: string; isRTL: boolean };
  languages: { code: string; name: string; nativeName: string; flag: string }[];
  t: (key: string) => string;
  isRTL: boolean;
  formatDate: (date: Date | string) => string;
  formatTime: (date: Date | string) => string;
  formatRelativeTime: (date: Date | string) => string;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number) => string;
}

const MockI18nContext = React.createContext<MockI18nContextType>({
  language: 'id',
  setLanguage: vi.fn(),
  currentLanguage: { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', isRTL: false },
  languages: [{ code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' }],
  t: (key: string) => key,
  isRTL: false,
  formatDate: (date) => String(date),
  formatTime: (date) => String(date),
  formatRelativeTime: (date) => String(date),
  formatNumber: (num) => String(num),
  formatCurrency: (amount) => `Rp ${amount}`,
});

function MockI18nProvider({ children }: { children: ReactNode }) {
  return (
    <MockI18nContext.Provider value={{
      language: 'id',
      setLanguage: vi.fn(),
      currentLanguage: { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', isRTL: false },
      languages: [{ code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' }],
      t: (key: string) => key,
      isRTL: false,
      formatDate: (date) => new Date(date).toLocaleDateString(),
      formatTime: (date) => new Date(date).toLocaleTimeString(),
      formatRelativeTime: () => '1 day ago',
      formatNumber: (num) => num.toLocaleString(),
      formatCurrency: (amount) => `Rp ${amount.toLocaleString()}`,
    }}>
      {children}
    </MockI18nContext.Provider>
  );
}

// Export for use in tests
export { MockI18nContext };

// Custom render options
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authOverrides?: Partial<AuthContextType>;
  route?: string;
  routePath?: string;
  queryClient?: QueryClient;
}

// All-in-one wrapper with all providers
function AllProviders({
  children,
  authOverrides = {},
  route = '/',
  routePath = '/',
  queryClient,
}: {
  children: ReactNode;
  authOverrides?: Partial<AuthContextType>;
  route?: string;
  routePath?: string;
  queryClient?: QueryClient;
}) {
  const client = queryClient || createTestQueryClient();
  
  return (
    <QueryClientProvider client={client}>
      <MockAuthProvider overrides={authOverrides}>
        <MockI18nProvider>
          <MemoryRouter initialEntries={[route]}>
            <TooltipProvider>
              <Routes>
                <Route path={routePath} element={children} />
                <Route path="*" element={children} />
              </Routes>
            </TooltipProvider>
          </MemoryRouter>
        </MockI18nProvider>
      </MockAuthProvider>
    </QueryClientProvider>
  );
}

// Custom render function
function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    authOverrides,
    route,
    routePath,
    queryClient,
    ...renderOptions
  } = options;

  const user = userEvent.setup();

  return {
    user,
    ...render(ui, {
      wrapper: ({ children }) => (
        <AllProviders
          authOverrides={authOverrides}
          route={route}
          routePath={routePath}
          queryClient={queryClient}
        >
          {children}
        </AllProviders>
      ),
      ...renderOptions,
    }),
  };
}

// Render with authenticated user
function renderWithAuth(
  ui: ReactElement,
  userOverrides: Partial<Parameters<typeof createMockUser>[0]> = {},
  options: Omit<CustomRenderOptions, 'authOverrides'> = {}
) {
  const mockUser = createMockUser(userOverrides);
  const mockSession = createMockSession(mockUser);
  
  return customRender(ui, {
    ...options,
    authOverrides: {
      user: mockUser,
      session: mockSession,
      loading: false,
    },
  });
}

// Helper to wait for loading to finish
async function waitForLoadingToFinish() {
  await waitFor(() => {
    const loaders = screen.queryAllByRole('progressbar');
    const spinners = screen.queryAllByTestId(/loading|spinner/i);
    expect([...loaders, ...spinners]).toHaveLength(0);
  }, { timeout: 5000 });
}

// Mock navigation helper
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Export everything
export * from '@testing-library/react';
export { customRender as render, renderWithAuth, waitForLoadingToFinish, mockNavigate, createTestQueryClient };
