# Nimble S.T.A.R.S — Project Context for Claude Code

> This file is read automatically by Claude Code on startup.
> It provides all the context needed to work on this project.

## Project Overview

Nimble S.T.A.R.S (Sourcing Talent And Recruiting Solutions) is a white-label platform for Nimble (nimble.la) to share candidate profiles with their clients. Clients can review candidates, leave feedback, move them through a hiring pipeline, and collaborate with their team — all within a branded portal.

**Full documentation:**
- `BUILD.md` — Construction guide with all phases, tasks, and technical details
- `PRD.md` — Product requirements document with all features and specifications

## Tech Stack

- **Framework**: Next.js 14+ (App Router) + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Convex (database + server functions + realtime subscriptions)
- **Auth**: Supabase Auth (email/password)
- **Storage**: Supabase Storage (candidate files, org logos)
- **Hosting**: Vercel
- **Font**: Inter (Google Fonts)
- **DnD**: @hello-pangea/dnd or dnd-kit (for Kanban drag & drop)

## Linear Integration

- **Project**: Nimble Stars Project
- **Team**: AI Process Optimization
- **Issue range**: AIP-30 through AIP-62 (27 issues across 5 phases)
- **Statuses**: Backlog → In Progress → Done

### Phase → Issue Mapping

| Phase | Description | Issues |
|-------|-------------|--------|
| Phase 1 | Project Foundation | AIP-30 to AIP-36 |
| Phase 2 | Admin — Clients & Positions | AIP-37 to AIP-42 |
| Phase 3 | Admin — Candidates & Pipeline | AIP-43 to AIP-48 |
| Phase 4 | Client Portal | AIP-49 to AIP-55 |
| Phase 5 | Notifications & Polish | AIP-56 to AIP-62 |

## Workflow Per Task

For EVERY Linear issue, follow this exact workflow:

```
1. MOVE the Linear issue to "In Progress"
2. CREATE a new git branch:
   git checkout main
   git pull origin main
   git checkout -b feature/<ISSUE-ID>-<short-description>
   
3. EXECUTE the task as described in the Linear issue description
   (Each issue has detailed instructions, acceptance criteria, and file paths)

4. VERIFY quality:
   npm run lint
   npx tsc --noEmit
   npm run build

5. COMMIT with conventional commit message:
   git add .
   git commit -m "feat(<scope>): <description> [<ISSUE-ID>]"

6. MERGE to main:
   git checkout main
   git merge feature/<ISSUE-ID>-<short-description>
   git push origin main

7. COMMENT on the Linear issue with:
   ### Summary
   What was done (brief description)
   
   ### Approach
   How it was done (technical decisions made)
   
   ### Issues Encountered
   Any problems or deviations from the plan (or "None")
   
   ### Metrics
   - Tokens used: <number if available>
   - Time taken: <duration>

8. MOVE the Linear issue to "Done"
```

## Git Conventions

- **Branch naming**: `feature/<ISSUE-ID>-<short-description>`
  - Example: `feature/AIP-30-init-nextjs`
  - Example: `feature/AIP-34-auth-flow`
- **Commit messages**: Conventional commits
  - `feat:` — New feature
  - `fix:` — Bug fix
  - `chore:` — Maintenance, config, dependencies
  - `docs:` — Documentation only
  - Always include the issue ID: `feat(auth): implement login page [AIP-34]`
- **Main branch**: `main` (always deployable)
- **Never force push** to main

## Code Conventions

- **Language**: All code, comments, commit messages, and branch names in English
- **UI text**: Spanish (this is for Latin American clients)
  - Stage names: Presentado, A Entrevistar, Aprobado, Rechazado
  - Labels and buttons in Spanish where user-facing
- **File structure**: Follow Next.js App Router conventions
  - `app/` — Pages and layouts
  - `components/` — Reusable UI components
  - `convex/` — Backend functions and schema
  - `lib/` — Utilities, auth, Supabase clients
  - `public/` — Static assets
- **Imports**: Use `@/*` alias (e.g., `@/components/ui/button`)
- **Types**: Strict TypeScript, no `any` unless absolutely necessary
- **Components**: Functional components with hooks, default exports for pages

## Architecture Rules

1. **Convex is the single source of truth** for all data and business logic
2. **Supabase is ONLY for auth and file storage** — no data queries to Supabase
3. **All data access goes through Convex** queries and mutations
4. **Organization isolation**: Every query that returns data must filter by `orgId` for client users
5. **Realtime**: Use Convex subscriptions (useQuery) — data updates automatically, no polling
6. **File uploads**: Go to Supabase Storage, URL stored in Convex
7. **Activity log is immutable**: Only create, never update or delete

## Key Data Model

```
organizations (clients with branding)
  └── users (admin or client role)
  └── positions (open/closed)
       └── candidatePositions (junction: stage, per-position)
            ├── comments (scoped to candidatePosition)
            └── activityLog (immutable history)

candidates (global pool, shared across orgs)
  └── candidateFiles (uploaded documents)
```

**Stages**: presentado → a_entrevistar → aprobado → rechazado

**Stage colors** (always fixed, never change with client branding):
- Presentado: #3B82F6 (blue)
- A Entrevistar: #F59E0B (amber)
- Aprobado: #10B981 (green)
- Rechazado: #EF4444 (red)

## Security Rules

- Client users can ONLY see data from their own organization
- Client users can ONLY see open positions (closed positions are hidden)
- Client users CANNOT see the Manatal URL field
- Client users CANNOT see which other positions/orgs a candidate is assigned to
- Comments are collaborative within the same org, invisible across orgs
- Admin can see everything

## Design Principles

- Minimalist, professional, clean — aligned with nimble.la aesthetic
- Dark sidebar (gray-900) + light content area
- Client branding via CSS variable `--client-primary` (injected dynamically)
- Stage colors are always fixed regardless of client branding
- Mobile-responsive (sidebar → hamburger menu)
- Max 3 clicks for any primary action
- shadcn/ui components throughout — consistent look and feel

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Convex
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOY_KEY=
```

## Quick Reference Commands

```bash
# Development
npm run dev          # Start Next.js dev server
npx convex dev      # Start Convex dev server (run in separate terminal)

# Quality checks
npm run lint         # ESLint
npx tsc --noEmit    # TypeScript type checking
npm run build        # Full production build

# Convex
npx convex deploy    # Deploy schema + functions to production
npx convex run scripts/seed  # Run seed data (Phase 5)
```

## When Starting a New Session

1. Read this file (automatic)
2. Check `BUILD.md` for the current phase and task details
3. Check Linear for which issues are in Backlog (next to work on)
4. Pick the next issue in order and follow the workflow above
5. Ask for confirmation before starting each new issue if instructed to do so
