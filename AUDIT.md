# AUDIT.md — Alalay Codebase Health Report

**Date:** 2026-04-16 (last updated 2026-04-18)  
**Scope:** Full source audit — `app/`, `components/`, `utils/`, `data/`, `types/`, `supabase/`  
**Stack:** Expo (React Native), TypeScript, Supabase, Gemini 2.5 Flash

---

## Executive Summary

| Category | Status | Score |
|---|---|---|
| Security | 🔴 Critical issues | 3/10 |
| Functionality | 🟠 Broken flows | 4/10 |
| Architecture | 🟢 Refactored | 8/10 |
| Code Quality | 🔴 Significant debt | 5/10 |
| Test Coverage | 🔴 None | 0/10 |

---

## Recent Changes

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
- **No error boundaries** — a single component crash propagates to a white screen.

---

## Security Findings

### SEC-01 — Gemini API Key Exposed in Client Bundle
**CVSS: 8.2 (High)**

`EXPO_PUBLIC_GEMINI_API_KEY` is embedded into the JavaScript bundle at build time. Any user who decompiles the APK/IPA can extract it.

```ts
// prescription_camera.tsx:115, talk_to_alalay.tsx:85
const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
```

**Blast radius:** Billing fraud, quota exhaustion, unauthorized AI API usage.  
**Fix:** Proxy all Gemini calls through a Supabase Edge Function. The key lives server-side only; the client calls the Edge Function with a Supabase JWT.

---

### SEC-02 — Storage: Private Buckets + `getPublicUrl()` = Broken + Misleading
**CVSS: 5.3 (Medium)**

Both storage buckets are created with `public: false` in the migration, but `uploadFile()` returns `getPublicUrl()` which generates a URL only valid for public buckets.

```ts
// utils/database.ts:204
const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
return data.publicUrl; // ← returns a 400 for private buckets
```

**Result:** Images are uploaded successfully but the returned URL is non-functional. Every `image_url` stored in the `prescriptions` table points to a broken link.  
**Fix:** Replace `getPublicUrl()` with `createSignedUrl()` for reads, or set buckets to public.

---

### SEC-03 — PHI Stored Without Encryption or Data Classification
**CVSS: 6.5 (Medium)**

Prescription images, raw OCR text, and medication names are PHI (Protected Health Information). The current setup:
- Stores raw OCR text (`raw_ocr_text`) in plaintext in Postgres
- Uploads prescription images to Supabase Storage with no client-side encryption
- No data retention policy

**Fix:** At minimum, document the data classification. Long-term: encrypt `raw_ocr_text` at the application layer before insert.

---

### SEC-04 — No `with check` on RLS INSERT Policies
**CVSS: 3.1 (Low)**

All RLS policies use `for all … using (user_id = auth.uid())` without an explicit `with check`. PostgreSQL defaults `with check` to the `using` expression for INSERT/UPDATE, so this is functionally correct today, but fragile.

**Fix:** Add explicit `with check` clauses to all `for all` policies.

---

### SEC-05 — No Input Length Validation on TextInput Fields
**CVSS: 2.9 (Low)**

`TextInput` fields for medication name, dosage, instructions, and time have no `maxLength`. A user could submit multi-MB strings, causing oversized Supabase inserts.

```tsx
// MedicationCard.tsx:153, prescription_camera.tsx:395
<TextInput value={draft.name} onChangeText={...} />
```

**Fix:** Add `maxLength` props (e.g., 200 for name, 50 for dosage/time, 500 for instructions).

---

### ~~SEC-06~~ — Raw Supabase Errors Surfaced to User ✅ Fixed 2026-04-19 (T-033)

---

### SEC-07 — PII Logged to Device Console
**CVSS: 3.5 (Low)**

`login.tsx:72` logs the user's email address:

```ts
console.log("Forgot password pressed", email); // ← PII
```

`login.tsx:210` and `signup.tsx:50` also log navigation timing. On Android, device logs are accessible to other apps with `READ_LOGS` permission in debug builds.  
**Fix:** Remove all `console.log` calls containing user data. Tracked as T-040.

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

### BUG-01 — "Add to Alalay" in `talk_to_alalay.tsx` Does Not Save
**Severity: Critical**

The voice flow correctly records audio, sends it to Gemini, and parses medications — but pressing "Add to Alalay" shows an alert and navigates back without persisting anything.

```ts
// talk_to_alalay.tsx:260-263
const handleAddToAlalay = () => {
  Alert.alert("Added!", "Your medications have been added to Alalay.", [
    { text: "OK", onPress: () => router.back() },
  ]);
  // ← savePrescription() is never called
};
```

**Fix:** Call `savePrescription(medications, undefined, undefined, "manual")` before navigating back.

---

### BUG-02 — `createSchedulesForMedication` Never Called
**Severity: High**

`utils/database.ts` defines `createSchedulesForMedication()` (line 109) which is never imported or called. Medications are saved but schedules are never created — dashboard schedule view is always empty for newly added medications.

**Fix:** Call `createSchedulesForMedication()` inside `savePrescription()` for each saved medication after the medications insert succeeds.

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

### BUG-09 — Forgot Password Has No UX or Error Handling
**Severity: Medium**

`handleForgotPassword` (`login.tsx:67-73`) has no email validation, no `redirectTo` URI, no success/error UI, and logs the email to the console (PII).

```ts
async function handleForgotPassword() {
  const { supabase } = await import("@/utils/supabase");
  if (email) {
    await supabase.auth.resetPasswordForEmail(email); // no redirectTo
  }
  console.log("Forgot password pressed", email); // ← PII log
}
```

**Fix:** Validate `EMAIL_REGEX.test(email)`. Add `redirectTo: "alalay://auth/reset-password"`. Show success/error banner. Remove `console.log`. Tracked as T-034.

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

### DEBT-01 — `parseMedications` Duplicated
Identical function exists in `prescription_camera.tsx:85` and `talk_to_alalay.tsx:66`. Should be extracted to `utils/gemini.ts`.

### DEBT-02 — `any` Types in AI Response Parsing
```ts
arr.map((item: any, index: number) => ({ ... }))
```
Bypasses TypeScript safety for the most critical data transform. Should define a `GeminiMedicationItem` interface.

### DEBT-03 — Inline Style Objects in Dashboard JSX
`dashboard.tsx` lines 257–295, 307–326 define many styles inline, creating new object references every render. Should move to `StyleSheet.create()`.

### DEBT-04 — `setTimeout` Without Cleanup in Dashboard
```ts
// dashboard.tsx:167
setTimeout(() => scrollToDate(...), 100);
```
No `clearTimeout` on unmount. Tracked as T-009.

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
