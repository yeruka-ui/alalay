# AUDIT.md — Alalay Codebase Health Report

**Date:** 2026-04-16 (last updated 2026-04-18)  
**Scope:** Full source audit — `app/`, `components/`, `utils/`, `data/`, `types/`, `supabase/`  
**Stack:** Expo (React Native), TypeScript, Supabase, Gemini 2.5 Flash

---

## Executive Summary

| Category | Status | Score |
|---|---|---|
| Security | 🟡 Remaining: PHI, weak pw, no magic link | 6/10 |
| Functionality | 🟡 Core flows working; minor UX gaps remain | 7/10 |
| Architecture | 🟢 Refactored + notifications | 8/10 |
| Code Quality | 🟡 Moderate debt | 6/10 |
| Test Coverage | 🔴 None | 0/10 |

---

## Recent Changes

### 2026-04-26 — Phase 0 Core Flows Complete + Local Notifications (T-001, T-002, T-021)

✅ **T-001 / BUG-01 fixed:** Voice flow (`app/(app)/talk_to_alalay.tsx`) now calls `savePrescription` with loading state, error handling, and start date picker. File also moved into `(app)` route group.  
✅ **T-002 / BUG-02 fixed:** `savePrescription` now calls `createSchedulesForMedication` for each medication (7 days from user-selected start date). UTC date bug fixed: all date strings now use `manilaDateString()` from `utils/manilaTime.ts`.  
✅ **T-021 done:** Local `expo-notifications` system fully wired — see `utils/notifications.ts`:
- Android high-importance channel (`medication-reminders`) + TAKE/SNOOZE category buttons
- Notifications scheduled on `savePrescription`, cancelled on Take/Skip via `markScheduleStatus`
- `syncAllPendingNotifications` re-syncs on login (idempotent via `notification_id` column)
- `app/_layout.tsx`: configures channel + syncs once per authenticated session; handles SNOOZE (reschedule +10min) and TAKE (navigate to dashboard) responses
- Permission requested in `(onboarding)/done.tsx`
- `supabase/migration.sql` section 12: `notification_id text` column on `medication_schedules`  
✅ **SEC-04 / T-010 fixed:** All RLS policies now have explicit `with check` clauses (migration section 11).  
✅ **SEC-05 / T-011 fixed:** All `TextInput` fields have `maxLength` (name: 200, dosage/time: 50, instructions: 500, notes: 1000).  
✅ **SEC-07 / T-040 fixed:** All `console.log` calls with PII removed from auth screens.  
✅ **BUG-09 / T-034 fixed:** Forgot-password validates email, shows success banner, adds `redirectTo`, removes PII log.  
✅ **T-008 fixed:** React error boundary (`AppErrorBoundary`) wraps root `<Slot/>`.  
✅ **DEBT-04 / T-009 fixed:** `setTimeout` in dashboard replaced with `useRef`-tracked timeout with cleanup.  
✅ **T-006 fixed:** Auth errors distinguished from empty-data in dashboard and record locker — separate error messages per case.

---

### 2026-04-23 — SEC-02 / T-003 (Storage path-in-DB, sign-on-read)

✅ **SEC-02 / T-003 fixed:** `uploadFile()` no longer calls `getPublicUrl()` or stores signed URLs in the DB.  
✅ **Schema:** `prescriptions.image_url → image_path`, `medical_records.file_url → file_path` (migration section 10).  
✅ **Helper added:** `getSignedUrlFor(bucket, path, expiresIn=300)` in `utils/database.ts` for short-lived read URLs.  
✅ **Data cleanup:** Existing `http%` values nulled via migration UPDATE — no broken URLs in DB.  
✅ **Types updated:** `types/database.ts` fields renamed to match new column names.

---

### 2026-04-22 — ES256 JWT Auth Fix (Edge Function Gateway Compatibility)

✅ **Issue:** Edge Functions gateway rejected ES256-signed tokens with 401 `UNAUTHORIZED_UNSUPPORTED_TOKEN_ALGORITHM`.  
✅ **Root cause:** Project JWT signing key rotated to ES256 (asymmetric). Gateway verifier expected HS256.  
✅ **Fix:** Created `supabase/config.toml` disabling gateway JWT verify for both AI functions. Added server-side auth in `analyze-prescription/index.ts` and `analyze-audio/index.ts` via `supabase.auth.getUser()` (GoTrue v2.188.1 supports ES256 natively).  
✅ **Deployment:** Both functions redeployed to project `yrhqatpczliqdfytpvoy`.  
✅ **Result:** Client `supabase.functions.invoke()` calls now succeed; requests pass gateway → function auth check → Gemini call.

---

### 2026-04-21 — SEC-01 / T-004 / DEBT-01 / T-007 (Gemini Proxy + parseMedications extraction)

✅ **SEC-01 / T-004 fixed:** Gemini API key removed from client bundle. Both call sites now proxy through Supabase Edge Functions (`analyze-prescription`, `analyze-audio`). Key lives in Supabase secrets only.  
✅ **DEBT-01 / T-007 fixed:** `parseMedications` deduplicated — single implementation in `supabase/functions/_shared/gemini.ts`. Both `prescription_camera.tsx` and `talk_to_alalay.tsx` local copies deleted. `item: any` eliminated.  
✅ **T-030 confirmed fixed:** `.env.example` corrected — `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and comment pointing to `supabase secrets set` for Gemini key.  
✅ **Error contract standardized:** Edge Functions return `{ error: { code, message } }` with typed `AiErrorCode`; `utils/ai.ts` maps codes to user-facing strings via `mapAiError`.  
✅ **Models unified:** Both flows now use `gemini-3.1-flash-lite-preview` (was `gemini-2.5-flash` for audio).

---

### 2026-04-19 — Auth Hardening (Phase 0.2 complete)

✅ **T-030 / BUG-13 fixed:** `.env.example` updated to correct `EXPO_PUBLIC_*` variable names  
✅ **T-031 / BUG-12 fixed:** Root guard gates `<Slot/>` on `ready`; `segments[0]` in deps array  
✅ **T-033 / SEC-06 fixed:** `mapAuthError()` helper maps Supabase codes to safe user-facing strings  
✅ **T-036 / BUG-11 fixed:** Signup checkbox renders visual indicator (`checkbox`/`checkboxInner` styles applied)  
✅ **T-037 / BUG-10 fixed:** `BackgroundCircle` blur replaced with `expo-blur` `BlurView` or prop removed  
✅ **T-040 / DEBT-13 fixed:** Dead vars, commented code, and PII `console.log` removed from auth screens  
✅ **T-041 / DEBT-11 fixed:** Signup input style unified with shared `loginStyles.input`  
✅ **T-042 / DEBT-15 fixed:** Onboard title shadow corrected; `elevation` removed from `Text` style

---

### 2026-04-18 — Auth Hardening (Phase 0.2 partial)

✅ **BUG-06 fixed:** Signup navigates to login with "check your email" success banner; guard handles auto-signin  
✅ **BUG-07 fixed:** `canSubmit` enforces role selection before submission  
✅ **BUG-08 fixed:** Login spinner clears on successful sign-in  
✅ **Signup error UX:** Field-level inline errors replace generic banner — inputs highlight red with contextual messages  
✅ **Database:** `profiles` updated with `full_name` + `role`; `handle_new_user()` trigger reads from `user_metadata`  
✅ **Phase 0.2 complete:** BUG-12 (T-031) and BUG-13 (T-030) resolved 2026-04-19  

---

### 2026-04-18 — Auth UI Scaffolded

✅ **Auth screens added:** `app/(auth)/login.tsx`, `app/(auth)/signup.tsx`, `app/(auth)/onboard.tsx`  
✅ **Shared component added:** `components/BackgroundCircle.tsx` (gradient decoration for auth screens)  
⚠️ **New bugs discovered:** BUG-06 through BUG-13 (signup success path broken, root guard FOUC, `.env.example` drift) — see sections below  
⚠️ **New security issues:** SEC-06 through SEC-09 (raw Supabase errors surfaced, PII in device logs, no magic-link handler)  
📋 **Backlog updated:** DEBT-08 through DEBT-17 added; T-029 through T-047 created in TASKS.md

**Impact:** Auth UI is scaffolded but not shippable. T-005 status changed to `[x]` for "UI scaffolded"; hardening tracked as T-029+. Functionality score unchanged at 4 — BUG-06 (signup success path) and BUG-12 (guard FOUC) mean auth still doesn't fully work. Code Quality dropped from 6 to 5 due to new debt items.

---

### 2026-04-18 — Auth Architecture Refactored

✅ **Auth Architecture Refactored**
- Replaced one-shot `getSession()` redirect in `app/index.tsx` with live auth guard in root `_layout.tsx`
- Implemented route groups: `(auth)` for public screens, `(app)` for protected screens
- Root layout uses `<Slot/>` + `supabase.auth.onAuthStateChange` + `useSegments` to guard access
- Sessions now persist across app state changes (sign-in, sign-out, token refresh)
- Prevents unauthenticated users from accessing deep links to protected screens
- All existing route hrefs stable; group names URL-invisible

**Impact:** Architecture score improved from 6 to 8. Login/signup UI was absent at time of this entry — scaffolded in the "Auth UI Scaffolded" entry above. See T-029+ in TASKS.md for remaining hardening.

---

## Critical Process Gaps

- **Zero test files** — no unit, integration, or E2E tests exist. No test runner configured.
- **No CI/CD pipeline** — no GitHub Actions or Expo EAS build configuration.
- ~~**No error boundaries**~~ — ✅ Fixed (T-008): `AppErrorBoundary` wraps root slot.

---

## Security Findings

### ~~SEC-01~~ — Gemini API Key Exposed in Client Bundle ✅ Fixed 2026-04-21 (T-004)

Key moved to `supabase secrets`. Client uses `supabase.functions.invoke` with JWT. Edge Functions `analyze-prescription` + `analyze-audio` proxy Gemini internally.

---

### ~~SEC-02~~ — Storage: Private Buckets + `getPublicUrl()` = Broken + Misleading ✅ Fixed 2026-04-23 (T-003)

`uploadFile()` now returns the storage object path. Columns renamed: `prescriptions.image_url → image_path`, `medical_records.file_url → file_path`. `getSignedUrlFor(bucket, path)` added for 5-min signed URLs at read time. Existing broken URLs nulled via migration section 10.

---

### SEC-03 — PHI Stored Without Encryption or Data Classification
**CVSS: 6.5 (Medium)**

Prescription images, raw OCR text, and medication names are PHI (Protected Health Information). The current setup:
- Stores raw OCR text (`raw_ocr_text`) in plaintext in Postgres
- Uploads prescription images to Supabase Storage with no client-side encryption
- No data retention policy

**Fix:** At minimum, document the data classification. Long-term: encrypt `raw_ocr_text` at the application layer before insert.

---

### ~~SEC-04~~ — No `with check` on RLS INSERT Policies ✅ Fixed 2026-04-26 (T-010)

All five table RLS policies now have explicit `with check (user_id = auth.uid())` or `auth_id` equivalent. Migration section 11.

---

### ~~SEC-05~~ — No Input Length Validation on TextInput Fields ✅ Fixed 2026-04-26 (T-011)

`maxLength` added to all `TextInput` fields: name 200, dosage/time 50, instructions 500, notes 1000.

---

### ~~SEC-06~~ — Raw Supabase Errors Surfaced to User ✅ Fixed 2026-04-19 (T-033)

---

### ~~SEC-07~~ — PII Logged to Device Console ✅ Fixed 2026-04-26 (T-040)

All `console.log` calls with PII (`email`, navigation timing) removed from `login.tsx` and `signup.tsx`.

---

### SEC-08 — Weak Password Policy
**CVSS: 2.5 (Low)**

`signup.tsx:44` enforces only `password.length >= 8`. No check for `email === password` or common patterns.  
**Fix:** Add `password !== email` check client-side. Configure server-side policy in Supabase Auth settings. Tracked as T-047.

---

### SEC-09 — Magic Link / OTP and Deep-Link Handler Absent
**CVSS: 5.0 (Medium)**

`app.json:8` registers the `alalay` URL scheme but no `expo-linking` handler processes `alalay://` callbacks. `utils/auth.ts` has no `signInWithOtp` / `verifyOtp`. PLANS Phase 1.1 specifies magic link as a deliverable — infrastructure is incomplete and the scheme is a dead end.

**Blast radius:** If a user receives a magic link, clicking it opens the app but the auth token is silently dropped.  
**Fix:** Implement `signInWithOtp` + a deep-link listener that calls `supabase.auth.exchangeCodeForSession()`. Tracked as T-046.

---

## Functional Bugs

### ~~BUG-01~~ — "Add to Alalay" in `talk_to_alalay.tsx` Does Not Save ✅ Fixed 2026-04-26 (T-001)

`app/(app)/talk_to_alalay.tsx` now calls `savePrescription(medications, undefined, undefined, "manual", startDate)` with loading state, error handling, and a start date picker.

---

### ~~BUG-02~~ — `createSchedulesForMedication` Never Called ✅ Fixed 2026-04-26 (T-002)

`savePrescription` now calls `createSchedulesForMedication` for each saved medication (7 days from start date) and schedules a local notification per future row.

---

### BUG-03 — `appointments` Tab Is Entirely Non-Functional
**Severity: Medium**

Dashboard has an "appointments" tab with `id: "appointments"` but no filter logic and no schema table.

**Fix:** Remove the tab or create the `appointments` table and filter logic.

---

### BUG-04 — Record Locker Search Bar Is Decorative
**Severity: Medium**

`record_locker.tsx:164` renders a search `TextInput` with no `onChangeText` that filters `records`. It is purely visual.

---

### BUG-05 — `SafeAreaProvider` Double-Wrapped in `alalay_chat.tsx`
**Severity: Low**

`_layout.tsx` wraps the root in `SafeAreaProvider`. `alalay_chat.tsx` creates a second nested `SafeAreaProvider`, causing safe area inset conflicts on iOS.

---

### ~~BUG-09~~ — Forgot Password Had No UX or Error Handling ✅ Fixed 2026-04-26 (T-034)

Email validated, `redirectTo: "alalay://auth/reset-password"` added, success banner shown, PII log removed.

---

### ~~BUG-10~~ — `BackgroundCircle` Blur No-Op on Native ✅ Fixed 2026-04-19 (T-037)

---

### ~~BUG-11~~ — Signup Checkbox No Visual Indicator ✅ Fixed 2026-04-19 (T-036)

---

### ~~BUG-12~~ — Root Guard FOUC ✅ Fixed 2026-04-19 (T-031)

---

### ~~BUG-13~~ — `.env.example` Wrong Variable Names ✅ Fixed 2026-04-19 (T-030)

---

## Technical Debt

### ~~DEBT-01~~ — `parseMedications` Duplicated ✅ Fixed 2026-04-21 (T-007)

Single implementation in `supabase/functions/_shared/gemini.ts`. Both client copies deleted.

### ~~DEBT-02~~ — `any` Types in AI Response Parsing ✅ Fixed 2026-04-21 (T-007)

`parseMedications` in `supabase/functions/_shared/gemini.ts` uses `Record<string, unknown>` with explicit field guards. No `any`.

### DEBT-03 — Inline Style Objects in Dashboard JSX
`dashboard.tsx` lines 257–295, 307–326 define many styles inline, creating new object references every render. Should move to `StyleSheet.create()`.

### ~~DEBT-04~~ — `setTimeout` Without Cleanup in Dashboard ✅ Fixed 2026-04-26 (T-009)

Timeout stored in `useRef`; cleared in `useEffect` cleanup.

### DEBT-05 — `getActiveMedications` Fetched on Every Date Change
Date-independent data fetched inside `fetchDashboardData` which runs on every `selectedDate` change. Should be fetched once on mount.

### DEBT-06 — `ScrollView` Instead of `FlatList` for Lists
Dashboard schedule and record locker lists render all items simultaneously. Use `FlatList` with `keyExtractor`.

### DEBT-07 — Image Quality 1.0 in Record Locker
```ts
// record_locker.tsx:83, 101
quality: 1
```
Uploads full-resolution images. Should use `0.7–0.8`.

### DEBT-08 — `utils/auth.ts` Drops `data` from `signInWithEmail`
`signInWithEmail` discards the `data` return value (`signUpWithEmail` fixed 2026-04-18). No `signOut` or session-refresh helpers exist.

**Fix:** Return `{ data, error }` from `signInWithEmail`. Add `signOut()` and `refreshSession()` helpers. Tracked as T-038.

### DEBT-09 — `KeyboardAvoidingView` Behavior Not Platform-Branched
`login.tsx:84` and `signup.tsx:76` use `behavior="padding"` unconditionally. Correct value on Android is `"height"`.

```tsx
behavior={Platform.OS === "ios" ? "padding" : "height"}
```

Tracked as T-039.

### DEBT-10 — Focus Styles Visually Identical to Default
`styles/login.styles.ts:37-39, 48-50` define `inputFocused` / `passwordRowFocused` with `backgroundColor: "#ffffff"` — same as default. Focus state has zero visual effect.

**Fix:** Add a distinct border on focus (e.g., `borderColor: "#DD00FF"`, `borderWidth: 1.5`).

### ~~DEBT-11~~ — Signup Input Style Duplicates `loginStyles.input` ✅ Fixed 2026-04-19 (T-041)

### DEBT-12 — Google / Apple Sign-In Buttons Are Stubs
`login.tsx:189-205` renders fully styled buttons that call `console.log(...)` on press. `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is defined in `.env` but unused.

**Fix:** Implement or remove. Tracked as T-045.

### ~~DEBT-13~~ — Dead Code in `login.tsx` ✅ Fixed 2026-04-19 (T-040)

### DEBT-14 — Stack Animation Mismatch Between Route Groups
`app/(auth)/_layout.tsx:4` uses `animation: "fade"`. `app/(app)/_layout.tsx` has none (platform default slide). Transitions between groups are inconsistent.

**Fix:** Align both layouts on a single animation strategy. Tracked as T-044.

### ~~DEBT-15~~ — Onboard Title Readability + `elevation` No-Op ✅ Fixed 2026-04-19 (T-042)

### DEBT-16 — `BackgroundCircle` Accessibility and Deprecated `pointerEvents`
`components/BackgroundCircle.tsx:47` sets `pointerEvents: "none"` inside the style object — deprecated in newer React Native (should be a JSX prop). No `accessibilityElementsHidden` / `importantForAccessibility="no"` on a decorative element.

**Fix:** Move `pointerEvents` to JSX prop. Add accessibility hiding attributes.

### DEBT-17 — Staged Empty `(auth)/index.tsx` in Working Tree
`app/(auth)/index.tsx` has git status `AD` — staged as new empty file, then deleted in working tree. The `(auth)` group has no default child route.

**Fix:** Commit the deletion (guard handles default routing) or add a meaningful redirect. Tracked as T-043.
