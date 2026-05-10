# EvoPilot v0.2

EvoPilot is a self-improving MVP autopilot that connects to projects, tracks issues as improvement tasks, generates safe repair prompts, and now creates GitHub issues from tasks (without auto-push or auto-deploy).

## Tech Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase (or in-memory fallback when env is not configured)
- Vercel-ready app structure
- Playwright end-to-end tests

## Required Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Optional for server-side privileged writes:
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# Required for GitHub issue creation (server-side only)
GITHUB_TOKEN=your_github_personal_access_token
```

If Supabase variables are not set, the app runs with an in-memory store for local demo/testing.

## GitHub Token Setup

1. In GitHub, create a Personal Access Token (classic or fine-grained).
2. Grant permissions needed to manage repository issues and labels:
   - **Issues: Read and write**
   - **Metadata: Read-only**
3. Add the token to `GITHUB_TOKEN` in `.env.local` (never expose it in client code).
4. Restart your dev server.

## Database Setup (Supabase)

Run SQL migrations in order:

- `supabase/migrations/0001_init.sql`
- `supabase/migrations/0002_github_issue_fields.sql`

This creates:

- `projects`
- `improvement_tasks`
- GitHub owner/repo fields on projects
- GitHub issue tracking fields on improvement tasks
- `updated_at` trigger for `improvement_tasks`

## GitHub Issue Workflow

On `/tasks/[id]`, use **Create GitHub Issue** to create a repo issue from task context.

EvoPilot will:

- parse `github_owner/github_repo` from project repo URL
- create required labels if missing (`evopilot`, `severity:*`, `type:*`)
- create/update/recreate issue safely
- save issue URL, number, timestamp, and GitHub issue status back to task
- prevent duplicate issue creation unless you choose Update or Recreate

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Main Routes

- `/` — Founder dashboard
- `/projects/new` — Add MVP
- `/projects/[id]` — Project detail + linked tasks
- `/projects/[id]/tasks/new` — Add issue/task
- `/tasks` — Founder HQ all tasks + status updates + GitHub issue status/link
- `/tasks/[id]` — Task detail + fix prompt generation + GitHub issue sync controls

## Safety Guardrail

Generated fix prompts and GitHub issue body include safety reminders:

- create a new branch
- do not modify unrelated files
- run tests
- open PR only
- human approval required before deploy

## Testing

Install browsers once:

```bash
npm run playwright:install
```

Run lint/build/e2e:

```bash
npm run lint
npm run build
npm run test:e2e
```

## Integration Checklist (v0.2)

- [ ] Create project with valid GitHub repo URL
- [ ] Create task
- [ ] Generate fix prompt
- [ ] Click **Create GitHub Issue**
- [ ] Verify task now shows GitHub issue URL + number + status=Created
- [ ] Verify duplicate create is blocked and Update/Recreate paths are available

## Playwright Coverage

`tests/e2e/evopilot.spec.ts` covers:

1. Add MVP
2. Add task
3. Generate fix prompt
4. Change task status
5. View dashboard summary
