-- Armenian Tutor: database setup for accounts.
-- In your Supabase project open "SQL Editor", paste this whole file, and click "Run".
-- It is safe to run more than once.

-- One row per person holding all of their progress.
create table if not exists public.progress (
  user_id    uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Row Level Security: each signed-in person can only see and change their own row.
alter table public.progress enable row level security;

drop policy if exists "Read own progress" on public.progress;
create policy "Read own progress" on public.progress
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Add own progress" on public.progress;
create policy "Add own progress" on public.progress
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Update own progress" on public.progress;
create policy "Update own progress" on public.progress
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Signed-in users may use the table (the policies above still apply).
-- Visitors who are not signed in get no access at all.
revoke all on public.progress from anon;
grant select, insert, update on public.progress to authenticated;
