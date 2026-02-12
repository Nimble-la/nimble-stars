# Nimble S.T.A.R.S — Build Document

> Construction guide for AI-assisted development with Claude Code
>
> Version: 1.0
> Date: 2025-02-11
> Source: PRD v0.5

---

## Overview

This document defines the complete build plan for Nimble S.T.A.R.S, organized into deployable phases. Each phase results in a testable increment. Each task maps to a Linear issue with detailed instructions for Claude Code execution.

### Tech Stack

- **Framework**: Next.js 14+ (App Router) + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Convex (database + server functions + realtime)
- **Auth**: Supabase Auth (email/password)
- **Storage**: Supabase Storage (files, logos)
- **Hosting**: Vercel
- **Font**: Inter (Google Fonts)

### Conventions

- **Language**: All code, comments, commit messages, and branch names in English
- **Branch naming**: `feature/<linear-issue-id>-<short-description>` (e.g., `feature/NIM-12-setup-nextjs`)
- **Commits**: Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)
- **File structure**: Follow Next.js App Router conventions (`app/`, `components/`, `lib/`, `convex/`)

### Claude Code Workflow Per Task

For every Linear issue, Claude Code must follow this workflow:

```
1. Move the Linear issue to "In Progress"
2. Create a new git branch: feature/<issue-id>-<short-description>
3. Execute the task as described in the issue
4. Run linting and type-checking (npm run lint && npx tsc --noEmit)
5. Commit with conventional commit message referencing the issue
6. Add a comment on the Linear issue with:
   - What was done (summary)
   - How it was done (approach/decisions)
   - Any issues encountered
   - Tokens used (if available)
   - Time taken
7. Merge branch into main
8. Move the Linear issue to "Done"
```

---

## Phase 1: Project Foundation

**Goal**: Set up the project skeleton with Next.js, Convex, Supabase, Tailwind, and shadcn/ui. Deploy a "Hello World" to Vercel. Testable: the app loads at a URL.

### Task 1.1: Initialize Next.js Project

Create a new Next.js 14+ project with TypeScript and App Router.

```
- npx create-next-app@latest nimble-stars --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
- Verify the project runs locally (npm run dev)
- Initialize git repository
- Create .gitignore (include .env.local, node_modules, .next, .convex)
- Create initial README.md with project name and description
```

### Task 1.2: Configure Tailwind + shadcn/ui

Set up the design system foundation.

```
- Install and initialize shadcn/ui (npx shadcn-ui@latest init)
- Configure Tailwind with custom theme extending default:
  - Colors: nimble brand palette (see Design System below)
  - Font: Inter via next/font/google
  - CSS variables for client theming (--client-primary, etc.)
- Install base shadcn components: Button, Card, Input, Badge, Table, Dialog, Sheet, Tabs, Avatar, Textarea, Select, DropdownMenu, Tooltip, Separator, ScrollArea
- Create a globals.css with CSS variable definitions
- Create a test page at /design-system showing all installed components (for visual verification)
```

Design system variables to include:
```css
:root {
  --nimble-black: #0A0A0A;
  --nimble-white: #FAFAFA;
  --nimble-gray-50: #F9FAFB;
  --nimble-gray-100: #F3F4F6;
  --nimble-gray-200: #E5E7EB;
  --nimble-gray-400: #9CA3AF;
  --nimble-gray-600: #4B5563;
  --nimble-gray-900: #111827;
  --stage-presentado: #3B82F6;
  --stage-entrevistar: #F59E0B;
  --stage-aprobado: #10B981;
  --stage-rechazado: #EF4444;
  --client-primary: #3B82F6;
  --client-primary-hover: #2563EB;
  --client-primary-light: rgba(59, 130, 246, 0.1);
}
```

### Task 1.3: Set Up Convex

Initialize Convex as the backend.

```
- npm install convex
- npx convex init
- Create convex/ directory with initial schema (schema.ts) defining all tables:
  - organizations: { name, logoUrl?, primaryColor?, createdAt }
  - users: { email, name, role (admin | client), orgId?, supabaseUserId, createdAt }
  - positions: { title, description?, status (open | closed), orgId, createdAt }
  - candidates: { fullName, email?, phone?, currentRole?, currentCompany?, summary?, manatalUrl?, createdAt, updatedAt }
  - candidateFiles: { candidateId, fileUrl, fileName, fileType, uploadedAt }
  - candidatePositions: { candidateId, positionId, stage (presentado | a_entrevistar | aprobado | rechazado), createdAt, updatedAt, lastInteractionAt }
  - comments: { body, userId, candidatePositionId, createdAt }
  - activityLog: { action, fromStage?, toStage?, userId, userName, candidatePositionId, createdAt }
- Create convex/convex.config.ts if needed
- Verify Convex dev server starts (npx convex dev)
```

### Task 1.4: Set Up Supabase (Auth + Storage)

Configure Supabase for authentication and file storage.

```
- Install @supabase/supabase-js and @supabase/auth-helpers-nextjs
- Create lib/supabase/client.ts (browser client)
- Create lib/supabase/server.ts (server client)
- Set up environment variables in .env.local:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
- Create Supabase storage buckets (via Supabase dashboard or migration):
  - "files" bucket (for candidate files — any type, no size limit)
  - "logos" bucket (for organization logos)
- Create lib/supabase/storage.ts with helper functions:
  - uploadFile(bucket, path, file) → url
  - getSignedUrl(bucket, path) → signed url
  - deleteFile(bucket, path)
- Document the required Supabase project setup in README.md
```

### Task 1.5: Set Up Authentication Flow

Implement login with email/password via Supabase Auth, integrated with Convex user records.

```
- Create app/(auth)/login/page.tsx — Login page with:
  - Nimble logo centered
  - Email + password fields (shadcn Input)
  - Login button (shadcn Button)
  - Error handling (invalid credentials)
  - Minimal, clean design matching nimble.la aesthetic
- Create lib/auth/auth-context.tsx — AuthProvider with:
  - Supabase session management
  - Current user state (from Convex users table, matched by supabaseUserId)
  - Role (admin | client) and orgId
  - Loading state
- Create middleware.ts — Next.js middleware for:
  - Redirect unauthenticated users to /login
  - Redirect admin users to /admin
  - Redirect client users to /positions
  - Protect /admin routes from client users
- Create convex/users.ts with queries:
  - getUserBySupabaseId(supabaseUserId) → user record with org data
- Test: login with a manually created Supabase user → redirects correctly based on role
```

### Task 1.6: Create Layout Shell

Build the main layout with sidebar navigation.

```
- Create app/(dashboard)/layout.tsx — Main dashboard layout with:
  - Sidebar component (left side, collapsible)
  - Main content area (right side, full width)
  - Responsive: sidebar becomes hamburger menu on mobile
- Create components/layout/sidebar.tsx:
  - Logo area at top (Nimble logo for admin, client logo for client users)
  - Navigation links (different per role)
  - User info at bottom (name, avatar with initials, logout button)
  - Dark sidebar (bg-gray-900) with light text
- Create components/layout/header.tsx:
  - Breadcrumb or page title
  - Optional actions area (right side)
- Admin navigation items: Dashboard, Clients, Candidates
- Client navigation items: Positions
- Create app/(dashboard)/admin/layout.tsx — Admin-specific layout wrapper
- Create app/(dashboard)/(client)/layout.tsx — Client-specific layout with dynamic theming:
  - Read org primaryColor and logoUrl
  - Inject --client-primary CSS variable
  - Show client logo in sidebar
```

### Task 1.7: Deploy to Vercel

First deployment — "Hello World" with auth.

```
- Connect repository to Vercel
- Configure environment variables in Vercel:
  - All Supabase vars
  - All Convex vars (NEXT_PUBLIC_CONVEX_URL, CONVEX_DEPLOY_KEY)
- Deploy and verify:
  - /login page loads
  - Authentication works
  - Redirect to dashboard works
  - Layout renders correctly
- Document deploy process in README.md
```

---

## Phase 2: Admin Panel — Client & Position Management

**Goal**: Admin can create clients with branding, manage users, and create positions. Testable: admin logs in, creates a client with logo/color, adds users and positions.

### Task 2.1: Admin Dashboard Page

```
- Create app/(dashboard)/admin/page.tsx
- Show summary cards:
  - Total active clients (organizations)
  - Total open positions
  - Total candidates in pipeline
  - Recent activity feed (last 10 activity log entries across all orgs)
- Use shadcn Card components
- Data comes from Convex queries:
  - convex/organizations.ts: countActive()
  - convex/positions.ts: countOpen()
  - convex/candidates.ts: countAll()
  - convex/activityLog.ts: getRecent(limit: 10)
```

### Task 2.2: Client (Organization) Management — List & Create

```
- Create app/(dashboard)/admin/clients/page.tsx — Client list:
  - Table with columns: logo (small), name, primary color (swatch), positions count, users count, created date
  - "New Client" button → navigates to create page
  - Click row → navigates to client detail
- Create app/(dashboard)/admin/clients/new/page.tsx — Create client form:
  - Name (required, text input)
  - Logo (file upload → Supabase Storage "logos" bucket)
  - Primary color (color picker input, hex value)
  - Save button → creates organization in Convex + redirects to client detail
- Convex mutations:
  - convex/organizations.ts: create({ name, logoUrl?, primaryColor? })
  - convex/organizations.ts: list() → all organizations with counts
```

### Task 2.3: Client Detail & Edit

```
- Create app/(dashboard)/admin/clients/[id]/page.tsx — Client detail:
  - Client info header (logo, name, color swatch, edit button)
  - Tabs: Positions | Users
  - Positions tab: list of positions (open/closed) with status badge
  - Users tab: list of users with email, name
  - Quick actions: Add Position, Add User
- Edit functionality (inline or modal):
  - Edit name, upload new logo, change primary color
- Convex mutations:
  - convex/organizations.ts: update(id, { name?, logoUrl?, primaryColor? })
  - convex/organizations.ts: getById(id) → org with positions and users
```

### Task 2.4: User Management for Clients

```
- Create app/(dashboard)/admin/clients/[id]/users/page.tsx (or section within client detail):
  - List of users for this organization
  - "Add User" button opens dialog/sheet with:
    - Name (required)
    - Email (required)
    - Password (required, for initial creation)
  - Creating a user:
    1. Create Supabase Auth user (email + password) via admin API
    2. Create Convex user record with role: "client", orgId: this org's id, supabaseUserId
  - Edit user: change name (email change not in v1)
  - Disable/enable user (don't delete, just deactivate)
- Convex mutations:
  - convex/users.ts: createClientUser({ email, name, orgId, supabaseUserId })
  - convex/users.ts: listByOrg(orgId)
  - convex/users.ts: update(id, { name?, isActive? })
```

### Task 2.5: Position Management

```
- Create position from client detail page:
  - "Add Position" button → dialog with:
    - Title (required)
    - Description (optional, textarea)
  - Creates position linked to this organization
- Position list within client detail shows:
  - Title, status (open/closed badge), candidate count, created date
  - Toggle to open/close position (dropdown or button)
- Convex mutations:
  - convex/positions.ts: create({ title, description?, orgId })
  - convex/positions.ts: listByOrg(orgId)
  - convex/positions.ts: updateStatus(id, status)
  - convex/positions.ts: update(id, { title?, description? })
```

### Task 2.6: Deploy Phase 2

```
- Merge all Phase 2 branches into main
- Deploy to Vercel
- Test end-to-end:
  - Admin logs in
  - Creates a client with logo and color
  - Adds users to the client
  - Creates positions for the client
  - Opens and closes positions
  - Dashboard shows correct counts
```

---

## Phase 3: Admin Panel — Candidate Management

**Goal**: Admin can create candidates in a global pool, upload files, and assign candidates to positions. Testable: admin creates candidates, uploads CVs, assigns them to positions across different clients.

### Task 3.1: Candidate Bank — List Page

```
- Create app/(dashboard)/admin/candidates/page.tsx:
  - Table with columns: name, current role, current company, positions count, created date
  - Search bar (filter by name, role, company)
  - "New Candidate" button
  - Click row → navigate to candidate detail
- Convex queries:
  - convex/candidates.ts: list({ search? }) → candidates with position count
```

### Task 3.2: Create Candidate

```
- Create app/(dashboard)/admin/candidates/new/page.tsx:
  - Form fields:
    - Full name (required)
    - Email (optional)
    - Phone (optional)
    - Current role (optional)
    - Current company (optional)
    - Summary (optional, textarea)
    - Manatal URL (optional, URL input — admin only field)
    - Files upload (multiple, any type, any size → Supabase Storage "files" bucket)
  - Save → creates candidate in Convex + uploads files to Supabase Storage
  - Redirect to candidate detail page
- Convex mutations:
  - convex/candidates.ts: create({ fullName, email?, phone?, currentRole?, currentCompany?, summary?, manatalUrl? })
  - convex/candidateFiles.ts: create({ candidateId, fileUrl, fileName, fileType })
- Supabase storage:
  - Upload to files/<candidateId>/<filename>
  - Store signed URL in Convex
```

### Task 3.3: Candidate Detail Page (Admin View)

```
- Create app/(dashboard)/admin/candidates/[id]/page.tsx:
  - Header: name, current role @ company, Manatal link (opens in new tab)
  - Summary section
  - Files section: list of uploaded files with download links
  - "Upload More Files" button
  - Assigned Positions section:
    - Table: position title, client name, current stage (colored badge), last interaction
    - "Assign to Position" button → dialog to select client + position
  - Edit candidate button → edit form (same fields as create)
- Convex queries:
  - convex/candidates.ts: getById(id) → candidate with files and positions
  - convex/candidatePositions.ts: listByCandidate(candidateId) → positions with org info and stage
```

### Task 3.4: Assign Candidate to Position

```
- Dialog/sheet component triggered from candidate detail:
  - Step 1: Select client (dropdown of organizations)
  - Step 2: Select position (dropdown of open positions for selected client)
  - Step 3: Confirm → creates CandidatePosition with stage "presentado"
  - Also creates an activity log entry: "Admin assigned [candidate] to this position"
- Validation: prevent duplicate assignment (same candidate + same position)
- Convex mutations:
  - convex/candidatePositions.ts: assign({ candidateId, positionId })
  - convex/activityLog.ts: create({ action: "assigned", userId, userName, candidatePositionId })
```

### Task 3.5: Admin Position Pipeline View

```
- Create app/(dashboard)/admin/positions/[id]/page.tsx:
  - Position header: title, client name, status badge, description
  - Two views (toggle): Kanban | List
  - Kanban view:
    - 4 columns: Presentado | A Entrevistar | Aprobado | Rechazado
    - Candidate cards with: initials avatar, name, current role, comment count, last interaction
    - Drag & drop to change stage (updates candidatePosition + creates activity log)
    - Click card → navigate to candidate profile in position context
  - List view:
    - Table: name, stage (badge), date added, last interaction
    - Sortable by date added and last interaction
    - Filterable by stage
  - Activity feed sidebar or section: recent activity for this position
- Convex queries:
  - convex/candidatePositions.ts: listByPosition(positionId) → candidates with stage and activity
  - convex/activityLog.ts: listByPosition(positionId)
- Convex mutations:
  - convex/candidatePositions.ts: updateStage(id, { stage, userId, userName })
  - This mutation should also: update lastInteractionAt, create activity log entry
```

### Task 3.6: Deploy Phase 3

```
- Merge all Phase 3 branches into main
- Deploy to Vercel
- Test end-to-end:
  - Admin creates candidates with files
  - Admin assigns candidates to positions in different clients
  - Admin views pipeline (kanban + list) for a position
  - Drag & drop changes stage and creates activity log
  - Candidate detail shows all assigned positions
  - Manatal links are visible and functional
```

---

## Phase 4: Client Portal

**Goal**: Clients can log in, see their branded portal, browse positions, review candidates, leave comments, change stages, and see activity history. Testable: a client user logs in, sees their branding, interacts with candidates.

### Task 4.1: Client Positions List

```
- Create app/(dashboard)/(client)/positions/page.tsx:
  - List of open positions for the logged-in user's organization
  - Each position card shows: title, candidate count, breakdown by stage (mini badges)
  - Click → navigate to position pipeline
  - Only positions with status "open" are shown
  - Client branding applied (logo in sidebar, primary color on accents)
- Convex queries:
  - convex/positions.ts: listOpenByOrg(orgId) → positions with candidate counts per stage
```

### Task 4.2: Client Pipeline View (Kanban + List)

```
- Create app/(dashboard)/(client)/positions/[id]/page.tsx:
  - Position title header
  - View toggle: Kanban (default) | List
  - Kanban view:
    - 4 columns: Presentado | A Entrevistar | Aprobado | Rechazado
    - Column colors: blue, amber, green, red
    - Candidate cards: initials avatar, name, current role, comment count, last interaction timestamp
    - Drag & drop to move between stages
    - On drop: update stage + create activity log + update lastInteractionAt
    - Click card → navigate to candidate profile
  - List view:
    - Table: name, current role, stage (colored badge), date added, last interaction
    - Filter by stage (dropdown or tabs at top)
    - Sort by: date added (default, newest first) or last interaction
    - Click row → navigate to candidate profile
- Convex queries:
  - convex/candidatePositions.ts: listByPositionForClient(positionId, orgId) → only if position belongs to org and is open
- Convex mutations:
  - convex/candidatePositions.ts: updateStage(id, { stage, userId, userName }) — same mutation as admin, with permission check
```

### Task 4.3: Client Candidate Profile

```
- Create app/(dashboard)/(client)/positions/[id]/candidates/[cid]/page.tsx:
  - Candidate header: initials avatar (large), full name, current role @ company
  - Contact info: email, phone (with copy-to-clipboard)
  - Summary section
  - Files section: list of files with download buttons
  - Current stage: prominent badge + dropdown to change stage
  - Stage change → creates activity log entry
  - NO Manatal link (hidden from client)
  - Two tabs or sections below:
    - Comments
    - Activity History
```

### Task 4.4: Comments System

```
- Comments component (reusable, used in candidate profile):
  - List of existing comments, newest first
  - Each comment shows: user name, initials avatar, comment body, relative timestamp
  - "Add comment" textarea at top with submit button
  - Comments are scoped to CandidatePosition (same candidate in different positions has separate comments)
  - All users in the same organization see all comments (collaborative)
  - Admin sees all comments for any org
- On new comment:
  - Create comment record
  - Create activity log entry ("X left a comment")
  - Update lastInteractionAt on CandidatePosition
- Convex mutations:
  - convex/comments.ts: create({ body, userId, candidatePositionId })
  - convex/comments.ts: listByCandidatePosition(candidatePositionId)
```

### Task 4.5: Activity History Component

```
- Activity history component (reusable, used in candidate profile):
  - Timeline of all activity for this CandidatePosition
  - Entry types:
    - Stage change: "🔄 [User] moved [Candidate] from [Stage A] to [Stage B] — [timestamp]"
    - Comment: "💬 [User] left a comment — [timestamp]"
    - Assignment: "📋 [Admin] assigned [Candidate] to this position — [timestamp]"
  - Ordered newest first
  - Timestamps as relative ("2 hours ago") with absolute on hover tooltip
  - Immutable — no edit/delete
- Convex queries:
  - convex/activityLog.ts: listByCandidatePosition(candidatePositionId)
```

### Task 4.6: Client Branding Integration

```
- Ensure dynamic theming works end-to-end:
  - On client login, fetch organization data (primaryColor, logoUrl)
  - Inject --client-primary CSS variable into the client layout
  - Sidebar shows client logo (fallback to Nimble logo if not set)
  - Buttons, links, focus rings, and badges use --client-primary
  - Stage colors remain fixed (blue, amber, green, red) regardless of client branding
- Test with at least 2 different client orgs with different colors and logos
```

### Task 4.7: Deploy Phase 4

```
- Merge all Phase 4 branches into main
- Deploy to Vercel
- Test end-to-end:
  - Client logs in → sees their branding
  - Client browses open positions
  - Client views kanban and list views
  - Client drags candidate to new stage → activity log updates
  - Client opens candidate profile → sees all data, files, comments
  - Client leaves a comment → visible to other users in same org
  - Activity history shows complete timeline
  - A different client logs in → sees only their data, different branding
  - Admin can see all activity from both clients
```

---

## Phase 5: Notifications & Polish

**Goal**: Admin gets notified of client actions. UI/UX polish, edge cases, error handling. Testable: full end-to-end workflow with multiple clients, notifications, and polished UI.

### Task 5.1: In-App Notifications for Admin

```
- Create convex/notifications.ts:
  - Schema: { type, message, isRead, userId (admin), relatedCandidatePositionId?, createdAt }
  - Types: "stage_change", "new_comment"
  - Auto-created when:
    - A client user changes a candidate's stage
    - A client user leaves a comment
  - Query: listUnread(userId) → unread notifications
  - Mutation: markAsRead(id), markAllAsRead(userId)
- Create components/notifications/notification-bell.tsx:
  - Bell icon in header/sidebar with unread count badge
  - Click → dropdown with recent notifications
  - Each notification: message, timestamp, link to relevant candidate profile
  - "Mark all as read" action
  - Uses Convex realtime subscription (updates live)
```

### Task 5.2: Empty States & Loading States

```
- Add proper empty states for:
  - No clients yet (admin)
  - No positions yet (admin client detail / client portal)
  - No candidates in a position
  - No comments on a candidate
  - No activity log entries
  - No files uploaded for a candidate
- Each empty state: friendly illustration or icon + helpful message + CTA where applicable
- Add loading skeletons (shadcn Skeleton) for:
  - Tables
  - Kanban columns
  - Candidate profile sections
  - Cards
```

### Task 5.3: Error Handling & Edge Cases

```
- Handle and test edge cases:
  - User tries to access a position that belongs to another org → 404 or redirect
  - User tries to access a closed position (client) → 404 or redirect to positions
  - Admin closes a position while client is viewing it → realtime update, show message
  - Duplicate candidate assignment prevention (same candidate + same position)
  - File upload failure → error message, retry option
  - Network error during stage change → optimistic UI with rollback
  - Session expiry → redirect to login with message
- Create app/not-found.tsx — Custom 404 page
- Create app/error.tsx — Custom error boundary
- Add toast notifications (shadcn Toast) for:
  - Successful actions (stage change, comment added, candidate created, etc.)
  - Error messages
```

### Task 5.4: Responsive Design Polish

```
- Test and fix all pages on mobile viewports (375px, 390px, 414px):
  - Login page: centered, full width form
  - Sidebar: collapses to hamburger menu or bottom navigation
  - Kanban: horizontal scroll on mobile, or switch to stacked cards
  - Tables: horizontal scroll or card-based layout on mobile
  - Candidate profile: stacked sections
  - Dialogs/sheets: full screen on mobile
- Test on tablet (768px, 1024px):
  - Sidebar: collapsible
  - Kanban: fits all 4 columns or scrolls gracefully
```

### Task 5.5: Performance Optimization

```
- Review and optimize:
  - Convex queries: ensure proper indexes on frequently queried fields (orgId, positionId, candidateId, stage)
  - Add Convex indexes in schema.ts for:
    - positions by orgId
    - candidatePositions by positionId
    - candidatePositions by candidateId
    - comments by candidatePositionId
    - activityLog by candidatePositionId
    - users by orgId
    - users by supabaseUserId
  - Image optimization: use next/image for logos
  - Lazy load file previews
  - Pagination for large lists (candidates bank, activity log)
- Target: page load < 2 seconds on 3G connection
```

### Task 5.6: Seed Data Script

```
- Create scripts/seed.ts:
  - Creates 2-3 sample organizations with different colors/logos
  - Creates admin user and client users for each org
  - Creates positions for each org
  - Creates candidates with sample data
  - Assigns candidates to positions with various stages
  - Creates sample comments and activity log entries
- Purpose: easy demo and testing setup
- Run with: npx convex run scripts/seed
```

### Task 5.7: Final Deploy & Documentation

```
- Final deploy to Vercel
- Update README.md with:
  - Project overview
  - Tech stack
  - Local development setup instructions
  - Environment variables required
  - Deployment instructions
  - Seed data instructions
- Create CONTRIBUTING.md with:
  - Branch naming conventions
  - Commit conventions
  - Claude Code workflow reference
- Full end-to-end test checklist:
  - [ ] Admin login and dashboard
  - [ ] Create client with branding
  - [ ] Create client users
  - [ ] Create positions
  - [ ] Create candidates with files
  - [ ] Assign candidates to positions
  - [ ] Admin pipeline view (kanban + list)
  - [ ] Client login with branding
  - [ ] Client positions list
  - [ ] Client pipeline view (kanban + list + filter + sort)
  - [ ] Client candidate profile
  - [ ] Client comments
  - [ ] Client stage changes
  - [ ] Activity log visibility
  - [ ] Admin notifications
  - [ ] Mobile responsiveness
  - [ ] Cross-client isolation
  - [ ] Position open/close visibility
```

---

## Appendix A: Convex Schema Reference

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  organizations: defineTable({
    name: v.string(),
    logoUrl: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    createdAt: v.number(),
  }),

  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("client")),
    orgId: v.optional(v.id("organizations")),
    supabaseUserId: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_supabase_id", ["supabaseUserId"]),

  positions: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("open"), v.literal("closed")),
    orgId: v.id("organizations"),
    createdAt: v.number(),
  })
    .index("by_org", ["orgId"]),

  candidates: defineTable({
    fullName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    currentRole: v.optional(v.string()),
    currentCompany: v.optional(v.string()),
    summary: v.optional(v.string()),
    manatalUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  candidateFiles: defineTable({
    candidateId: v.id("candidates"),
    fileUrl: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    uploadedAt: v.number(),
  })
    .index("by_candidate", ["candidateId"]),

  candidatePositions: defineTable({
    candidateId: v.id("candidates"),
    positionId: v.id("positions"),
    stage: v.union(
      v.literal("presentado"),
      v.literal("a_entrevistar"),
      v.literal("aprobado"),
      v.literal("rechazado")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastInteractionAt: v.number(),
  })
    .index("by_position", ["positionId"])
    .index("by_candidate", ["candidateId"])
    .index("by_position_and_candidate", ["positionId", "candidateId"]),

  comments: defineTable({
    body: v.string(),
    userId: v.id("users"),
    candidatePositionId: v.id("candidatePositions"),
    createdAt: v.number(),
  })
    .index("by_candidate_position", ["candidatePositionId"]),

  activityLog: defineTable({
    action: v.string(),
    fromStage: v.optional(v.string()),
    toStage: v.optional(v.string()),
    userId: v.id("users"),
    userName: v.string(),
    candidatePositionId: v.id("candidatePositions"),
    createdAt: v.number(),
  })
    .index("by_candidate_position", ["candidatePositionId"]),

  notifications: defineTable({
    type: v.union(v.literal("stage_change"), v.literal("new_comment")),
    message: v.string(),
    isRead: v.boolean(),
    userId: v.id("users"),
    relatedCandidatePositionId: v.optional(v.id("candidatePositions")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"]),
});
```

## Appendix B: File Structure

```
nimble-stars/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # Main dashboard layout (sidebar + content)
│   │   ├── admin/
│   │   │   ├── layout.tsx                # Admin layout wrapper
│   │   │   ├── page.tsx                  # Admin dashboard
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx              # Client list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx          # Create client
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx          # Client detail
│   │   │   │       └── users/
│   │   │   │           └── page.tsx      # Client users
│   │   │   ├── positions/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx          # Admin position pipeline
│   │   │   └── candidates/
│   │   │       ├── page.tsx              # Candidate bank
│   │   │       ├── new/
│   │   │       │   └── page.tsx          # Create candidate
│   │   │       └── [id]/
│   │   │           └── page.tsx          # Candidate detail (admin)
│   │   └── (client)/
│   │       ├── layout.tsx                # Client layout (theming)
│   │       └── positions/
│   │           ├── page.tsx              # Client positions list
│   │           └── [id]/
│   │               ├── page.tsx          # Client pipeline (kanban/list)
│   │               └── candidates/
│   │                   └── [cid]/
│   │                       └── page.tsx  # Client candidate profile
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── layout.tsx                        # Root layout
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   ├── candidates/
│   │   ├── candidate-card.tsx            # Kanban card
│   │   ├── candidate-table.tsx           # List view table
│   │   └── candidate-profile.tsx         # Profile view (shared component)
│   ├── pipeline/
│   │   ├── kanban-board.tsx
│   │   ├── kanban-column.tsx
│   │   └── stage-badge.tsx
│   ├── comments/
│   │   ├── comment-list.tsx
│   │   └── comment-form.tsx
│   ├── activity/
│   │   └── activity-timeline.tsx
│   ├── notifications/
│   │   └── notification-bell.tsx
│   └── ui/                               # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── ...etc
├── convex/
│   ├── schema.ts
│   ├── organizations.ts
│   ├── users.ts
│   ├── positions.ts
│   ├── candidates.ts
│   ├── candidateFiles.ts
│   ├── candidatePositions.ts
│   ├── comments.ts
│   ├── activityLog.ts
│   └── notifications.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── storage.ts
│   ├── auth/
│   │   └── auth-context.tsx
│   └── utils.ts
├── public/
│   └── nimble-logo.svg
├── scripts/
│   └── seed.ts
├── .env.local
├── .gitignore
├── README.md
├── CONTRIBUTING.md
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Appendix C: Claude Code Workflow Template

Every time Claude Code picks up a Linear issue, it should follow this exact workflow:

```bash
# 1. Update Linear issue status to "In Progress"
# (via Linear API or MCP)

# 2. Create feature branch
git checkout main
git pull origin main
git checkout -b feature/<ISSUE-ID>-<short-description>

# 3. Do the work as described in the issue
# ... write code, create files, install packages ...

# 4. Verify quality
npm run lint
npx tsc --noEmit
npm run build  # ensure it builds

# 5. Commit
git add .
git commit -m "feat(<scope>): <description> [<ISSUE-ID>]"

# 6. Push and merge
git push origin feature/<ISSUE-ID>-<short-description>
git checkout main
git merge feature/<ISSUE-ID>-<short-description>
git push origin main

# 7. Comment on Linear issue with:
# - Summary of what was done
# - Technical approach and decisions made
# - Issues encountered (if any)
# - Tokens used: <number>
# - Time taken: <duration>

# 8. Update Linear issue status to "Done"
```
