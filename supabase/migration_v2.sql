-- Migration v2: Extended profile fields for onboarding steps 4 & 5
-- Run this against your Supabase project via the SQL editor or CLI.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS drug_allergies        text[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS doctor_name           text,
  ADD COLUMN IF NOT EXISTS doctor_clinic         text,
  ADD COLUMN IF NOT EXISTS doctor_contact        text,
  ADD COLUMN IF NOT EXISTS emergency_name        text,
  ADD COLUMN IF NOT EXISTS emergency_relation    text,
  ADD COLUMN IF NOT EXISTS emergency_phone       text;
