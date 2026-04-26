import type { MedicationItem } from "@/components/MedicationCard";
import type {
  MedicalRecord,
  Medication,
  MedicationSchedule,
  Prescription,
  ProfileUpdate,
} from "@/types/database";
import { supabase } from "./supabase";
import { toDbTime } from "./timeFormat";
import { manilaDateString } from "./manilaTime";
import { cancelNotificationFor, scheduleNotificationFor } from "./notifications";

// ─── Auth Helpers ────────────────────────────────────────────

export async function getCurrentUserId(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  return session.user.id;
}

// ─── Profile / Onboarding ────────────────────────────────────

export async function checkOnboardingComplete(): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    const { data } = await supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("auth_id", userId)
      .maybeSingle();
    return data?.onboarding_complete ?? false;
  } catch {
    return false;
  }
}

export async function upsertOnboardingStep(updates: ProfileUpdate): Promise<void> {
  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from("profiles")
    .upsert({ auth_id: userId, ...updates }, { onConflict: "auth_id" });
  if (error) throw error;
}

export async function markOnboardingComplete(): Promise<void> {
  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from("profiles")
    .upsert({ auth_id: userId, onboarding_complete: true }, { onConflict: "auth_id" });
  if (error) throw error;
}

// ─── Prescriptions & Medications ─────────────────────────────

export async function savePrescription(
  medications: MedicationItem[],
  imagePath?: string,
  rawOcrText?: string,
  source: "camera" | "gallery" | "manual" = "camera",
  startDate: Date = new Date(),
): Promise<{ prescription: Prescription; medications: Medication[] }> {
  const userId = await getCurrentUserId();

  // Insert prescription
  const { data: prescription, error: rxError } = await supabase
    .from("prescriptions")
    .insert({
      user_id: userId,
      image_path: imagePath,
      raw_ocr_text: rawOcrText,
      source,
    })
    .select()
    .single();

  if (rxError || !prescription)
    throw rxError ?? new Error("Failed to insert prescription");

  // Insert medications
  const medicationRows = medications.map((med) => ({
    prescription_id: prescription.id,
    user_id: userId,
    name: med.name,
    original_name: med.suggestion ? med.name : null,
    dosage: med.dosage ?? null,
    instructions: med.instructions,
    time: med.time ? toDbTime(med.time) : null,
    confidence: med.confidence ?? null,
  }));

  const { data: savedMeds, error: medError } = await supabase
    .from("medications")
    .insert(medicationRows)
    .select();

  if (medError) throw medError;

  // Create schedule rows for the next 7 days starting from startDate
  const allSchedules = (
    await Promise.all(
      (savedMeds ?? []).map((med) =>
        createSchedulesForMedication(med.id, startDate, 7)
      )
    )
  ).flat();

  // Schedule a local notification for each future pending row
  const medMap = new Map(
    (savedMeds ?? []).map((m) => [m.id, m])
  );
  await Promise.all(
    allSchedules.map((schedule) => {
      const med = medMap.get(schedule.medication_id);
      if (!med) return Promise.resolve();
      return scheduleNotificationFor({
        ...schedule,
        medication: {
          name: med.name,
          dosage: med.dosage,
          instructions: med.instructions,
        },
      });
    })
  );

  return { prescription, medications: savedMeds ?? [] };
}

export async function getActiveMedications(): Promise<Medication[]> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ─── Medication Schedules ────────────────────────────────────

export async function getSchedulesForDate(
  date: Date,
): Promise<(MedicationSchedule & { medication: Medication })[]> {
  const userId = await getCurrentUserId();
  const dateStr = manilaDateString(date);

  const { data, error } = await supabase
    .from("medication_schedules")
    .select("*, medication:medications(*)")
    .eq("user_id", userId)
    .eq("scheduled_date", dateStr)
    .order("scheduled_time", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function updateScheduleStatus(
  scheduleId: number,
  status: "taken" | "missed" | "skipped",
): Promise<void> {
  const { error } = await supabase
    .from("medication_schedules")
    .update({
      status,
      taken_at: status === "taken" ? new Date().toISOString() : null,
    })
    .eq("id", scheduleId);

  if (error) throw error;
}

/** DB update + cancel scheduled notification in one call. */
export async function markScheduleStatus(
  scheduleId: number,
  status: "taken" | "missed" | "skipped",
  notificationId?: string | null
): Promise<void> {
  await updateScheduleStatus(scheduleId, status);
  await cancelNotificationFor(scheduleId, notificationId ?? null);
}

export async function createSchedulesForMedication(
  medicationId: number,
  medicationTime: string | null,
  userId: string,
  startDate: Date,
  days: number = 7
): Promise<MedicationSchedule[]> {
  const userId = await getCurrentUserId();

  const { data: med } = await supabase
    .from("medications")
    .select("time, name, dosage, instructions")
    .eq("id", medicationId)
    .single();

  const rows = [];
  for (let i = 0; i < days; i++) {
    // Advance in Manila wall time: add i * 86400000ms then take Manila date string
    const d = new Date(startDate.getTime() + i * 86_400_000);
    rows.push({
      medication_id: medicationId,
      user_id: userId,
      scheduled_date: manilaDateString(d),
      scheduled_time: med?.time ?? null,
    });
  }

  const { data, error } = await supabase
    .from("medication_schedules")
    .insert(rows)
    .select();
  if (error) throw error;
  return data ?? [];
}

// ─── Medical Records ─────────────────────────────────────────

export async function saveMedicalRecord(
  recordType: "prescription" | "lab_result" | "medical_id" | "other",
  filePath: string,
  title?: string,
  notes?: string,
): Promise<MedicalRecord> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("medical_records")
    .insert({
      user_id: userId,
      record_type: recordType,
      file_path: filePath,
      title: title ?? null,
      notes: notes ?? null,
    })
    .select()
    .single();

  if (error || !data) throw error ?? new Error("Failed to save record");
  return data;
}

export async function getMedicalRecords(
  recordType?: string,
): Promise<MedicalRecord[]> {
  const userId = await getCurrentUserId();

  let query = supabase
    .from("medical_records")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (recordType) {
    query = query.eq("record_type", recordType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// ─── File Upload ─────────────────────────────────────────────

export async function uploadFile(
  bucket: "prescriptions" | "medical-records",
  fileUri: string,
  fileName: string,
): Promise<string> {
  const userId = await getCurrentUserId();
  const filePath = `${userId}/${Date.now()}-${fileName}`;

  const response = await fetch(fileUri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, blob, { contentType: blob.type });

  if (error) throw error;
  return filePath;
}

export async function getSignedUrlFor(
  bucket: "prescriptions" | "medical-records",
  path: string,
  expiresIn: number = 60 * 5,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
