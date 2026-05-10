# EvoPilot v0.3 — AI Workforce Operating System Foundations

EvoPilot is evolving from a task utility into an AI Workforce Operating System for startups.

v0.3 introduces a core orchestration architecture while preserving existing v0.1/v0.2 workflows:

- project + task management
- fix prompt generation
- GitHub issue creation/sync

No autonomous deploys, no auto-merge, and no direct production modifications are introduced.

## Tech Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase (or in-memory fallback when env is not configured)
- Playwright end-to-end tests

## Required Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Optional for privileged server writes
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# Required for task -> GitHub issue sync (server-side only)
GITHUB_TOKEN=your_github_personal_access_token
```

`GITHUB_TOKEN` is server-side only and must never be exposed to browser code.

## GitHub Token Setup (v0.2 workflow)

1. Create a GitHub Personal Access Token (classic or fine-grained).
2. Grant repository permissions:
   - Issues: Read and write
   - Metadata: Read-only
3. Add token to `GITHUB_TOKEN` in `.env.local`.
4. Restart local dev server.

## Architecture Overview (v0.3)

New core layer:

- `/core/memory`
- `/core/agents`
- `/core/events`
- `/core/runtime`
- `/core/context`

This layer powers shared intelligence and orchestration across Builder, QA, Growth, Support, Operations, and Founder Intelligence systems.

## Core Systems Added

### 1) Global Memory System

- Agent memory persistence (`agent_memories`)
- System context persistence (`system_context`)
- Shared memory utilities in `/core/memory`

### 2) Agent Registry

- Registry table (`agent_registry`)
- Seeded foundational agents:
  1. Builder Agent
  2. QA Agent
  3. Growth Agent
  4. Support Agent
  5. Operations Agent
  6. Founder Intelligence Agent
- UI routes:
  - `/agents` registry list
  - `/agents/[id]` details + run history

### 3) Event Bus

- `publishEvent()`
- `subscribeToEvent()`
- Event persistence (`agent_events`)

Example event types:
- `task.created`
- `task.failed`
- `deployment.failed`
- `payment.failed`
- `test.failed`
- `onboarding.dropoff`
- `issue.created`
- `issue.resolved`

### 4) Agent Runtime

- Standardized runtime in `/core/runtime/agentRunner.ts`
- Run lifecycle logging in `agent_runs`
- Common interface includes:
  - id
  - name
  - capabilities
  - subscribedEvents
  - execute()

### 5) Shared Context Engine

- `getProjectContext(projectId)` in `/core/context/project-context.ts`
- Aggregates project/task signals, failures, deployments, recent agent activity, and metric placeholders

### 6) Founder Intelligence Layer

- New route: `/hq`
- Command center includes:
  - Active Projects
  - System Health
  - Open Failures
  - Agent Activity Feed
  - Suggested Actions
  - Recent Deployments
  - Revenue Alerts placeholder
  - User Issues placeholder
  - AI Recommendations placeholder

### 7) Agent Foundations

- Builder Agent: analyzes severity, emits repair strategy + coding recommendation, publishes recommendation events
- QA Agent: classifies failures from logs, suggests fixes, publishes `qa.failure`

Both agents are recommendation-only (no autonomous code/deploy actions).

## Database Setup (Supabase)

Run migrations in order:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_github_issue_fields.sql`
3. `supabase/migrations/0003_core_architecture.sql`

New v0.3 tables:

- `agent_registry`
- `agent_runs`
- `agent_events`
- `agent_memories`
- `system_context`

## Main Routes

- `/` — dashboard
- `/hq` — founder intelligence command center
- `/agents` — agent registry
- `/agents/[id]` — agent details + run history
- `/projects/new` — add MVP
- `/projects/[id]` — project detail
- `/projects/[id]/tasks/new` — create task
- `/tasks` — task management and GitHub issue tracking
- `/tasks/[id]` — task detail, fix prompt, GitHub issue sync

## Safety Guardrails

EvoPilot remains recommendation-driven:

- No autonomous deployment
- No auto-merge
- No direct production modification
- PR-based workflow with human approval

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Testing

Install browsers once:

```bash
npm run playwright:install
```

Validate repo:

```bash
npm run lint
npm run build
npm run test:e2e
```

## Integration Checklists

### Existing workflow integrity

- [ ] Create project
- [ ] Create task
- [ ] Generate fix prompt
- [ ] Create GitHub issue and verify URL saved

### v0.3 orchestration foundations

- [ ] Agent registry renders seeded agents
- [ ] Agent can be enabled/disabled from `/agents`
- [ ] Agent run entry is created from `/agents/[id]`
- [ ] Event publishing persists to `agent_events`
- [ ] Memory save persists to `agent_memories`
- [ ] HQ dashboard renders activity + suggested actions

## Roadmap (next phases)

- richer cross-agent subscriptions and routing logic
- external signal ingestion pipelines (payments, deployments, support)
- deeper founder strategy recommendations with prioritization scoring
- supervised autonomy with explicit approval gates
