-- Architect 2.0 prototype: the one real table.
-- Run this once in the Supabase SQL editor. Row-level security means a signed-in
-- user can only ever read or write their own projects, even though the anon key is public.

create table if not exists public.projects (
  id          text primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

create index if not exists projects_user_updated on public.projects (user_id, updated_at desc);

alter table public.projects enable row level security;

create policy "read own projects"   on public.projects for select using (auth.uid() = user_id);
create policy "insert own projects" on public.projects for insert with check (auth.uid() = user_id);
create policy "update own projects" on public.projects for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own projects" on public.projects for delete using (auth.uid() = user_id);
