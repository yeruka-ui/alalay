-- migration_v3: appointments table

create table if not exists public.appointments (
  id               bigserial primary key,
  user_id          uuid not null references auth.users(id) on delete cascade,
  title            text not null,
  type             text not null default 'other'
                     check (type in ('doctor_visit','lab_test','follow_up','other')),
  doctor_name      text,
  location         text,
  notes            text,
  appointment_date date not null,
  appointment_time timetz,
  status           text not null default 'upcoming'
                     check (status in ('upcoming','completed','cancelled')),
  created_at       timestamptz not null default now()
);

create index on public.appointments (user_id, appointment_date);

alter table public.appointments enable row level security;

create policy "Users manage own appointments"
  on public.appointments for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
