# EvoPilot v0.1

EvoPilot is a self-improving MVP autopilot that connects to projects, tracks issues as improvement tasks, generates safe repair prompts, and prepares PR-oriented execution (no auto-deploy).

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
```

If Supabase variables are not set, the app runs with an in-memory store for local demo/testing.

## Database Setup (Supabase)

Run the SQL migration in `supabase/migrations/0001_init.sql` against your Supabase Postgres database.

It creates:

- `projects`
- `improvement_tasks`
- `updated_at` trigger for `improvement_tasks`

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
- `/tasks` — Founder HQ all tasks + status updates
- `/tasks/[id]` — Task detail + fix prompt generation

## Safety Guardrail

Generated fix prompts explicitly require:

- creating a new branch
- running tests
- running Playwright
- opening a PR
- **not auto-deploying to production**

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

## Playwright Coverage

`tests/e2e/evopilot.spec.ts` covers:

1. Add MVP
2. Add task
3. Generate fix prompt
4. Change task status
5. View dashboard summary
