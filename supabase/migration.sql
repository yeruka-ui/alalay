-- ============================================================
-- Alalay Database Schema Migration
-- Run this in Supabase SQL Editor (supabase.com/dashboard)
-- ============================================================

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id bigint generated always as identity primary key,
  auth_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index profiles_auth_id_idx on public.profiles (auth_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (auth_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. PRESCRIPTIONS
-- ============================================================
create table public.prescriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text,
  raw_ocr_text text,
  source text not null default 'camera'
    check (source in ('camera', 'gallery', 'manual')),
  created_at timestamptz default now()
);

create index prescriptions_user_id_idx on public.prescriptions (user_id);

-- ============================================================
-- 3. MEDICATIONS
-- ============================================================
create table public.medications (
  id bigint generated always as identity primary key,
  prescription_id bigint references public.prescriptions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  original_name text,
  dosage text,
  instructions text,
  time text,
  confidence text check (confidence in ('low', 'medium', 'high')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index medications_user_id_idx on public.medications (user_id);
create index medications_prescription_id_idx on public.medications (prescription_id);

-- ============================================================
-- 4. MEDICATION SCHEDULES
-- ============================================================
create table public.medication_schedules (
  id bigint generated always as identity primary key,
  medication_id bigint not null references public.medications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  scheduled_date date not null,
  scheduled_time text,
  status text not null default 'pending'
    check (status in ('pending', 'taken', 'missed', 'skipped')),
  taken_at timestamptz,
  created_at timestamptz default now()
);

create index schedules_user_id_idx on public.medication_schedules (user_id);
create index schedules_medication_id_idx on public.medication_schedules (medication_id);
create index schedules_date_idx on public.medication_schedules (user_id, scheduled_date);

-- ============================================================
-- 5. MEDICAL RECORDS (Record Locker)
-- ============================================================
create table public.medical_records (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  record_type text not null default 'other'
    check (record_type in ('prescription', 'lab_result', 'medical_id', 'other')),
  title text,
  file_url text,
  notes text,
  created_at timestamptz default now()
);

create index medical_records_user_id_idx on public.medical_records (user_id);

-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.prescriptions enable row level security;
alter table public.medications enable row level security;
alter table public.medication_schedules enable row level security;
alter table public.medical_records enable row level security;

-- Profiles: users access own profile
create policy profiles_policy on public.profiles
  for all to authenticated
  using (auth_id = auth.uid());

-- All other tables: users access own rows
create policy prescriptions_policy on public.prescriptions
  for all to authenticated
  using (user_id = auth.uid());

create policy medications_policy on public.medications
  for all to authenticated
  using (user_id = auth.uid());

create policy schedules_policy on public.medication_schedules
  for all to authenticated
  using (user_id = auth.uid());

create policy medical_records_policy on public.medical_records
  for all to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- 7. STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public)
values
  ('prescriptions', 'prescriptions', false),
  ('medical-records', 'medical-records', false);

-- Storage RLS: users can manage their own files (folder = user UUID)
create policy storage_prescriptions_policy on storage.objects
  for all to authenticated
  using (bucket_id = 'prescriptions' and (storage.foldername(name))[1] = auth.uid()::text);

create policy storage_medical_records_policy on storage.objects
  for all to authenticated
  using (bucket_id = 'medical-records' and (storage.foldername(name))[1] = auth.uid()::text);
