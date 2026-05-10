alter table if exists public.projects
  add column if not exists github_owner text,
  add column if not exists github_repo text;

alter table if exists public.improvement_tasks
  add column if not exists github_issue_url text,
  add column if not exists github_issue_number integer,
  add column if not exists github_issue_created_at timestamp with time zone,
  add column if not exists github_issue_status text default 'Not Created';
