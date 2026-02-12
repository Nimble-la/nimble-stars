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

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Convex
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOY_KEY=
```
