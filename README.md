# Alalay

Prescription management app for Filipino users. Photograph a prescription or describe it by voice — Gemini extracts medications, schedules doses, and sends reminders.

## Stack

- **Expo 54** (React Native 0.81, React 19) — New Architecture + React Compiler enabled
- **TypeScript** — typed routes via expo-router
- **expo-router** — file-based routing with auth guard
- **Supabase** — auth, Postgres (RLS), Storage, Edge Functions
- **Gemini** — OCR + voice analysis, server-side only via Edge Functions
- **expo-notifications** — local medication reminders
- **fuse.js** — fuzzy drug name validation against Philippine medication database

## Setup

**Prerequisites:** Node 18+, Expo Go (device) or Android/iOS emulator.

```bash
npm install
```

Create `.env.local` at project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

Gemini API key is server-side only — never in `.env`:

```bash
npx supabase secrets set GEMINI_API_KEY=your-key
```

## Commands

```bash
npx expo start        # Dev server (scan QR with Expo Go, or press a/i)
npm run android       # Android emulator
npm run ios           # iOS simulator
npm run web           # Web (static output)
npm run lint          # ESLint
npm run test:unit     # Unit tests (tsx)
```

## Architecture

**Route groups** partition the app:

| Group | Screens |
|---|---|
| `(auth)` | `onboard`, `login`, `signup` |
| `(onboarding)` | `step1–3`, `done` |
| `(app)` | `dashboard`, `prescription_camera`, `record_locker`, `alalay_chat`, `talk_to_alalay` |

**Auth guard** in `app/_layout.tsx` — watches `onAuthStateChange`, redirects based on session + onboarding status.

**Key flows:**
- Prescription OCR: image → base64 → Edge Function → Gemini → `MedicationItem[]` → save → 7-day schedule → notifications
- Voice: audio → base64 → Edge Function → Gemini → same save path
- Dashboard: date select → `getSchedulesForDate()` → "Take" → `markScheduleStatus()` → cancel notification

**Database:** `profiles`, `prescriptions`, `medications`, `medication_schedules`, `medical_records` — all RLS-scoped to `auth.uid()`.

## Project Layout

```
app/                  # Screens (file-based routing)
components/           # Shared UI components
utils/                # Supabase client, AI proxy, DB helpers, notifications, auth
supabase/
  functions/          # Edge Functions (analyze-prescription, analyze-audio)
  migration.sql       # Full schema + RLS
styles/               # Per-screen stylesheet files
data/                 # medicationDatabase.ts (~225 PH drug names)
types/                # TypeScript types matching Supabase schema
```

## Docs

- [`CLAUDE.md`](CLAUDE.md) — full architecture reference for AI-assisted development
- [`TASKS.md`](TASKS.md) — feature backlog + bug tracker
- [`AUDIT.md`](AUDIT.md) — codebase health report (SEC/BUG/DEBT findings)
- [`PLANS.md`](PLANS.md) — strategic roadmap
