export type Profile = {
  id: number;
  auth_id: string;
  full_name: string | null;
  birth_date: string | null;
  health_conditions: string[] | null;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
};

export type ProfileUpdate = Partial<
  Pick<
    Profile,
    "full_name" | "birth_date" | "health_conditions" | "onboarding_complete"
  >
>;

export type Prescription = {
  id: number;
  user_id: string;
  image_path: string | null;
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
  time: string | null; // timetz — stored as "HH:MM:SS+08:00", display via fromDbTime()
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
  scheduled_time: string | null; // timetz — stored as "HH:MM:SS+08:00", display via fromDbTime()
  status: "pending" | "taken" | "missed" | "skipped";
  taken_at: string | null;
  notification_id: string | null; // expo-notifications identifier, null when not scheduled or after cancellation
  created_at: string;
};

export type MedicalRecord = {
  id: number;
  user_id: string;
  record_type: "prescription" | "lab_result" | "medical_id" | "other";
  title: string | null;
  file_path: string | null;
  notes: string | null;
  created_at: string;
};

// Insert types (omit auto-generated fields)
export type PrescriptionInsert = Omit<Prescription, "id" | "created_at">;
export type MedicationInsert = Omit<
  Medication,
  "id" | "created_at" | "updated_at" | "is_active"
>;
export type MedicationScheduleInsert = Omit<
  MedicationSchedule,
  "id" | "created_at" | "status" | "taken_at"
>;
export type MedicalRecordInsert = Omit<MedicalRecord, "id" | "created_at">;
