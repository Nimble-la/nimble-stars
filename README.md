# Nimble S.T.A.R.S

**Sourcing Talent And Recruiting Solutions**

A white-label platform for [Nimble](https://nimble.la) to share candidate profiles with clients. Clients can review candidates, leave feedback, move them through a hiring pipeline, and collaborate with their team — all within a branded portal.

## Tech Stack

- **Framework**: Next.js 14+ (App Router) + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Convex (database + server functions + realtime)
- **Auth**: Supabase Auth (email/password)
- **Storage**: Supabase Storage (candidate files, org logos)
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Convex](https://convex.dev) project

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Enable **Email/Password** authentication in Authentication > Providers
3. Create two storage buckets in Storage:
   - `files` — for candidate files (resumes, documents). Allow any file type, no size limit.
   - `logos` — for organization logos
4. Copy your project URL and keys from Settings > API

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
3. Configure the following environment variables in Vercel's project settings:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_CONVEX_URL` | Convex production deployment URL |
| `CONVEX_DEPLOY_KEY` | Convex deploy key (for CI/CD) |

4. Deploy — Vercel will auto-detect Next.js and configure the build

### Convex Production Deployment

Before deploying to Vercel, deploy your Convex schema and functions:

```bash
npx convex deploy
```

### Verification Checklist

After deployment, verify:

- [ ] `/login` page loads correctly
- [ ] Authentication works with valid credentials
- [ ] Admin users redirect to `/admin` after login
- [ ] Client users redirect to `/positions` after login
- [ ] Sidebar navigation renders correctly
- [ ] Mobile responsive layout works
