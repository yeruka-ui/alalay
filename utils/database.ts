import type { MedicationItem } from "@/components/MedicationCard";
import type {
  MedicalRecord,
  Medication,
  MedicationSchedule,
  Prescription,
} from "@/types/database";
import { supabase } from "./supabase";
import { toDbTime } from "./timeFormat";

// ─── Auth Helpers ────────────────────────────────────────────

export async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

// ─── Prescriptions & Medications ─────────────────────────────

export async function savePrescription(
  medications: MedicationItem[],
  imageUrl?: string,
  rawOcrText?: string,
  source: "camera" | "gallery" | "manual" = "camera",
  startDate: Date = new Date()
): Promise<{ prescription: Prescription; medications: Medication[] }> {
  const userId = await getCurrentUserId();

  // Insert prescription
  const { data: prescription, error: rxError } = await supabase
    .from("prescriptions")
    .insert({ user_id: userId, image_url: imageUrl, raw_ocr_text: rawOcrText, source })
    .select()
    .single();

  if (rxError || !prescription) throw rxError ?? new Error("Failed to insert prescription");

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
  await Promise.all(
    (savedMeds ?? []).map((med) =>
      createSchedulesForMedication(med.id, startDate, 7)
    )
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
  date: Date
): Promise<(MedicationSchedule & { medication: Medication })[]> {
  const userId = await getCurrentUserId();
  const dateStr = date.toISOString().split("T")[0];

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
  status: "taken" | "missed" | "skipped"
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

export async function createSchedulesForMedication(
  medicationId: number,
  startDate: Date,
  days: number = 7
): Promise<void> {
  const userId = await getCurrentUserId();

  const { data: med } = await supabase
    .from("medications")
    .select("time")
    .eq("id", medicationId)
    .single();

  const rows = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    rows.push({
      medication_id: medicationId,
      user_id: userId,
      scheduled_date: d.toISOString().split("T")[0],
      scheduled_time: med?.time ?? null,
    });
  }

  const { error } = await supabase.from("medication_schedules").insert(rows);
  if (error) throw error;
}

// ─── Medical Records ─────────────────────────────────────────

export async function saveMedicalRecord(
  recordType: "prescription" | "lab_result" | "medical_id" | "other",
  fileUrl: string,
  title?: string,
  notes?: string
): Promise<MedicalRecord> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("medical_records")
    .insert({
      user_id: userId,
      record_type: recordType,
      file_url: fileUrl,
      title: title ?? null,
      notes: notes ?? null,
    })
    .select()
    .single();

  if (error || !data) throw error ?? new Error("Failed to save record");
  return data;
}

export async function getMedicalRecords(
  recordType?: string
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
  fileName: string
): Promise<string> {
  const userId = await getCurrentUserId();
  const filePath = `${userId}/${Date.now()}-${fileName}`;

  const response = await fetch(fileUri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, blob, { contentType: blob.type });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}
