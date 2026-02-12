# Nimble S.T.A.R.S

**Sourcing Talent And Recruiting Solutions**

A white-label platform for [Nimble](https://nimble.la) to share candidate profiles with clients. Clients can review candidates, leave feedback, move them through a hiring pipeline, and collaborate with their team — all within a branded portal.

## Features

- **Admin Dashboard** — Manage clients, candidates, positions, and pipeline assignments
- **Client Portal** — Branded experience for each client org with their logo and colors
- **Kanban Pipeline** — Drag-and-drop candidate pipeline with stages (Submitted, Interview, Approved, Rejected)
- **Candidate Profiles** — Full profiles with files, comments, and activity history
- **Realtime Updates** — All data syncs in real time via Convex subscriptions
- **In-App Notifications** — Admins get notified when clients change stages or leave comments
- **Organization Isolation** — Client users only see their own org's data
- **Responsive Design** — Works on desktop, tablet, and mobile

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) + TypeScript |
| UI | shadcn/ui + Tailwind CSS |
| Backend | Convex (database + server functions + realtime) |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage (candidate files, org logos) |
| Hosting | Vercel |
| Font | Inter (Google Fonts) |
| DnD | @hello-pangea/dnd (Kanban drag & drop) |

## Project Structure

```
nimble-stars/
├── convex/                    # Backend (Convex)
│   ├── _generated/            # Auto-generated types
│   ├── schema.ts              # Database schema
│   ├── organizations.ts       # Org queries/mutations
│   ├── users.ts               # User queries/mutations
│   ├── positions.ts           # Position queries/mutations
│   ├── candidates.ts          # Candidate queries/mutations (paginated)
│   ├── candidatePositions.ts  # Pipeline junction queries/mutations
│   ├── candidateFiles.ts      # File metadata queries/mutations
│   ├── comments.ts            # Comment queries/mutations
│   ├── activityLog.ts         # Immutable activity log queries
│   ├── notifications.ts       # Notification queries/mutations
│   └── seed.ts                # Seed data script
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── (dashboard)/       # Authenticated layout group
│   │   │   ├── (client)/      # Client portal routes
│   │   │   │   ├── positions/ # Client positions + pipeline + candidate profiles
│   │   │   │   └── layout.tsx # Client branding injection
│   │   │   ├── admin/         # Admin routes
│   │   │   │   ├── clients/   # Client org management
│   │   │   │   ├── candidates/# Candidate bank
│   │   │   │   └── positions/ # Position pipeline management
│   │   │   └── layout.tsx     # Dashboard shell (sidebar + header)
│   │   ├── login/             # Login page
│   │   ├── error.tsx          # Error boundary
│   │   ├── not-found.tsx      # 404 page
│   │   └── layout.tsx         # Root layout (providers)
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/            # Sidebar, Header
│   │   ├── pipeline/          # KanbanBoard, KanbanColumn, StageBadge
│   │   ├── candidates/        # CandidateTable
│   │   ├── comments/          # CommentList, CommentForm
│   │   ├── activity/          # ActivityTimeline
│   │   ├── notifications/     # NotificationBell
│   │   └── admin/             # PositionManagement
│   └── lib/
│       ├── auth/              # AuthContext, middleware
│       ├── supabase/          # Supabase client + storage helpers
│       └── utils.ts           # Utility functions
├── public/                    # Static assets
├── CLAUDE.md                  # Claude Code project context
├── BUILD.md                   # Construction guide
├── PRD.md                     # Product requirements
└── CONTRIBUTING.md            # Contribution guidelines
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Convex](https://convex.dev) project

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Enable **Email/Password** authentication in Authentication > Providers
3. Create two storage buckets in Storage:
   - `files` — for candidate files (resumes, documents)
   - `logos` — for organization logos
4. Set both buckets to **public** (or configure appropriate RLS policies)
5. Copy your project URL and keys from Settings > API

### Convex Setup

1. Create a new project at [convex.dev](https://convex.dev)
2. Copy your deployment URL from the project settings

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL |
| `CONVEX_DEPLOY_KEY` | Convex deploy key (for CI/CD, production only) |

### Development

```bash
# Install dependencies
npm install

# Start Convex dev server (in a separate terminal)
npx convex dev

# Start Next.js dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Seed Data

To populate the database with sample data for testing:

```bash
npx convex run seed:run
```

This creates:
- 3 organizations with distinct branding
- 6 users (1 admin + 5 client users)
- 7 positions across all orgs
- 10 candidates with realistic profiles
- 12 pipeline assignments across all stages
- 8 comments and 13 activity log entries

The seed script is idempotent — it will refuse to run if data already exists.

### Quality Checks

```bash
npm run lint         # ESLint
npx tsc --noEmit    # TypeScript type checking
npm run build        # Full production build
```

## Deployment (Vercel)

### Initial Setup

1. Push your repository to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Configure the environment variables listed above in Vercel's project settings
4. Deploy — Vercel will auto-detect Next.js and configure the build

### Convex Production Deployment

Before the first Vercel deploy, deploy your Convex schema and functions:

```bash
npx convex deploy
```

### Verification Checklist

After deployment, verify:

- [ ] `/login` page loads correctly
- [ ] Authentication works with valid credentials
- [ ] Admin users redirect to `/admin` after login
- [ ] Client users redirect to `/positions` after login
- [ ] Admin can create clients, candidates, and positions
- [ ] Admin pipeline view works (kanban drag & drop + list view)
- [ ] Client portal shows correct branding (logo + colors)
- [ ] Client sees only open positions from their org
- [ ] Client can view candidate profiles and leave comments
- [ ] Client can change candidate stages
- [ ] Admin receives notifications for client actions
- [ ] Activity log records all changes
- [ ] Mobile responsive layout works on all pages
- [ ] Cross-client data isolation is enforced
- [ ] Empty states and loading skeletons display correctly
- [ ] Error pages (404, error boundary) work
- [ ] No console errors in production

## Architecture

- **Convex** is the single source of truth for all data and business logic
- **Supabase** is used only for auth and file storage — no data queries to Supabase
- All data access goes through Convex queries and mutations
- Organization isolation: every client-facing query filters by `orgId`
- Realtime: Convex subscriptions (`useQuery`) keep data in sync automatically
- Activity log is immutable: create-only, never update or delete

## Data Model

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

**Pipeline Stages**: Submitted → Interview → Approved → Rejected

## License

Private — Nimble (nimble.la)
