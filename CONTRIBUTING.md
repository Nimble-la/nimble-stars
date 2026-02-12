# Contributing to Nimble S.T.A.R.S

## Branch Naming

All feature branches follow this pattern:

```
feature/<ISSUE-ID>-<short-description>
```

Examples:
- `feature/AIP-30-init-nextjs`
- `feature/AIP-34-auth-flow`
- `feature/AIP-45-kanban-board`

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/) with the Linear issue ID:

```
<type>(<scope>): <description> [<ISSUE-ID>]
```

**Types:**
- `feat:` — New feature
- `fix:` — Bug fix
- `chore:` — Maintenance, config, dependencies
- `docs:` — Documentation only

**Examples:**
```
feat(auth): implement login page [AIP-34]
fix(pipeline): correct drag-and-drop stage ordering [AIP-47]
chore(deps): update shadcn/ui components [AIP-36]
docs(readme): add deployment instructions [AIP-62]
```

## Development Workflow

### Per-Task Workflow

For every Linear issue:

1. **Move** the Linear issue to "In Progress"
2. **Branch** from main:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/<ISSUE-ID>-<short-description>
   ```
3. **Implement** the task as described in the Linear issue
4. **Verify** quality:
   ```bash
   npm run lint
   npx tsc --noEmit
   npm run build
   ```
5. **Commit** with conventional commit message
6. **Merge** to main:
   ```bash
   git checkout main
   git merge feature/<ISSUE-ID>-<short-description>
   git push origin main
   ```
7. **Comment** on the Linear issue with a summary
8. **Move** the Linear issue to "Done"

### Quality Standards

- All code must pass `npm run lint` (ESLint)
- All code must pass `npx tsc --noEmit` (TypeScript strict mode)
- All code must pass `npm run build` (production build)
- Never force push to `main`

## Code Conventions

- **Language**: All code, comments, commit messages, and branch names in English
- **TypeScript**: Strict mode, no `any` unless absolutely necessary
- **Components**: Functional components with hooks, default exports for pages
- **Imports**: Use `@/*` path alias (e.g., `@/components/ui/button`)
- **Styling**: Tailwind CSS utility classes, shadcn/ui components

## Architecture Rules

1. **Convex** is the single source of truth for all data
2. **Supabase** is only for auth and file storage
3. Every client-facing query must filter by `orgId`
4. Activity log entries are immutable (create-only)
5. Use Convex `useQuery` for realtime data — no polling

## Linear Integration

- **Team**: AI Process Optimization
- **Project**: Nimble Stars Project
- **Statuses**: Backlog → In Progress → Done

## Claude Code Workflow

This project was built using Claude Code. The `CLAUDE.md` file at the project root provides all context needed for Claude Code sessions. When starting a new session:

1. Claude Code reads `CLAUDE.md` automatically
2. Check Linear for the next Backlog issue
3. Follow the per-task workflow above
4. Comment results on the Linear issue when done
