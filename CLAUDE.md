# Rafiq Nihon

Japanese language learning PWA built with React, TypeScript, and Supabase.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Backend:** Supabase (Auth, Database, Edge Functions, Storage)
- **Styling:** Tailwind CSS, shadcn/ui
- **State/Data:** React Query (TanStack Query), React Context
- **Forms:** Zod + React Hook Form
- **Animations:** Framer Motion
- **Testing:** Vitest + React Testing Library

## Commands

```bash
npm run dev        # Dev server on port 8080
npm run build      # Production build
npm run lint       # ESLint
npm run test       # Vitest (run once)
npm run test:watch # Vitest (watch mode)
```

## Project Structure

```
src/
├── pages/              # 37 page components (route targets)
├── components/         # 180+ components in feature folders
│   ├── ui/             # shadcn/ui primitives
│   ├── flashcard/      # Flashcard system
│   ├── quiz/           # Quiz components
│   ├── learn/          # Learning modules
│   └── ...             # Other feature folders
├── hooks/              # 50 custom hooks
├── lib/
│   ├── auth.tsx        # AuthProvider & useAuth hook
│   ├── i18n/           # I18n system (id, en, ja)
│   └── utils.ts        # cn() and shared utilities
├── integrations/supabase/
│   ├── client.ts       # Supabase client instance
│   └── types.ts        # Auto-generated DB types (do not edit)
├── test/
│   ├── utils/test-utils.tsx  # renderWithAuth, test providers
│   └── mocks/          # Auth & Supabase mocks
supabase/
├── functions/          # 6 edge functions
│   ├── rafiq-chat/     # AI chat
│   ├── speech-analysis/
│   ├── kanji-ocr/
│   ├── delete-account/
│   ├── manage-sessions/
│   └── google-tts/
└── migrations/         # 20 SQL migrations
```

## Code Conventions

- **Component files:** PascalCase (`FlashcardDeck.tsx`)
- **Hooks/utils:** camelCase (`useFlashcards.ts`)
- **Path alias:** `@/` maps to `src/`
- **shadcn/ui:** Components live in `src/components/ui/`, import from `@/components/ui/*`
- **Class merging:** Use `cn()` from `@/lib/utils`
- **Data fetching:** React Query (`useQuery`, `useMutation`)
- **Auth/i18n:** React Context (`useAuth`, `useLanguage`)

## Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | All routes & provider wrappers |
| `src/lib/auth.tsx` | AuthProvider, useAuth, session management |
| `src/lib/i18n/` | Translation system (Indonesian, English, Japanese) |
| `src/integrations/supabase/client.ts` | Supabase client singleton |
| `src/integrations/supabase/types.ts` | Auto-generated DB types |

## Testing

- **Framework:** Vitest with jsdom environment
- **Test utils:** `src/test/utils/test-utils.tsx` provides `renderWithAuth` and pre-configured providers
- **Mocks:** `src/test/mocks/` contains auth and Supabase mocks

## Environment Variables

```
VITE_SUPABASE_URL              # Supabase project URL
VITE_SUPABASE_PUBLISHABLE_KEY  # Supabase anon/public key
VITE_SUPABASE_PROJECT_ID       # Supabase project ID
```

## TypeScript Config

- `strictNullChecks: false`
- `noImplicitAny: false`
