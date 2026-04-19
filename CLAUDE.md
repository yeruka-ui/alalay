# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Alalay is a prescription management mobile app built with Expo (React Native) and TypeScript. It lets users photograph prescriptions, extract medications via Gemini OCR, and manage medication schedules. Targets Filipino users — medication database includes Philippine brand names.

## Commands

- `npx expo start` — Start dev server (scan QR with Expo Go, or press `a`/`i` for emulators)
- `npm run lint` — Run ESLint
- `npm install` — Install dependencies (use `npx expo install <pkg>` for Expo-compatible versions)

## Architecture

**File-based routing** via expo-router with **route groups** partitioning public vs. protected screens:

```
app/
  _layout.tsx              # Root: <Slot/> + auth guard (onAuthStateChange + useSegments)
  index.tsx                # Blank placeholder; guard decides destination
  (auth)/
    _layout.tsx            # Stack with no header (animation: fade)
    onboard.tsx            # Landing page — Sign in / Create Account CTAs
    login.tsx              # Email/password login (magic link NOT yet implemented — see T-046)
    signup.tsx             # Account creation (name, email, password, role)
  (app)/
    _layout.tsx            # Stack with no header
    dashboard.tsx          # Main screen with calendar + medication schedule
    prescription_camera.tsx # Camera/gallery → Gemini OCR → editable medication cards
    record_locker.tsx      # Saved medications browser
    alalay_chat.tsx        # Chat interface (placeholder)
    talk_to_alalay.tsx     # Voice interaction screen
```

**Auth Guard (root `_layout.tsx`):**
- Observes `supabase.auth.onAuthStateChange` for live session tracking
- Uses `useSegments()` to identify current route group (`"(auth)"` or `"(app)"`)
- Redirects based on session state: unauthenticated users → `/onboard`, authenticated → `/dashboard`
- `getSession()` resolves on cold start before first redirect decision
- Route groups are URL-invisible; all hrefs (`/login`, `/dashboard`, `/record_locker`, …) remain stable
- **Known issue (BUG-12 / T-031):** `<Slot/>` renders unconditionally — not gated on `ready`. Authenticated users see a brief flash of the onboard screen on cold start until T-031 is fixed. `segments` in the guard deps array is also a new array reference each render.

**Key data flow for prescription OCR:**
`Image capture → base64 upload to Gemini API → JSON parse (parseMedications) → fuzzy validation (medicationValidator) → MedicationCard list with edit/suggestion/confidence UI`

**Styles:** `styles/index.styles.ts` holds shared styles (imported as `sharedStyles`). Each screen with significant styling has its own file: `styles/prescription_camera.styles.ts`, `styles/alalay_chat.styles.ts`, `styles/talk_to_alalay.styles.ts`, `styles/login.styles.ts`, `styles/onboard.styles.ts`.

**State management:** Local `useState` only (no global store).

**Backend:** Supabase client configured in `utils/supabase.ts` with AsyncStorage session persistence. Credentials via `.env` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_GEMINI_API_KEY`).

> ⚠️ `.env.example` currently uses `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (wrong names). Must be `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`. See BUG-13 / T-030.

**Database schema** defined in `supabase/migration.sql`. Tables: `profiles`, `prescriptions`, `medications`, `medication_schedules`, `medical_records`. All tables have RLS policies scoped to `auth.uid()`. Storage buckets: `prescriptions`, `medical-records`.

**Key data flow for saving prescriptions:**
`MedicationCard list → "Add to Alalay" → uploadFile() to Supabase Storage → savePrescription() inserts prescription + medications rows`

**Dashboard data flow:**
`selectedDate change → getSchedulesForDate() + getActiveMedications() → filtered by active tab → schedule cards with "Take" button → updateScheduleStatus()`

## Key Files

| Path | Purpose |
|---|---|
| `app/_layout.tsx` | Root layout: `<Slot/>` + session state + auth guard via `onAuthStateChange` + `useSegments` |
| `app/(auth)/_layout.tsx` | Auth route group: Stack layout for public screens |
| `app/(auth)/onboard.tsx` | Landing page — entry point for unauthenticated users, CTAs to login/signup |
| `app/(auth)/login.tsx` | Email/password login screen with remember-me and forgot-password |
| `app/(auth)/signup.tsx` | Account creation with name, email, password, role picker, terms checkbox |
| `app/(app)/_layout.tsx` | App route group: Stack layout for protected screens (dashboard, etc.) |
| `components/MedicationCard.tsx` | Card with edit modal, suggestion banner, confidence indicators |
| `components/BackgroundCircle.tsx` | Decorative gradient circle used on auth screens. `blur` prop is a no-op on native (BUG-10 / T-037) |
| `components/floatingActionMenu.tsx` | Animated FAB with camera/document/mic actions |
| `components/tabFilterBar.tsx` | Reusable tab/filter bar used on dashboard and record locker |
| `utils/medicationValidator.ts` | fuse.js fuzzy match against known drug names |
| `data/medicationDatabase.ts` | ~225 Philippine generic + brand medication names |
| `utils/database.ts` | CRUD helpers for Supabase (savePrescription, getSchedulesForDate, etc.) |
| `utils/supabase.ts` | Supabase client with AsyncStorage session persistence |
| `utils/auth.ts` | Auth helpers (signInWithEmail, signUpWithEmail, saveRememberedIdentifier, getRememberedIdentifier). Note: drops `data` from responses — see DEBT-08 / T-038 |
| `styles/login.styles.ts` | Shared styles for login and signup screens |
| `styles/onboard.styles.ts` | Styles for the onboard landing screen |
| `types/database.ts` | TypeScript types matching Supabase schema |
| `supabase/migration.sql` | Full database schema (tables, indexes, RLS, storage buckets) |
| `TASKS.md` | Current feature backlog and bug tracker |
| `AUDIT.md` | Full codebase health report with SEC/BUG/DEBT findings |
| `PLANS.md` | Strategic roadmap and phase planning |

## Conventions

- **Color theme:** Purple primary (`#B902D6`, `#850099`), light purple accents (`#FEE8FE`, `#E6ADEF`)
- **New Architecture** and **React Compiler** are enabled (see `app.json` plugins)
- **Typed routes** enabled — expo-router generates route types
- Path alias: `@/*` maps to project root (tsconfig)
- **`BackgroundCircle` blur prop:** Currently a no-op on native iOS/Android (CSS `filter:blur()` is web-only). Pass `blur` for future compatibility once T-037 lands; it renders nothing on device today.
