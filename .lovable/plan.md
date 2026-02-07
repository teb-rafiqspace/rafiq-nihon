
# Comprehensive Test Suite Implementation Plan

## Summary
This plan implements a complete testing infrastructure and test suite covering authentication, flashcards, quizzes, mock tests, AI chat, bookmarks, profiles, and settings. The implementation creates 17 new test files with approximately 200+ test cases across all major features.

## Phase 1: Test Infrastructure

### 1.1 Supabase Mock (`src/test/mocks/supabase.ts`)
Creates comprehensive mocks for all Supabase operations:
- **Auth operations**: `signInWithPassword`, `signUp`, `signInWithOAuth`, `signOut`, `getSession`, `onAuthStateChange`, `resetPasswordForEmail`, `updateUser`
- **Database operations**: `from().select()`, `insert()`, `update()`, `delete()`, `maybeSingle()`, `single()`
- **RPC calls**: Mock for database functions
- Configurable mock responses for each test case

### 1.2 Auth Context Mock (`src/test/mocks/auth.tsx`)
A configurable mock provider for authenticated tests:
- Simulates logged-in/logged-out states
- Configurable user and session objects
- Mock implementations for all auth methods
- Helper function `createMockUser()` for test data

### 1.3 Test Utilities (`src/test/utils/test-utils.tsx`)
Custom render function with all providers:
- `QueryClientProvider` with test configuration
- Mock `AuthProvider`
- Mock `I18nProvider`
- `BrowserRouter` for navigation tests
- `TooltipProvider` for UI components
- Helper functions: `waitForLoadingToFinish()`, `mockNavigation()`

## Phase 2: Authentication Tests

### 2.1 Auth Context Tests (`src/lib/auth.test.tsx`)
Tests for the core authentication context:

| Test Case | Description |
|-----------|-------------|
| `starts with loading state` | Verifies initial loading=true |
| `sets user after getSession resolves` | Session restoration works |
| `signUp creates user with metadata` | Correct sign up parameters |
| `signUp sets redirect URL correctly` | Uses window.location.origin |
| `signIn calls signInWithPassword` | Correct credentials passed |
| `signIn returns error on failure` | Error handling works |
| `signInWithGoogle initiates OAuth` | Google OAuth flow |
| `signOut clears user and session` | Logout works properly |
| `resetPassword sends email` | Password reset flow |
| `updatePassword changes password` | Password update flow |
| `onAuthStateChange updates user` | Real-time auth updates |

### 2.2 Auth Page Tests (`src/pages/Auth.test.tsx`)
Tests for the Auth page UI and interactions:

| Test Case | Description |
|-----------|-------------|
| `renders login form by default` | Shows email/password inputs |
| `toggle switches to signup mode` | Signup form appears |
| `shows fullName field in signup mode` | Name input visible |
| `validates email format` | Shows error for invalid email |
| `validates password length` | Requires 6+ characters |
| `validates fullName in signup mode` | Requires 2+ characters |
| `shows loading spinner during submit` | Loading state displayed |
| `disables button during loading` | Prevents double submit |
| `calls signIn on login submit` | Integration with auth |
| `calls signUp on signup submit` | Integration with auth |
| `navigates to /home on login success` | Redirect works |
| `navigates to /onboarding on signup` | Redirect works |
| `shows error toast on login failure` | Error handling |
| `shows forgot password link` | Link present and clickable |
| `Google login button works` | OAuth integration |

## Phase 3: Flashcard System Tests

### 3.1 useFlashcards Hook Tests (`src/hooks/useFlashcards.test.ts`)
Tests for flashcard state management:

| Test Case | Description |
|-----------|-------------|
| `initializes with first deck` | Default deck selection |
| `returns correct deck cards` | Cards match selected deck |
| `setSelectedDeckId changes deck` | Deck switching works |
| `setSelectedDeckId resets session` | Session cleared on switch |
| `flipCard toggles isFlipped` | Card flip animation |
| `markKnown adds to known set` | Known count increases |
| `markKnown advances to next card` | Index increments |
| `markUnknown adds to unknown list` | Unknown tracking |
| `markUnknown advances to next card` | Index increments |
| `prevents duplicate unknown entries` | No duplicates |
| `isComplete true when all reviewed` | Completion detection |
| `progress calculates correctly` | Percentage math |
| `reviewUnknown sets review mode` | Review mode activation |
| `reviewUnknown uses unknown cards` | Correct card set |
| `resetSession clears all state` | Full reset works |

### 3.2 FlashCard Component Tests (`src/components/flashcard/FlashCard.test.tsx`)
Tests for the FlashCard UI component:

| Test Case | Description |
|-----------|-------------|
| `renders Japanese word on front` | Displays wordJp |
| `calls onFlip when clicked` | Click handler works |
| `shows animation class when flipped` | rotateY applied |
| `displays reading when flipped` | Reading visible on back |
| `displays meaning when flipped` | meaningId visible |
| `displays example when provided` | Example section shown |
| `audio button triggers speak` | TTS integration |
| `audio button shows loading state` | Spinner during playback |
| `bookmark button shown by default` | BookmarkButton present |
| `bookmark button hidden when disabled` | Prop controls visibility |
| `tap instruction shown on front` | UX guidance text |

## Phase 4: Quiz & Mock Test Tests

### 4.1 useMockTest Hook Tests (`src/hooks/useMockTest.test.ts`)
Tests for mock test functionality:

| Test Case | Description |
|-----------|-------------|
| `initializes with loading state` | Starts loading |
| `loads questions from database` | Supabase query works |
| `formats question options correctly` | JSON parsing |
| `initializes answers array` | Empty answers created |
| `startTest begins countdown` | Timer starts |
| `startTest restores saved progress` | localStorage integration |
| `timer decrements each second` | Countdown works |
| `auto-submits at time 0` | Time limit enforced |
| `setAnswer updates answer array` | Answer selection |
| `toggleFlag marks question` | Flagging works |
| `nextQuestion increments index` | Navigation forward |
| `prevQuestion decrements index` | Navigation backward |
| `goToQuestion jumps to index` | Direct navigation |
| `calculateResults computes score` | Scoring logic |
| `calculateResults groups by section` | Section breakdown |
| `submitTest saves to database` | Persistence |
| `submitTest awards XP on pass` | XP integration |
| `formatTime displays MM:SS` | Time formatting |
| `getUnansweredCount returns count` | Unanswered tracking |
| `getFlaggedCount returns count` | Flag tracking |
| `enterReviewMode shows answers` | Review functionality |
| `saveProgress to localStorage` | Auto-save |

### 4.2 useQuizPractice Hook Tests (`src/hooks/useQuizPractice.test.ts`)
Tests for quiz practice functionality:

| Test Case | Description |
|-----------|-------------|
| `fetches quiz sets from database` | Data loading |
| `separates daily from regular sets` | Filtering logic |
| `fetches user quiz history` | History query |
| `calculates quiz stats correctly` | Stats computation |
| `getBestPercentage returns highest` | Best score tracking |
| `fetchQuestions loads quiz items` | Question loading |
| `saveResult persists to database` | Result saving |
| `saveResult updates daily progress` | Daily challenge |
| `getTimeUntilReset calculates correctly` | Reset timer |
| `streak calculation works` | Streak logic |

## Phase 5: AI Chat Tests

### 5.1 useRafiqChat Hook Tests (`src/hooks/useRafiqChat.test.ts`)
Tests for AI chat functionality:

| Test Case | Description |
|-----------|-------------|
| `initializes with empty messages` | Initial state |
| `loads chat history on mount` | History fetching |
| `loads remaining chats count` | Subscription check |
| `sendMessage adds user message` | Message creation |
| `sendMessage calls edge function` | API integration |
| `sendMessage includes auth token` | JWT injection |
| `handles streaming response` | SSE parsing |
| `accumulates streamed content` | Text buffering |
| `saves messages to database` | Persistence |
| `decrements remaining chats` | Limit tracking |
| `prevents send when at limit` | Limit enforcement |
| `prevents send while loading` | Debouncing |
| `submitFeedback updates message` | Feedback system |
| `handles API errors gracefully` | Error handling |
| `shows error toast on failure` | User feedback |

## Phase 6: Bookmark System Tests

### 6.1 useBookmarks Hook Tests (`src/hooks/useBookmarks.test.ts`)
Tests for bookmark functionality:

| Test Case | Description |
|-----------|-------------|
| `fetches user bookmarks` | Query execution |
| `filters by content type` | Type filtering |
| `returns empty when not logged in` | Auth check |
| `useIsBookmarked returns true when exists` | Check logic |
| `useIsBookmarked returns false when missing` | Check logic |
| `useToggleBookmark adds bookmark` | Insert operation |
| `useToggleBookmark removes bookmark` | Delete operation |
| `useToggleBookmark shows success toast` | User feedback |
| `useUpdateBookmarkNotes updates notes` | Update operation |
| `invalidates queries on mutation` | Cache invalidation |

## Phase 7: Profile & Settings Tests

### 7.1 useProfile Hook Tests (`src/hooks/useProfile.test.tsx`)
Tests for profile management:

| Test Case | Description |
|-----------|-------------|
| `fetches profile for logged in user` | Profile loading |
| `returns null when not logged in` | Auth check |
| `useUpdateProfile updates profile` | Update mutation |
| `invalidates profile cache on update` | Cache handling |
| `handles update errors` | Error handling |

### 7.2 useTheme Hook Tests (`src/hooks/useTheme.test.ts`)
Tests for theme management:

| Test Case | Description |
|-----------|-------------|
| `initializes from localStorage` | Persistence |
| `defaults to light when no saved` | Default value |
| `setTheme updates state` | State change |
| `setTheme saves to localStorage` | Persistence |
| `applies light class correctly` | DOM manipulation |
| `applies dark class correctly` | DOM manipulation |
| `system follows media query` | System theme |
| `toggleTheme switches light/dark` | Toggle function |
| `isDark computed correctly` | Computed value |

## Phase 8: Settings Page Tests

### 8.1 Settings Page Tests (`src/pages/Settings.test.tsx`)
Tests for the Settings page:

| Test Case | Description |
|-----------|-------------|
| `renders all sections` | Page structure |
| `theme buttons switch theme` | Theme switching |
| `language dialog opens` | Language selection |
| `language selection updates i18n` | Language change |
| `edit profile dialog opens` | Profile editing |
| `profile form saves changes` | Profile update |
| `daily goal slider works` | Slider interaction |
| `study reminder toggle works` | Switch toggle |
| `logout confirmation appears` | Logout flow |
| `logout navigates to /` | Navigation |
| `change password dialog opens` | Password change |
| `back button navigates` | Navigation |

## Phase 9: Home Dashboard Tests

### 9.1 Home Page Tests (`src/pages/Home.test.tsx`)
Tests for the Home dashboard:

| Test Case | Description |
|-----------|-------------|
| `shows loading spinner initially` | Loading state |
| `displays greeting based on time` | Time-based greeting |
| `shows user first name` | Name extraction |
| `displays XP stat` | Stats display |
| `displays level stat` | Stats display |
| `displays streak stat` | Stats display |
| `displays lessons completed` | Stats display |
| `shows Kemnaker track progress` | Track progress |
| `shows JLPT track progress` | Track progress |
| `quick action buttons navigate` | Navigation |
| `daily challenge card renders` | Challenge display |
| `leaderboard card renders` | Leaderboard display |
| `recommendation card renders` | Recommendations |

## Phase 10: Practice Page Tests

### 10.1 Practice Page Tests (`src/pages/Practice.test.tsx`)
Tests for the Practice page:

| Test Case | Description |
|-----------|-------------|
| `renders with flashcard tab active` | Default tab |
| `tab buttons switch content` | Tab switching |
| `flashcard section renders` | Component loading |
| `quiz section renders` | Component loading |
| `test section renders mock tests` | Test cards |
| `progress section renders` | Progress display |
| `premium modal opens for locked` | Premium gate |
| `test history displays attempts` | History list |
| `canTakeTest returns correctly` | Free limit logic |
| `getBestScore calculates max` | Score tracking |

## File Summary

| File Path | Test Count | Purpose |
|-----------|------------|---------|
| `src/test/mocks/supabase.ts` | - | Supabase mock utilities |
| `src/test/mocks/auth.tsx` | - | Auth context mock |
| `src/test/utils/test-utils.tsx` | - | Custom render utilities |
| `src/lib/auth.test.tsx` | 11 | Auth context tests |
| `src/pages/Auth.test.tsx` | 15 | Auth page tests |
| `src/hooks/useFlashcards.test.ts` | 15 | Flashcard hook tests |
| `src/components/flashcard/FlashCard.test.tsx` | 11 | FlashCard component tests |
| `src/hooks/useMockTest.test.ts` | 22 | Mock test hook tests |
| `src/hooks/useQuizPractice.test.ts` | 10 | Quiz practice hook tests |
| `src/hooks/useRafiqChat.test.ts` | 15 | AI chat hook tests |
| `src/hooks/useBookmarks.test.ts` | 10 | Bookmark hook tests |
| `src/hooks/useProfile.test.tsx` | 5 | Profile hook tests |
| `src/hooks/useTheme.test.ts` | 9 | Theme hook tests |
| `src/pages/Settings.test.tsx` | 12 | Settings page tests |
| `src/pages/Home.test.tsx` | 13 | Home page tests |
| `src/pages/Practice.test.tsx` | 10 | Practice page tests |

**Total: 17 files, ~158 test cases**

## Technical Details

### Mock Strategies

**Supabase Client Mock Pattern:**
```typescript
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
    })),
  },
}));
```

**Auth Context Mock Pattern:**
```typescript
export const mockAuthContext = {
  user: null,
  session: null,
  loading: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  signInWithGoogle: vi.fn(),
  resetPassword: vi.fn(),
  updatePassword: vi.fn(),
};

export function MockAuthProvider({ children, overrides = {} }) {
  return (
    <AuthContext.Provider value={{ ...mockAuthContext, ...overrides }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Test Utilities

**Custom Render Function:**
```typescript
function customRender(
  ui: ReactElement,
  options?: {
    authOverrides?: Partial<AuthContextType>;
    route?: string;
  }
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MockAuthProvider overrides={options?.authOverrides}>
        <I18nProvider>
          <MemoryRouter initialEntries={[options?.route || '/']}>
            <TooltipProvider>
              {ui}
            </TooltipProvider>
          </MemoryRouter>
        </I18nProvider>
      </MockAuthProvider>
    </QueryClientProvider>
  );
}
```

## Dependencies
No new dependencies required - uses existing:
- `vitest` (already installed)
- `@testing-library/react` (already installed)  
- `@testing-library/jest-dom` (already installed)
- `jsdom` (already installed)

## Execution Order
1. Create test infrastructure (mocks + utilities)
2. Implement auth tests (foundation for other tests)
3. Implement hook tests (useFlashcards, useMockTest, useQuizPractice, useRafiqChat, useBookmarks, useProfile, useTheme)
4. Implement component tests (FlashCard)
5. Implement page tests (Auth, Home, Settings, Practice)
6. Run full test suite to verify coverage
