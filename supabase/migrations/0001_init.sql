create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  repo_url text,
  production_url text,
  framework text,
  test_command text,
  playwright_command text,
  sentry_info text,
  notes text,
  created_at timestamp with time zone default now()
);

create table if not exists public.improvement_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  type text,
  severity text,
  source text,
  status text default 'New',
  page_url text,
  error_message text,
  steps_to_reproduce text,
  expected_behavior text,
  actual_behavior text,
  logs text,
  screenshot_url text,
  fix_prompt text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists improvement_tasks_set_updated_at on public.improvement_tasks;

create trigger improvement_tasks_set_updated_at
before update on public.improvement_tasks
for each row
execute function public.set_updated_at();
