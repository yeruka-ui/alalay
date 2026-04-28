# PLANS.md — Alalay Strategic Roadmap

**Date:** 2026-04-16 (last updated 2026-04-18)  
**Horizon:** Short (0–4 weeks) · Medium (1–3 months) · Long (3–6 months)

---

## Phase 0.1 — Auth Guard Refactor (COMPLETED 2026-04-18)

**What was done:**
- Replaced one-shot `getSession()` redirect in `app/index.tsx` with a live auth guard in root `_layout.tsx`
- Implemented route groups: `(auth)` for public screens, `(app)` for protected screens
- Root guard uses `<Slot/>` + `supabase.auth.onAuthStateChange` + `useSegments` to enforce access control
- Sessions now persist across state changes (sign-in, sign-out, token expiry)
- Deep link protection: unauthenticated users to `/login` regardless of requested URL
- Auth UI scaffolded: `login.tsx`, `signup.tsx`, `onboard.tsx`, `BackgroundCircle` component added

**Impact:** Architecture now scalable for adding multiple protected screens and reactive to session state. Auth UI is scaffolded but carries critical bugs — T-029 through T-047 track hardening work. Guard has a known FOUC issue (BUG-12, T-031).

---

## Phase 0 — Fix Broken Flows (COMPLETED 2026-04-26)

| Item | Status |
|---|---|
| BUG-01 / T-001: Wire `savePrescription` to voice flow | ✅ Fixed |
| BUG-02 / T-002: Call `createSchedulesForMedication` after save | ✅ Fixed |
| SEC-02 / T-003: Replace `getPublicUrl` with `createSignedUrl` | ✅ Fixed 2026-04-23 |
| SEC-01 / T-004: Proxy Gemini calls through Edge Function | ✅ Fixed 2026-04-21 |

---

## Phase 0.2 — Auth UI Hardening (Week 1–2, Prerequisite)

BUG-06/07/08 resolved. Remaining blockers before auth is shippable:

| Item | Why Blocking |
|---|---|
| BUG-13 / T-030: `.env.example` uses wrong var names | Fresh clone crashes at launch |
| BUG-12 / T-031: Root guard FOUC + `segments` dep | Authenticated users see login flash on cold start |

---

## Phase 0.3 — Swipe Gesture Hardening (dashboardv3 branch)

Swipe-to-take and swipe-to-edit implemented. Critical issues must be fixed before merge:

| Item | Priority | Status |
|---|---|---|
| BUG-14 / T-048: Icons and labels swapped in SwipeActionRow | P1 | [ ] |
| BUG-16 / T-050: Edit creates duplicate record (no update path) | P0 | [ ] |
| BUG-17 / T-051: Take panel renders for non-pending items | P1 | [ ] |
| BUG-15 / T-049: Style names reversed (maintenance risk) | P2 | [ ] |
| DEBT-19 / T-052: Missing `"missed"` in status union | P2 | [ ] |
| DEBT-20 / T-053: Deprecated swipe callbacks | P3 | [ ] |
| DEBT-21 / T-054: Widget title says "Add" in edit mode | P2 | [ ] |
| DEBT-22 / T-055: Gesture conflict in Reanimated ScrollView | P1 | [ ] |

**Merge gate:** T-048, T-050, T-051, T-055 must be resolved before merging dashboardv3 → master.

---

## Phase 1 — Authentication & Core Stability (Weeks 2–4)

### 1.1 Authentication Flow
**Status:** [x] Guard infrastructure complete. [x] UI scaffolded. [x] BUG-06/07/08 fixed. Hardening in progress (T-033–T-034, T-036–T-037, T-046).

Auth screens (`login.tsx`, `signup.tsx`, `onboard.tsx`) are built. Remaining work is hardening: role validation, error message safety, forgot-password UX, checkbox UI, platform keyboard fix, native blur replacement, and magic link / deep-link integration.

**Remaining deliverables:**
- T-033: Map Supabase error codes → safe user-facing strings (login + signup)
- T-034: Forgot-password UX — validate, `redirectTo`, success banner, no PII log
- T-036: Render checkbox visual indicator in signup
- T-037: Replace `BackgroundCircle` fake blur with `expo-blur` or remove prop
- T-046: Magic link + OTP + `alalay://` deep-link callback handler

**Architecture notes:** Route groups + root guard pattern already in place. Screens should follow the pattern: (1) never call `router.replace` for auth — let the guard handle it, (2) show "Session expired" state on auth errors (distinct from empty data), (3) once T-031 lands, the guard gates `<Slot/>` on `ready`.

### 1.2 Crash Safety & Error Handling
- Add React error boundaries at screen level — white screen → friendly error card with "Try again" button (T-008)
- Replace silent `catch {}` patterns with explicit error handling: distinguish auth errors from empty data from server errors (T-006)
- Extract `parseMedications` to `utils/gemini.ts` with `GeminiMedicationItem` interface — removes `item: any` (T-007)

### 1.3 Security & Database Polish
- Add `with check` clauses to all RLS policies (T-010)
- Add `maxLength` to all TextInput fields (T-011)
- Fix nested `SafeAreaProvider` in `alalay_chat.tsx` (T-012)
- Clean up inline styles in dashboard (`StyleSheet.create`) (T-013)

---

## Phase 2 — Schedule Engine (Month 2)

### 2.1 Auto-Schedule on Save ✅ DONE 2026-04-26
`savePrescription` now calls `createSchedulesForMedication` for each medication (7 days from user-selected `startDate`). Both `prescription_camera.tsx` and `talk_to_alalay.tsx` pass a start date picker. UTC date bug fixed via `manilaDateString()`.

**Remaining:**
- Allow user to configure duration (7, 14, 30 days, or custom) — see T-027

### 2.2 Schedule Configuration UI
- Add schedule settings modal on `MedicationCard` — duration picker, custom time picker
- Add ability to edit/delete individual schedule entries from the dashboard

### 2.3 Missed Medication Automation
Create a Supabase scheduled function (pg_cron or Edge Function via Supabase Cron) that runs hourly and marks `status = 'missed'` for past-due `pending` schedules.

```sql
-- Target query for the cron job
UPDATE medication_schedules
SET status = 'missed'
WHERE status = 'pending'
  AND (scheduled_date || ' ' || COALESCE(scheduled_time, '23:59'))::timestamptz < now();
```

### 2.4 Local Notifications ✅ DONE 2026-04-26
`expo-notifications` fully wired:
- Android high-importance channel (`medication-reminders`) + TAKE/SNOOZE action buttons
- Notifications scheduled on `savePrescription`, cancelled on Take/Skip via `markScheduleStatus`
- `syncAllPendingNotifications` re-syncs on login (idempotent via stored `notification_id`)
- Permission requested in onboarding `done.tsx`
- Manila TZ-correct triggers via `combineManilaDateTime` in `utils/manilaTime.ts`

**Next (Push Notifications):** Store `expo_push_token` in `profiles`. Supabase Edge Function cron sends remote push at `scheduled_time` for users who have background app kill. Requires FCM/APNs setup.

---

## Phase 3 — AI Chat & Intelligence (Month 2–3)

`alalay_chat.tsx` is currently a blank `TextInput`. The roadmap here is to make it the primary AI interaction surface.

### 3.1 Chat Interface
Replace the placeholder with a real message-list UI:
- `FlatList` of chat bubbles (user/assistant)
- Streaming text responses via Supabase Edge Function → Gemini streaming API
- Persisted chat history in a new `chat_messages` table

### 3.2 Context-Aware Medication Assistant
The assistant should answer questions using the user's actual medication data:
- "When do I take my Metformin?" → query `medications` + `medication_schedules` → inject as context
- "Did I take my meds today?" → query today's `medication_schedules` statuses
- "What does Atorvastatin interact with?" → RAG against a drug interactions dataset or Gemini grounding

### 3.3 Drug Interaction Warnings
On save of any prescription, run a Gemini call with all current active medications to flag potential interactions. Display as a non-blocking warning banner.

---

## Phase 4 — Record Locker Enhancement (Month 3)

### 4.1 Functional Search
Wire search `TextInput` in `record_locker.tsx` to filter `records` state by `title` and `record_type`. Add debounce (300ms).

### 4.2 Record Viewer
Tapping a record should open it:
- Images: full-screen `Image` with pinch-to-zoom
- PDFs: `expo-pdf` or WebView to `createSignedUrl` result

### 4.3 Appointments Table
Add `appointments` table to schema. Fields: `user_id`, `title`, `doctor`, `location`, `appointment_date`, `notes`. Wire dashboard "Appointments" tab to this table.

---

## Phase 5 — Analytics & Adherence (Month 3–4)

### 5.1 Adherence Dashboard
New screen showing:
- Adherence rate (taken / total) per medication, per week
- Streak counter (consecutive days all meds taken)
- Calendar heatmap (green/red per day)

This data is already in `medication_schedules` — just needs aggregation queries.

### 5.2 Export
Allow users to export their medication history as a PDF for doctor visits. Generate via a Supabase Edge Function using a PDF library.

---

## Architectural Evolution

### State Before 2026-04-18
```
Mobile App
  ├─→ Gemini API (direct, key exposed in bundle)
  └─→ Supabase (direct, RLS + anon key)

Auth Guard: one-shot getSession() redirect in app/index.tsx
  Problem: deep links bypass guard, no reaction to runtime session changes
```

### State After 2026-04-18
```
Mobile App (route groups)
  ├─(auth)/onboard.tsx  (public — landing page)
  ├─(auth)/login.tsx    (public)
  ├─(auth)/signup.tsx   (public)
  ├─(app)/dashboard.tsx (protected) ← auth guard redirects here on success
  └─(app)/...           (all protected screens)

Auth Guard: root _layout.tsx with onAuthStateChange + useSegments
  Benefit: guards all routes, reacts to session state, prevents deep-link bypass
  Known issue: <Slot/> not gated on `ready` → FOUC on cold start (BUG-12, T-031)
  
Still TODO: Gemini API key needs server-side proxy (Phase 0 blocker SEC-01)
```

### Target State (Phase 1–2)
```
Mobile App → Supabase Edge Functions → Gemini API (key server-side)
Mobile App → Supabase (anon key, RLS enforced)
```

### Why Edge Functions
1. API key security (SEC-01)
2. Server-side validation before DB writes
3. Enables rate limiting, logging, abuse detection
4. Foundation for Phase 3 AI features (streaming, RAG, function calling)

### Database Additions Required

| Phase | New Table/Column | Status |
|---|---|---|
| 2 | `medication_schedules.notification_id text` | ✅ Done (migration section 12) |
| 2-push | `profiles.expo_push_token text` | Pending |
| 3 | `chat_messages(id, user_id, role, content, created_at)` | Pending |
| 4 | `appointments(id, user_id, title, doctor, location, appointment_date, notes)` | Pending |
| 5 | No new tables — views/functions over existing `medication_schedules` | Pending |
