-- IGO Agri Estate: Careers applications (run once in the Supabase SQL editor)

create table if not exists public.career_applications (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  full_name   text not null check (char_length(full_name) between 2 and 120),
  email       text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' and char_length(email) <= 200),
  phone       text not null check (char_length(phone) between 10 and 25),
  position    text not null check (char_length(position) between 2 and 160),
  experience  text check (experience in ('Freshers','1-3 years','4-7 years','8+ years')),
  about       text not null check (char_length(about) between 20 and 4000),
  resume_path text check (resume_path is null or resume_path ~ '^[0-9a-f-]{36}/resume\.(pdf|doc|docx)$'),
  status      text not null default 'new'
);

alter table public.career_applications enable row level security;

-- Visitors may only INSERT. Nobody can read, change or delete through the public key.
drop policy if exists "careers_insert_only" on public.career_applications;
create policy "careers_insert_only" on public.career_applications
  for insert to anon, authenticated with check (status = 'new');

-- PRIVATE bucket (no public URLs). Size and type limits are enforced by Supabase itself.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resumes', 'resumes', false, 5242880,
        array['application/pdf','application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update
  set public = false, file_size_limit = 5242880,
      allowed_mime_types = excluded.allowed_mime_types;

-- Visitors may only upload into the resumes bucket (no read/list/update/delete).
drop policy if exists "resumes_upload_only" on storage.objects;
create policy "resumes_upload_only" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'resumes' and name ~ '^[0-9a-f-]{36}/resume\.(pdf|doc|docx)$');

-- HR reads applications and resumes from the Supabase dashboard (service role),
-- or via short-lived signed URLs generated server-side. Never expose resume URLs publicly.
