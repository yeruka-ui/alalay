# TASKS.md — Alalay Backlog

**Priority:** P0 = Blocker · P1 = High · P2 = Medium · P3 = Nice-to-have  
**Status:** `[ ]` open · `[x]` done · `[~]` in progress

---

## P0 — Blockers (Ship Nothing Until These Are Done)

### [x] ES256 JWT Auth Fix (2026-04-22)
**Files:** `supabase/config.toml` (new), `supabase/functions/analyze-prescription/index.ts`, `supabase/functions/analyze-audio/index.ts`
**Fixed:** Edge Functions gateway 401 rejection on ES256 tokens. Added server-side auth in both AI functions via `supabase.auth.getUser()`. Functions redeployed.

---

### [x] [T-001] Fix: Voice flow doesn't save medications
**Fixed 2026-04-26**
`app/(app)/talk_to_alalay.tsx` — `handleAddToAlalay` now calls `savePrescription(medications, undefined, undefined, "manual", startDate)` with proper error handling and loading state. Also added start date picker (matches prescription_camera UX).

---

### [x] [T-002] Fix: Schedules never created after prescription save
**Fixed 2026-04-26**
`utils/database.ts` — `savePrescription` now calls `createSchedulesForMedication` for each saved medication (7 days from `startDate`). Also schedules a local `expo-notifications` reminder per row via `scheduleNotificationFor`. UTC date bug fixed: all date strings now use `manilaDateString()` from `utils/manilaTime.ts`.

---

### [x] [T-003] Fix: Storage returns broken URLs for private buckets
**Fixed 2026-04-23**  
- `uploadFile()` now returns the storage path (e.g. `{uid}/{ts}-{name}`) instead of a signed URL.  
- `prescriptions.image_url` → `image_path`; `medical_records.file_url` → `file_path` (migration section 10).  
- `getSignedUrlFor(bucket, path, expiresIn=300)` added to `utils/database.ts` for on-demand 5-min signed URLs at read time.  
- Existing broken `http%` values nulled via migration UPDATE.  
- Types in `types/database.ts` updated to match renamed columns.

---

### [x] [T-004] Fix: Gemini API key exposed in client bundle
**Fixed 2026-04-21**  
- `supabase/functions/analyze-prescription/index.ts` — image flow  
- `supabase/functions/analyze-audio/index.ts` — voice flow  
- `supabase/functions/_shared/gemini.ts` — shared callGemini + parseMedications  
- `utils/ai.ts` — client wrapper using `supabase.functions.invoke`  
- `EXPO_PUBLIC_GEMINI_API_KEY` removed from `.env.example` and all client code  
- **Deploy:** `npx supabase secrets set GEMINI_API_KEY=... && npx supabase functions deploy analyze-prescription && npx supabase functions deploy analyze-audio`

---

### [x] [T-030] Fix: `.env.example` uses wrong Supabase variable names
**File:** `.env.example:5-6`  
**Description:** `.env.example` documents `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, but `utils/supabase.ts` reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Fresh clone crashes.  
**Success criteria:** `.env.example` updated to `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. All other vars verified correct against their consumers.

---

### [x] [T-031] Fix: Root guard FOUC + `segments` dep array
**File:** `app/_layout.tsx:24-31`  
**Description:** `<Slot />` renders unconditionally — not gated on `ready`. Authenticated users see a flash of the onboard/login screen before the guard redirects them. `segments` in the deps array is a new reference every render, causing unnecessary effect runs.  
**Success criteria:**  
- Gate `<Slot />` with a splash/loading placeholder until `ready === true`  
- Replace `segments` in deps with `segments[0]` or `segments.join("/")`  
- Authenticated users on cold start see no login flash before dashboard

---

## P1 — High Priority

### [x] [T-006] Fix: Silent authentication failures across all screens
**Files:** `app/(app)/dashboard.tsx:52`, `app/(app)/record_locker.tsx:48`  
**Description:** `catch {}` swallows "Not authenticated" errors and displays empty state as if no data exists.  
**Success criteria:** Distinguish auth errors (show "Session expired, please re-log in") from data-empty (show "No items") from other errors.

---

### [x] [T-007] Refactor: Extract and deduplicate `parseMedications`
**Fixed 2026-04-21** — consolidated in `supabase/functions/_shared/gemini.ts` (runs server-side). Client copies in both screens deleted. `Record<string, unknown>` replaces `any`. Bundled with T-004.

---

### [x] [T-008] Fix: Add React error boundaries
**Files:** `app/_layout.tsx` or individual screen wrappers  
**Description:** A crash in any screen propagates to a white screen with no recovery.  
**Success criteria:** Wrap each screen (or the Stack) in an error boundary that shows a friendly error message with a "Try again" button.

---

### [x] [T-009] Fix: `setTimeout` without cleanup in dashboard
**File:** `app/dashboard.tsx:167`  
**Description:** `setTimeout` fires after `selectedDate` changes with no cleanup on fast changes or unmount.  
**Success criteria:** Store timeout ID in `useRef`; clear it in the `useEffect` return cleanup function.

---

### [x] [T-010] Add: `with check` clauses to all RLS policies
**File:** `supabase/migration.sql` — requires a new migration  
**Success criteria:** New migration adds `with check (user_id = auth.uid())` to all five table policies.

---

### [x] [T-011] Add: `maxLength` to all TextInput fields
**Files:** `components/MedicationCard.tsx:153–180`, `app/prescription_camera.tsx:393–420`  
**Success criteria:** Name ≤ 200, dosage/time ≤ 50, instructions ≤ 500, notes ≤ 1000.

---

### [x] [T-033] Fix: Map Supabase errors to safe user-facing strings
**Files:** `app/(auth)/signup.tsx:63-64`, `app/(auth)/login.tsx:58-59`  
**Description:** `signup.tsx` renders raw `signupError.message` (e.g., "User already registered") — email enumeration. `login.tsx` already uses a generic message but the pattern is inconsistent.  
**Success criteria:**  
- Add a `mapAuthError(error: AuthError): string` helper in `utils/auth.ts`  
- Maps known Supabase error codes to generic strings; unknown codes return "An error occurred, please try again"  
- Both login and signup use this helper — no raw `.message` rendered

---

### [x] [T-034] Fix: Forgot-password has no UX, logs PII
**File:** `app/(auth)/login.tsx:67-73`  
**Description:** No email validation, no `redirectTo`, no success/error UI, logs the email to console.  
**Success criteria:**  
- Validate `EMAIL_REGEX.test(email)` before calling; show inline error if invalid  
- Add `redirectTo: "alalay://auth/reset-password"` to the `resetPasswordForEmail` call  
- Show success banner ("Password reset email sent") using existing `errorBanner` style  
- Remove `console.log("Forgot password pressed", email)`

---

### [x] [T-036] Fix: Signup checkbox has no visual indicator
**File:** `app/(auth)/signup.tsx:186-195`, `styles:247-265`  
**Description:** `checkbox` / `checkboxInner` styles exist but are never rendered. User sees no visual toggle for the terms agreement.  
**Success criteria:** Render `<View style={signupStyles.checkbox}>{agreed && <View style={signupStyles.checkboxInner} />}</View>` inside the `Pressable`. Toggling shows/hides the inner circle.

---

### [x] [T-037] Fix: `BackgroundCircle` blur is a no-op on native
**File:** `components/BackgroundCircle.tsx:59`  
**Description:** `filter: blur()` is web-only CSS — silently dropped on iOS/Android. The `blur` prop does nothing on device.  
**Success criteria:**  
- Replace implementation with `expo-blur`'s `BlurView` wrapping the `LinearGradient`, OR  
- Remove the `blur` prop entirely and document that soft edges come from the gradient itself  
- No call sites should need to change (preserve prop signature or provide a no-op default)

---

## P2 — Medium Priority

### [T-012] Fix: Remove nested `SafeAreaProvider` in `alalay_chat.tsx`
**File:** `app/alalay_chat.tsx:35`  
**Success criteria:** `SafeAreaProvider` import removed; `SafeAreaView` used directly.

---

### [T-013] Perf: Move dashboard inline styles to `StyleSheet.create`
**File:** `app/dashboard.tsx:257–326`  
**Success criteria:** All inline style objects in JSX moved to a `StyleSheet.create` block.

---

### [T-014] Perf: Don't refetch `getActiveMedications` on every date change
**File:** `app/dashboard.tsx:43–57`  
**Success criteria:** Fetch active medications once on mount in a separate `useEffect`. `fetchDashboardData` only calls `getSchedulesForDate`.

---

### [T-015] Perf: Replace `ScrollView` with `FlatList` in schedule and record lists
**Files:** `app/dashboard.tsx:252`, `app/record_locker.tsx:175`  
**Success criteria:** Both lists use `FlatList` with `keyExtractor` and `removeClippedSubviews`.

---

### [T-016] Fix: Record locker image quality
**File:** `app/record_locker.tsx:83,101`  
**Success criteria:** Change `quality: 1` to `quality: 0.75` for both camera and gallery.

---

### [T-017] Fix: Implement working search in record locker
**File:** `app/record_locker.tsx:164`  
**Success criteria:** `onChangeText` updates a `searchQuery` state. Records filtered by `title.toLowerCase().includes(searchQuery)` with 300ms debounce.

---

### [T-018] Fix: Remove or implement `appointments` tab
**File:** `app/dashboard.tsx:34`, `supabase/migration.sql`  
**Success criteria (remove option):** Delete the `appointments` entry from `tabs` array.  
**Success criteria (implement option):** Add `appointments` table, filter logic, basic add-appointment UI.

---

### [T-019] Add: Supabase cron to auto-mark missed medications
**File:** New `supabase/functions/mark-missed/index.ts` or pg_cron SQL  
**Success criteria:** Scheduled job runs hourly and updates all `pending` schedules where `(scheduled_date + scheduled_time)` is in the past.

---

### [T-038] Refactor: `utils/auth.ts` — return `data`, add helpers
**File:** `utils/auth.ts:6-25`  
**Description:** Both sign-in and sign-up functions discard the `data` return value. No `signOut` or session-refresh helpers.  
**Success criteria:**  
- `signInWithEmail` and `signUpWithEmail` return `{ data, error }` (full Supabase response)  
- Add `signOut(): Promise<{ error }>` helper  
- Add `refreshSession(): Promise<{ data, error }>` helper  
- All existing call sites updated

---

### [T-039] Fix: `KeyboardAvoidingView` behavior not platform-branched
**Files:** `app/(auth)/login.tsx:84`, `app/(auth)/signup.tsx:76`  
**Description:** `behavior="padding"` is correct on iOS but wrong on Android (should be `"height"`).  
**Success criteria:** Both files use `behavior={Platform.OS === "ios" ? "padding" : "height"}`. Import `Platform` from `react-native`.

---

### [x] [T-040] Cleanup: Remove dead code and console.logs from auth screens
**Files:** `app/(auth)/login.tsx:72, 75-76, 80, 191, 200, 210`, `app/(auth)/signup.tsx:50`  
**Description:** Dead vars (`mx`, `my`), commented-out `<BackgroundCircle />`, PII log in forgot-password, stub logs for Google/Apple, nav-timing logs.  
**Success criteria:** All items removed. `npm run lint` passes with no new warnings.

---

### [x] [T-041] Cleanup: Unify signup input style with `loginStyles.input`
**File:** `app/(auth)/signup.tsx:229-238`  
**Description:** `signupStyles.input` duplicates `loginStyles.input` differing only in background color.  
**Success criteria:** Remove `signupStyles.input`. Either use `loginStyles.input` directly (updating background elsewhere) or extract a shared token in `login.styles.ts`.

---

### [x] [T-042] Fix: Onboard title readability + `elevation` no-op on Text
**File:** `styles/onboard.styles.ts:20-28`  
**Description:** `color: "#ffffff"` with white `textShadow` — invisible wherever gradient doesn't reach. `elevation: 5` on `Text` is Android no-op.  
**Success criteria:** Remove white text shadow or use a contrasting dark shadow. Remove `elevation: 5` from `Text` style.

---

### [T-043] Fix: Resolve staged empty `(auth)/index.tsx`
**File:** `app/(auth)/index.tsx` (git status: `AD`)  
**Description:** File was staged as an empty placeholder and then deleted in the working tree. The `(auth)` group has no default child route.  
**Success criteria:** Commit the deletion (guard handles default routing). Confirm `git status` shows the deletion. Verify no navigation breaks.

---

### [T-044] Fix: Stack animation mismatch between `(auth)` and `(app)` layouts
**Files:** `app/(auth)/_layout.tsx:4`, `app/(app)/_layout.tsx`  
**Description:** `(auth)` uses `animation: "fade"`. `(app)` uses platform default (slide). Transitions between groups are inconsistent.  
**Success criteria:** Both layouts use the same `animation` value. Choose one: `"fade"` for both, or remove from `(auth)` to match `(app)` platform default.

---

## P3 — Nice-to-Have / Future

### [T-020] Add: Record viewer (image full-screen + PDF)
Open tapped record in full-screen image viewer or WebView for PDFs.

### [x] [T-021] Add: Local notifications for medication schedules
**Done 2026-04-26** — Local `expo-notifications` system fully wired:
- `utils/notifications.ts`: Android channel, TAKE/SNOOZE category, schedule/cancel/snooze/sync helpers
- `utils/manilaTime.ts`: Manila TZ date arithmetic (`combineManilaDateTime`, `manilaDateString`)
- `supabase/migration.sql` section 12: `notification_id text` column on `medication_schedules`
- Notifications scheduled on `savePrescription`, cancelled on Take/Skip via `markScheduleStatus`
- `app/_layout.tsx`: `configureNotifications` + `syncAllPendingNotifications` on login; snooze/take response handler
- Permission requested in onboarding `done.tsx`

**Remaining (separate task):** Push notifications via FCM/APNs — store `expo_push_token` in `profiles`, Edge Function sends push at `scheduled_time`. See T-021-push.

### [T-022] Add: Adherence analytics screen
Adherence rate per medication, streak counter, per-day calendar heatmap.

### [T-023] Add: Drug interaction check on prescription save
After `savePrescription`, call Gemini Edge Function with all active medication names to flag interactions.

### [T-024] Add: Real AI chat in `alalay_chat.tsx`
Replace placeholder with full message-list UI backed by `chat_messages` Supabase table and streaming Gemini Edge Function.

### [T-025] Add: Medication history export (PDF)
Export full medication + schedule history as formatted PDF for doctor visits.

### [T-026] Add: Pagination to `getMedicalRecords`
Add `.range(offset, offset + PAGE_SIZE)` and infinite scroll.

### [T-027] Add: Schedule duration picker on medication save
Prompt user: "For how many days?" (7 / 14 / 30 / custom). Pass to `createSchedulesForMedication`.

### [T-028] Add: Edit/delete individual schedule entries from dashboard
Long-press on a schedule card to edit time or delete the entry.

### [T-048] Fix: SwipeActionRow icons and labels are swapped
**File:** `components/SwipeActionRow.tsx:38-44, 54-61`  
**Description:** `renderLeftActions` (Edit) shows check icon; `renderRightActions` (Take) shows pencil icon. Opposite of intent.  
**Success criteria:** Edit action uses `<Feather name="edit-2">`. Take action uses `<Feather name="check">`.

---

### [T-049] Fix: SwipeActionRow style names are reversed
**File:** `components/SwipeActionRow.tsx:80-107`  
**Description:** `leftAction` style is green (Take color); `rightAction` is purple (Edit color). Names imply position, not action — inverted relative to their render functions.  
**Success criteria:** Rename to `takeAction` (green) and `editAction` (purple). Update both `renderLeftActions` and `renderRightActions` usages.

---

### [T-050] Fix: Edit-via-swipe creates duplicate record instead of updating
**Files:** `components/AddMedicationWidget.tsx:124-155`, `utils/database.ts`  
**Description:** `handleSave` always calls `saveManualMedication` / `saveAppointment` (INSERT). No update path. Swiping to edit creates a new duplicate row.  
**Success criteria:**  
- Add `medicationId?: number` prop to `AddMedicationWidget`  
- Add `updateMedication({ id, name, description, intakeTimes, startDate, endDate })` helper in `utils/database.ts`  
- `handleSave` branches: if `medicationId` provided → UPDATE, else → INSERT  
- Dashboard passes `schedule.medication.id` through `editData`

---

### [T-051] Fix: Take swipe action renders for non-pending items
**File:** `components/SwipeActionRow.tsx:67`  
**Description:** `renderRightActions` always provided; swipe-left on a taken/missed row shows green "Take" panel that silently does nothing.  
**Success criteria:** Pass `renderRightActions={status === "pending" ? renderRightActions : undefined}` to `<Swipeable>`.

---

### [T-052] Fix: SwipeActionRow `status` prop missing `"missed"` type
**Files:** `components/SwipeActionRow.tsx:10`, `app/(app)/dashboard.tsx:714`  
**Description:** Prop typed `"pending" | "taken"`. Once T-019 cron marks missed medications, dashboard cast `as "pending" | "taken"` becomes unsafe.  
**Success criteria:** Add `"missed"` to `SwipeActionRow` Props `status` union. Remove unsafe cast in dashboard.

---

### [T-053] Refactor: Replace deprecated swipe callbacks in SwipeActionRow
**File:** `components/SwipeActionRow.tsx:69-70`  
**Description:** `onSwipeableLeftOpen` / `onSwipeableRightOpen` deprecated in RNGH v2+.  
**Success criteria:** Replace with `onSwipeableOpen={(direction) => direction === "left" ? handleLeftOpen() : handleRightOpen()}`.

---

### [T-054] Fix: AddMedicationWidget title shows "Add" in edit mode
**File:** `components/AddMedicationWidget.tsx:237`  
**Description:** Title reads "Add medication" when opened via swipe-to-edit. Should read "Edit medication".  
**Success criteria:** Title uses `initialData ? "Edit" : "Add"` prefix.

---

### [T-055] Fix: Gesture conflict — Swipeable inside Reanimated ScrollView
**File:** `app/(app)/dashboard.tsx:684`  
**Description:** RNGH `Swipeable` inside Reanimated `Animated.ScrollView` causes horizontal/vertical gesture conflict, especially on Android.  
**Success criteria:** Replace list container with RNGH `ScrollView` (from `react-native-gesture-handler`), or configure `simultaneousHandlers` refs on each `Swipeable`.

---

### [T-045] Add: Google / Apple sign-in (or remove stubs)
**File:** `app/(auth)/login.tsx:189-205`  
Implement with `expo-auth-session` + Google Identity Services and Sign in with Apple, OR remove both buttons and the `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` env var.

### [T-046] Add: Magic link / OTP + `alalay://` deep-link handler
**Files:** `utils/auth.ts`, `app/_layout.tsx` or `app/(auth)/callback.tsx`  
Implement `signInWithOtp` + a deep-link listener that calls `supabase.auth.exchangeCodeForSession()`. Required for PLANS Phase 1.1 magic link deliverable and for SEC-09 fix.

### [T-047] Add: Password strength rules
**File:** `app/(auth)/signup.tsx:44`  
Add client-side rejection of `password === email`. Configure server-side strength policy in Supabase Auth settings.
