
# Implementation Plan: Authentication & Security Features

This plan covers the 3 remaining authentication and security features for Rafiq Nihon.

---

## Overview

| Feature | Description | Complexity |
|---------|-------------|------------|
| Email Verification | Require email confirmation before login | Medium |
| Delete Account | Allow users to permanently delete their account and data | Medium |
| Session Management | View active sessions and logout from all devices | Medium |

---

## Feature 1: Email Verification Requirement

### Current State
- Users can sign up and immediately access the app without verifying their email
- The signup flow redirects to `/onboarding` directly

### What Will Change
- After signup, users see a "Check your email" confirmation screen
- Users cannot access protected routes until email is verified
- Add resend verification email option

### Files to Modify
1. **src/pages/Auth.tsx** - Add email verification pending state after signup
2. **src/lib/auth.tsx** - Add `isEmailVerified` check and `resendVerificationEmail` function
3. **src/components/auth/EmailVerificationBanner.tsx** (new) - Banner shown to unverified users

### User Flow
```text
Signup -> Email Sent Screen -> User clicks email link -> Redirected to app -> Onboarding
```

---

## Feature 2: Delete Account Functionality

### Current State
- Settings page has "Delete Account" button but clicking it does nothing (no action handler)
- User data in multiple tables: profiles, subscriptions, bookmarks, chat_messages, etc.

### What Will Change
- Create backend edge function `delete-account` that:
  - Verifies user identity via JWT
  - Deletes all user data from related tables
  - Uses `supabaseAdmin` to delete from `auth.users`
- Add confirmation dialog with password re-entry for security
- Show success message and redirect to landing page

### Files to Create/Modify
1. **supabase/functions/delete-account/index.ts** (new) - Edge function to handle deletion
2. **src/pages/Settings.tsx** - Connect delete button to actual deletion logic
3. **src/hooks/useDeleteAccount.ts** (new) - Hook for delete account mutation

### Security Considerations
- Require password confirmation before deletion
- Use service role key in edge function for admin operations
- Log deletion for audit purposes

---

## Feature 3: Session Management

### Current State
- Users can only logout from current device
- No visibility into other active sessions

### What Will Change
- Create "Active Sessions" section in Settings page
- Show list of sessions with device info and last active time
- Add "Logout from all devices" button
- Create edge function to invalidate all sessions

### Files to Create/Modify
1. **supabase/functions/manage-sessions/index.ts** (new) - Edge function for session operations
2. **src/pages/Settings.tsx** - Add Active Sessions section
3. **src/components/auth/ActiveSessionsCard.tsx** (new) - Component to display sessions
4. **src/hooks/useSessions.ts** (new) - Hook for session management

---

## Technical Implementation Details

### Database Changes Required
None - will use existing Supabase Auth tables and CASCADE deletes on foreign keys.

### Edge Functions to Create

| Function | Purpose | Auth Required |
|----------|---------|---------------|
| `delete-account` | Delete user account and all data | Yes (JWT) |
| `manage-sessions` | List sessions, logout all | Yes (JWT) |

### Security Best Practices Applied
- All edge functions validate JWT tokens using `getClaims()`
- Password re-confirmation for destructive actions
- Service role key used only on server-side for admin operations
- Proper CORS headers configured

---

## Implementation Order

1. **Email Verification** (standalone, no dependencies)
2. **Delete Account** (requires edge function + UI)
3. **Session Management** (requires edge function + UI)

---

## Summary

This implementation adds the final 3 security features to complete the Authentication & Security module (currently at 75% -> will become 100%):

- Stronger account security with email verification
- User autonomy with account deletion capability  
- Multi-device security with session management

Total new files: 6
Total modified files: 3
New edge functions: 2
