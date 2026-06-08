/**
 * TODO: remove mock — delete this file and all USE_MOCK imports when you are
 * ready to connect to real Supabase. One flag controls everything:
 *   USE_MOCK = true  → fake data, no auth required
 *   USE_MOCK = false → real Supabase (needs a logged-in session)
 */

// ─── Master switch ────────────────────────────────────────────────────────────
export const USE_MOCK = true;

import type { Appointment, Medication, MedicationSchedule, MedicalRecord, Prescription } from "@/types/database";

export const MOCK_USER_ID = "mock-user-00000000-0000-0000-0000-000000000001";

// ─── Medications ─────────────────────────────────────────────────────────────
// These are the "active" medications shown on the dashboard and record locker.

export const MOCK_MEDICATIONS: Medication[] = [
  {
    id: 1, prescription_id: 1, user_id: MOCK_USER_ID,
    name: "Amoxicillin", original_name: null, dosage: "500mg",
    instructions: "Take with food", time: "08:00:00+08:00",
    confidence: "high", is_active: true,
    created_at: "2026-06-01T00:00:00+08:00", updated_at: "2026-06-01T00:00:00+08:00",
  },
  {
    id: 2, prescription_id: 1, user_id: MOCK_USER_ID,
    name: "Losartan", original_name: null, dosage: "50mg",
    instructions: "Once daily", time: "20:00:00+08:00",
    confidence: "high", is_active: true,
    created_at: "2026-06-01T00:00:00+08:00", updated_at: "2026-06-01T00:00:00+08:00",
  },
  {
    id: 3, prescription_id: 2, user_id: MOCK_USER_ID,
    name: "Metformin", original_name: null, dosage: "500mg",
    instructions: "Take after meals", time: "12:00:00+08:00",
    confidence: "medium", is_active: true,
    created_at: "2026-06-03T00:00:00+08:00", updated_at: "2026-06-03T00:00:00+08:00",
  },
  {
    id: 4, prescription_id: 2, user_id: MOCK_USER_ID,
    name: "Amlodipine", original_name: null, dosage: "5mg",
    instructions: "Take at bedtime", time: "21:00:00+08:00",
    confidence: "high", is_active: true,
    created_at: "2026-06-03T00:00:00+08:00", updated_at: "2026-06-03T00:00:00+08:00",
  },
  {
    id: 5, prescription_id: 3, user_id: MOCK_USER_ID,
    name: "Omeprazole", original_name: null, dosage: "20mg",
    instructions: "30 minutes before breakfast", time: "07:00:00+08:00",
    confidence: "high", is_active: true,
    created_at: "2026-06-05T00:00:00+08:00", updated_at: "2026-06-05T00:00:00+08:00",
  },
  {
    id: 6, prescription_id: 3, user_id: MOCK_USER_ID,
    name: "Vitamin D3", original_name: null, dosage: "1000 IU",
    instructions: "Take with a meal", time: "13:00:00+08:00",
    confidence: "high", is_active: true,
    created_at: "2026-06-05T00:00:00+08:00", updated_at: "2026-06-05T00:00:00+08:00",
  },
];

// ─── Schedules ────────────────────────────────────────────────────────────────
// getSchedulesForDate() returns these, filtered to whichever date the user taps.
// All entries share the same date so the dashboard always shows something
// regardless of which day is selected.

export function getMockSchedulesForDate(
  dateStr: string
): (MedicationSchedule & { medication: Medication })[] {
  return [
    { id: 101, medication_id: 1, user_id: MOCK_USER_ID, scheduled_date: dateStr, scheduled_time: "07:00:00+08:00", status: "pending",  taken_at: null, notification_id: null, created_at: "2026-06-01T00:00:00+08:00", medication: MOCK_MEDICATIONS[4] },
    { id: 102, medication_id: 2, user_id: MOCK_USER_ID, scheduled_date: dateStr, scheduled_time: "08:00:00+08:00", status: "pending",  taken_at: null, notification_id: null, created_at: "2026-06-01T00:00:00+08:00", medication: MOCK_MEDICATIONS[0] },
    { id: 103, medication_id: 3, user_id: MOCK_USER_ID, scheduled_date: dateStr, scheduled_time: "12:00:00+08:00", status: "taken",   taken_at: `${dateStr}T12:05:00+08:00`, notification_id: null, created_at: "2026-06-01T00:00:00+08:00", medication: MOCK_MEDICATIONS[2] },
    { id: 104, medication_id: 4, user_id: MOCK_USER_ID, scheduled_date: dateStr, scheduled_time: "13:00:00+08:00", status: "pending",  taken_at: null, notification_id: null, created_at: "2026-06-05T00:00:00+08:00", medication: MOCK_MEDICATIONS[5] },
    { id: 105, medication_id: 5, user_id: MOCK_USER_ID, scheduled_date: dateStr, scheduled_time: "20:00:00+08:00", status: "missed",  taken_at: null, notification_id: null, created_at: "2026-06-01T00:00:00+08:00", medication: MOCK_MEDICATIONS[1] },
    { id: 106, medication_id: 6, user_id: MOCK_USER_ID, scheduled_date: dateStr, scheduled_time: "21:00:00+08:00", status: "pending",  taken_at: null, notification_id: null, created_at: "2026-06-03T00:00:00+08:00", medication: MOCK_MEDICATIONS[3] },
  ];
}

// Returns pending schedules spread across the next 7 days — used by the Upcoming tab.
export function getMockAllPendingSchedules(): (MedicationSchedule & { medication: Medication })[] {
  const today = new Date();
  const entries: (MedicationSchedule & { medication: Medication })[] = [];
  let idCounter = 200;

  // Each day gets a rotating subset of medications, all pending
  const dailySlots: { medIndex: number; time: string }[][] = [
    [{ medIndex: 4, time: "07:00:00+08:00" }, { medIndex: 0, time: "08:00:00+08:00" }, { medIndex: 5, time: "13:00:00+08:00" }, { medIndex: 3, time: "21:00:00+08:00" }],
    [{ medIndex: 4, time: "07:00:00+08:00" }, { medIndex: 0, time: "08:00:00+08:00" }, { medIndex: 2, time: "12:00:00+08:00" }, { medIndex: 1, time: "20:00:00+08:00" }],
    [{ medIndex: 4, time: "07:00:00+08:00" }, { medIndex: 5, time: "13:00:00+08:00" }, { medIndex: 1, time: "20:00:00+08:00" }, { medIndex: 3, time: "21:00:00+08:00" }],
    [{ medIndex: 0, time: "08:00:00+08:00" }, { medIndex: 2, time: "12:00:00+08:00" }, { medIndex: 5, time: "13:00:00+08:00" }, { medIndex: 1, time: "20:00:00+08:00" }],
    [{ medIndex: 4, time: "07:00:00+08:00" }, { medIndex: 0, time: "08:00:00+08:00" }, { medIndex: 2, time: "12:00:00+08:00" }, { medIndex: 3, time: "21:00:00+08:00" }],
    [{ medIndex: 4, time: "07:00:00+08:00" }, { medIndex: 5, time: "13:00:00+08:00" }, { medIndex: 1, time: "20:00:00+08:00" }],
    [{ medIndex: 0, time: "08:00:00+08:00" }, { medIndex: 2, time: "12:00:00+08:00" }, { medIndex: 3, time: "21:00:00+08:00" }],
  ];

  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    for (const slot of dailySlots[day]) {
      entries.push({
        id: idCounter++,
        medication_id: MOCK_MEDICATIONS[slot.medIndex].id,
        user_id: MOCK_USER_ID,
        scheduled_date: dateStr,
        scheduled_time: slot.time,
        status: "pending",
        taken_at: null,
        notification_id: null,
        created_at: "2026-06-01T00:00:00+08:00",
        medication: MOCK_MEDICATIONS[slot.medIndex],
      });
    }
  }
  return entries;
}

// ─── Prescriptions ───────────────────────────────────────────────────────────

export const MOCK_PRESCRIPTION: Prescription = {
  id: 1,
  user_id: MOCK_USER_ID,
  image_path: null,
  raw_ocr_text: null,
  source: "manual",
  created_at: "2026-06-01T00:00:00+08:00",
};

// ─── Appointments ────────────────────────────────────────────────────────────

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 301,
    user_id: MOCK_USER_ID,
    title: "Follow-up Consultation",
    type: "follow_up",
    doctor_name: "Dr. Santos",
    location: "Makati Medical Center",
    notes: "Bring latest blood work results",
    appointment_date: "2026-06-12",
    appointment_time: "10:00:00+08:00",
    status: "upcoming",
    created_at: "2026-06-01T00:00:00+08:00",
  },
  {
    id: 302,
    user_id: MOCK_USER_ID,
    title: "Fasting Blood Test",
    type: "lab_test",
    doctor_name: null,
    location: "Hi-Precision Diagnostics",
    notes: "No food 8 hours before",
    appointment_date: "2026-06-15",
    appointment_time: "07:00:00+08:00",
    status: "upcoming",
    created_at: "2026-06-01T00:00:00+08:00",
  },
];

// ─── Medical Records ─────────────────────────────────────────────────────────

export const MOCK_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: 201,
    user_id: MOCK_USER_ID,
    record_type: "prescription",
    title: "Dr. Santos — June 2026",
    file_path: null,
    notes: "Follow-up in 2 weeks",
    created_at: "2026-06-01T00:00:00+08:00",
  },
  {
    id: 202,
    user_id: MOCK_USER_ID,
    record_type: "lab_result",
    title: "Blood Work — May 2026",
    file_path: null,
    notes: "Fasting glucose: 5.8 mmol/L",
    created_at: "2026-05-20T00:00:00+08:00",
  },
];
