create extension if not exists "pgcrypto";

create table if not exists public.agent_registry (
  id text primary key,
  name text not null,
  type text not null,
  description text,
  enabled boolean default true,
  capabilities jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null references public.agent_registry(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  task_id uuid references public.improvement_tasks(id) on delete set null,
  status text not null,
  input jsonb default '{}'::jsonb,
  output jsonb default '{}'::jsonb,
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

create table if not exists public.agent_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  source_agent text not null,
  project_id uuid references public.projects(id) on delete set null,
  task_id uuid references public.improvement_tasks(id) on delete set null,
  payload jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists public.agent_memories (
  id uuid primary key default gen_random_uuid(),
  memory_type text not null,
  scope text not null,
  project_id uuid references public.projects(id) on delete set null,
  content jsonb default '{}'::jsonb,
  tags text[] default '{}',
  created_at timestamp with time zone default now()
);

create table if not exists public.system_context (
  id uuid primary key default gen_random_uuid(),
  context_type text not null,
  key text not null,
  value jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default now(),
  unique(context_type, key)
);
