export type Profile = {
  id: number;
  auth_id: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
};

export type Prescription = {
  id: number;
  user_id: string;
  image_url: string | null;
  raw_ocr_text: string | null;
  source: "camera" | "gallery" | "manual";
  created_at: string;
};

export type Medication = {
  id: number;
  prescription_id: number | null;
  user_id: string;
  name: string;
  original_name: string | null;
  dosage: string | null;
  instructions: string | null;
  time: string | null;
  confidence: "low" | "medium" | "high" | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MedicationSchedule = {
  id: number;
  medication_id: number;
  user_id: string;
  scheduled_date: string;
  scheduled_time: string | null;
  status: "pending" | "taken" | "missed" | "skipped";
  taken_at: string | null;
  created_at: string;
};

export type MedicalRecord = {
  id: number;
  user_id: string;
  record_type: "prescription" | "lab_result" | "medical_id" | "other";
  title: string | null;
  file_url: string | null;
  notes: string | null;
  created_at: string;
};

// Insert types (omit auto-generated fields)
export type PrescriptionInsert = Omit<Prescription, "id" | "created_at">;
export type MedicationInsert = Omit<Medication, "id" | "created_at" | "updated_at" | "is_active">;
export type MedicationScheduleInsert = Omit<MedicationSchedule, "id" | "created_at" | "status" | "taken_at">;
export type MedicalRecordInsert = Omit<MedicalRecord, "id" | "created_at">;
