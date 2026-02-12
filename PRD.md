# Nimble S.T.A.R.S — Product Requirements Document

> **S**ourcing **T**alent **A**nd **R**ecruiting **S**olutions
>
> Version: 0.5
> Date: 2025-02-11
> Author: Nimble.LA
> Status: In iteration

---

## 1. Product Vision

Nimble S.T.A.R.S is a lightweight web platform that allows Nimble to share candidate profiles with their clients in an organized, professional, and collaborative way. Clients can review candidates, leave feedback, and move candidates through a simplified pipeline — all without needing access to Nimble's internal tools.

### Problem it solves

Today, candidate communication with clients happens via email, shared docs, or calls. This creates:
- Loss of feedback traceability
- Friction for clients when reviewing candidates
- Lack of visibility on each candidate's status
- Difficulty scaling the process with multiple clients and positions

### Value proposition

A simple, dedicated interface where the client has everything in one place: candidates, CVs, notes, and a clear pipeline for making decisions. Each client sees the platform with their own branding, creating a professional white-label experience.

---

## 2. Users and Roles

### 2.1 Admin (Nimble)
- Full system access
- Creates and manages clients (organizations) with custom branding
- Creates users for each client
- Creates positions and assigns candidates
- Uploads files (CV, documents) of any type and size
- Sees all feedback and activity from clients
- Can move candidates between stages
- Sees all positions (open and closed)
- Accesses each candidate's Manatal link (internal reference)

### 2.2 Client
- Access with username/password
- Sees only **open** positions for their organization (closed ones are hidden)
- Sees all candidate data: name, email, phone, summary, files
- Downloads candidate attachments
- Leaves comments and notes on each candidate
- Comments are visible to all users in the same organization (collaborative)
- Moves candidates between pipeline stages
- Sees activity history (who changed what and when)
- There can be multiple users per client/organization
- All users within the same client have the same permissions (v1)
- **Cannot see** the Manatal link (it's for Nimble's internal use only)
- **Cannot see** closed positions

---

## 3. Data Model (Conceptual)

```
Organization (Client)
├── id, name, logo_url?, primary_color?, created_at
│
├── Users (1..n)
│   └── id, email, password_hash, name, role (admin | client), org_id?
│
├── Positions (1..n)
│   ├── id, title, description?, status (open | closed), org_id, created_at
│   │
│   └── CandidatePositions (junction table — many to many)
│       ├── id, candidate_id, position_id
│       ├── stage: submitted | to_interview | approved | rejected
│       ├── created_at, updated_at
│       ├── last_interaction_at (updated with each comment or stage change)
│       │
│       ├── Comments (0..n)
│       │   └── id, body, user_id, candidate_position_id, created_at
│       │
│       └── Activity Log (0..n)
│           └── id, action, from_stage?, to_stage?, user_id, user_name, candidate_position_id, created_at

Candidates (global, shared across orgs)
├── id, full_name, email?, phone?, current_role?, current_company?
├── summary (brief text about the candidate)
├── files[] (array of files — CV, docs, any type/size)
│   └── { file_url, file_name, file_type, uploaded_at }
├── manatal_url? (Manatal link — visible to admins only)
├── created_at, updated_at
```

### Notes on the model

- **Organization** = a Nimble client. Completely isolates visible data.
- **Candidates** are global entities. The same candidate can be assigned to multiple positions across different clients.
- **CandidatePosition** is the junction table. The **stage**, **comments**, and **activity** live here — because the same candidate can be at a different stage in each position.
- **last_interaction_at** in CandidatePosition is updated every time someone comments or changes the stage. Allows sorting candidates by last interaction.
- **Activity Log** records each action with the user's name, the action performed, and timestamp. Visible to both admins and clients.
- **Admin users** (Nimble) don't belong to an org — they see everything.
- **manatal_url** is an optional field on the candidate, visible only in the admin panel.
- **logo_url** and **primary_color** in Organization enable per-client branding.
- **files** is a flexible array: multiple files of any type can be uploaded with no size limit.

---

## 4. Features — v1 (MVP)

### 4.1 Authentication
- Login with email/password (Supabase Auth)
- Two roles: `admin` and `client`
- Admin creates client accounts (no self-registration)
- Sessions with JWT
- Automatic redirect based on role after login

### 4.2 Client Branding
- Each organization has a configurable **logo** and **primary color**
- The client sees the platform with their logo in the header/sidebar and the primary color applied to UI elements (buttons, accents, links)
- Admins see the platform with Nimble branding
- Logo and color are configured when creating the client (and can be edited later)

### 4.3 Admin Panel (Nimble)

| Feature | Description |
|---|---|
| Dashboard | Overview: active clients, open positions, candidates by stage |
| Client Management | CRUD for organizations (name, logo, primary color) |
| User Management | Create/edit users for each client |
| Position Management | Create positions within a client, open/close positions |
| Candidate Bank | Global pool of candidates, with search. Create candidate with data + files + Manatal link |
| Assign Candidates | Assign an existing candidate to one or more positions (same or different client) |
| View Activity | See comments, stage changes, and full activity history |
| Manatal Link | Quick access to the candidate's Manatal profile from their card |

### 4.4 Client Panel — Main Flow

The client flow is linear and simple:

```
My Positions (list) → Position (candidates) → Candidate Profile (detail + actions)
```

#### Step 1: My Positions
- List of **open** positions for their organization
- Each position shows: title, candidate count, and a summary of candidates by stage

#### Step 2: Candidates for a Position (two views)

**Kanban View (default)**
- Candidates in columns by stage: Submitted | To Interview | Approved | Rejected
- Drag & drop to move candidates between stages
- Click on card to go to detail

**List View**
- Table of candidates with columns: name, current stage, date added, last interaction
- **Filterable by stage** (dropdown or tabs)
- **Sortable by**:
  - Date added (created_at) — newest first by default
  - Last interaction (last_interaction_at) — to see who had recent activity
- Click on row to go to detail

The user can toggle between Kanban and List view with a toggle.

#### Step 3: Candidate Profile
- **Full data**: name, email, phone, current role, current company
- **Summary**: descriptive text about the candidate
- **Files**: list of attachments, downloadable (CV, documents, etc.)
- **Current stage**: visual indicator + button/dropdown to change stage
- **Comments**: section to read and leave notes (visible to the entire org)
- **Activity history**: chronological timeline showing:
  - Who changed the stage, from which stage to which, and when
  - Who left a comment and when
  - When the candidate was assigned to the position

### 4.5 Activity History (Activity Log)

The history is a central component visible in the candidate profile for both admins and clients.

Shows entries like:
```
🔄 Jane Smith moved John Doe from "Submitted" to "To Interview" — 2 hours ago
💬 Alex Johnson left a comment — 1 day ago
📋 Admin assigned John Doe to this position — Feb 15, 2025
```

Rules:
- Each stage change is automatically recorded (with from_stage and to_stage)
- Each new comment is automatically recorded
- The initial assignment of the candidate to the position is recorded
- Each entry includes: user, action, timestamp
- The log is immutable (cannot be edited or deleted)
- Ordered from most recent to oldest

### 4.6 Position Visibility

| Status | Admin | Client |
|---|---|---|
| Open | Visible and editable | Visible, can interact |
| Closed | Visible and editable | Not visible |

When an admin closes a position, it disappears from the client's view immediately. The admin can reopen a position and it becomes visible again.

### 4.7 Notifications (v1 - minimum)
- In-app notification to admin when a client changes a candidate's stage
- In-app notification to admin when a client leaves a comment

---

## 5. Design and Visual System

### 5.1 Design Philosophy

Minimalist, professional, and clean — aligned with the current nimble.la aesthetic. The platform should feel like a natural extension of Nimble's website: spacious, modern, with plenty of whitespace and clear typography.

Principles:
- **Less is more**: no unnecessary decoration, no heavy borders, no excessive shadows
- **Content first**: the interface fades away and lets the data speak
- **Consistency**: use shadcn/ui components without excessive customization
- **Clear visual hierarchy**: font sizes, weight, and color guide reading

### 5.2 Color Palette — Nimble (Admin)

Based on nimble.la's current identity:

```
/* Nimble Brand */
--nimble-black:       #0A0A0A;    /* Main background (dark mode feel) */
--nimble-white:       #FAFAFA;    /* Text on dark backgrounds */
--nimble-gray-50:     #F9FAFB;    /* Light backgrounds, cards */
--nimble-gray-100:    #F3F4F6;    /* Subtle borders, separators */
--nimble-gray-200:    #E5E7EB;    /* Input borders */
--nimble-gray-400:    #9CA3AF;    /* Secondary text */
--nimble-gray-600:    #4B5563;    /* Body text */
--nimble-gray-900:    #111827;    /* Primary text (light mode) */

/* Functional accents */
--stage-submitted:    #3B82F6;    /* Blue — new, pending */
--stage-interview:    #F59E0B;    /* Amber — in process */
--stage-approved:     #10B981;    /* Green — success */
--stage-rejected:     #EF4444;    /* Red — discarded */
```

### 5.3 Color Palette — Client (Dynamic Theming)

Each organization defines a `primary_color`. This color is injected as a CSS variable and replaces the UI accents:

```css
:root {
  --client-primary: var(--org-primary-color, #3B82F6);
  --client-primary-hover: /* primary darkened 10% */;
  --client-primary-light: /* primary at 10% opacity */;
}
```

Applied to: primary buttons, links, active badges, focus borders, sidebar/header accent. Pipeline stage colors remain fixed (blue/amber/green/red) regardless of client branding to maintain functional consistency.

### 5.4 Typography

Use the same font as nimble.la or a system equivalent:

```
/* Font stack */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Scale */
--text-xs:    0.75rem;   /* 12px — captions, timestamps */
--text-sm:    0.875rem;  /* 14px — secondary text, labels */
--text-base:  1rem;      /* 16px — body text */
--text-lg:    1.125rem;  /* 18px — subtitles */
--text-xl:    1.25rem;   /* 20px — section titles */
--text-2xl:   1.5rem;    /* 24px — page titles */
--text-3xl:   1.875rem;  /* 30px — main headers */

/* Weights */
--font-normal:   400;
--font-medium:   500;
--font-semibold: 600;
--font-bold:     700;
```

### 5.5 UI Components (shadcn/ui + Tailwind)

| Component | Usage |
|---|---|
| `Button` | Primary and secondary actions. Primary: filled with accent color. Secondary: outline/ghost. |
| `Card` | Candidate cards in kanban, position cards |
| `Table` | Candidate list view, user lists |
| `Badge` | Stage indicators (colored), counters |
| `Dialog` / `Sheet` | Modals for create/edit, side sheets for quick detail |
| `Tabs` | Toggle between views (kanban/list), profile sections |
| `Avatar` | Candidate initials (no photo in v1) |
| `Textarea` | Comment box |
| `Input` / `Select` | Creation/editing forms |
| `DropdownMenu` | Action menu, stage change |
| `Tooltip` | Contextual info on icons and actions |
| `Separator` | Visual division between sections |
| `ScrollArea` | Scrollable lists (activity log, comments) |

### 5.6 General Layout

```
┌─────────────────────────────────────────────────────┐
│  Sidebar (collapsible)         │  Content            │
│                                │                     │
│  ┌──────────────────────┐      │                     │
│  │ Logo (Nimble or       │      │                     │
│  │ client based on role) │      │                     │
│  ├──────────────────────┤      │                     │
│  │ Navigation            │      │                     │
│  │ · Dashboard           │      │                     │
│  │ · Clients             │      │                     │
│  │ · Candidates          │      │                     │
│  │ · (or Positions       │      │                     │
│  │    if client)         │      │                     │
│  ├──────────────────────┤      │                     │
│  │ User                  │      │                     │
│  │ · Name + Avatar       │      │                     │
│  │ · Logout              │      │                     │
│  └──────────────────────┘      │                     │
└─────────────────────────────────────────────────────┘
```

- **Left sidebar** collapsible (icon on mobile)
- Client logo (or Nimble) at the top
- Navigation based on role
- Content area is 100% of remaining width
- On mobile: sidebar becomes bottom navigation or hamburger menu

### 5.7 Candidate Card Style (Kanban)

```
┌──────────────────────────────┐
│  JD   John Doe               │
│       Senior Developer       │
│       Current Company Inc.   │
│                              │
│  💬 3 comments  · 2h ago     │
└──────────────────────────────┘
```

- White background (`gray-50`), subtle border (`gray-200`), rounded-lg
- Avatar with initials (circle, colored)
- Name in `font-semibold`, details in `text-sm text-gray-500`
- Activity indicator (comments, last interaction) in card footer
- Hover: subtle shadow (`shadow-sm` → `shadow-md`)
- No heavy borders or gradients

### 5.8 Nimble Logo

The Nimble SVG logo (`nimble-logo.svg` from https://nimble.la/) is used as a platform asset:
- In the admin panel sidebar
- On the login screen
- As fallback when a client doesn't have a configured logo

The logo should be included as a static asset in the project (`/public/nimble-logo.svg`).

### 5.9 Color Mode

**v1: Light mode only.** The nimble.la site has a dark style, but for a management/dashboard platform, light mode is more practical for reading and extended use. Dark theme is left as a future iteration.

Main background: `#FFFFFF` or `gray-50`
Sidebar: `gray-900` or `gray-950` (to maintain contrast and some of Nimble's dark feel)

---

## 6. Tech Stack

| Layer | Technology | Justification |
|---|---|---|
| **Frontend + SSR** | Next.js 14+ (App Router) + TypeScript | SSR/SSG, integrated routing, image optimization, API routes if needed |
| **UI Components** | shadcn/ui + Tailwind CSS | Accessible, customizable components. Tailwind facilitates dynamic per-client theming (CSS variables) |
| **Backend / API** | Convex | Realtime out-of-the-box, serverless, typesafe with TS |
| **Auth** | Supabase Auth | Simple, supports email/password, JWT |
| **Storage (Files + Logos)** | Supabase Storage | File uploads with no size limit, signed URLs for downloads |
| **Database** | Convex (built-in) | Main state lives in Convex; Supabase only for auth + storage |
| **Hosting** | Vercel | Native deployment for Next.js, edge functions, preview deploys |

### Simplified Architecture

```
┌──────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Next.js App    │────▶│   Convex     │     │   Supabase      │
│   (App Router)   │     │  (Backend +  │     │  - Auth         │
│   Vercel         │     │   Database)  │     │  - Storage      │
└──────────────────┘     └──────────────┘     └─────────────────┘
```

- **Convex** handles all business logic, queries, mutations, and the database.
- **Supabase** is used exclusively for authentication and file storage.
- The frontend communicates with Convex in real-time (reactive subscriptions).
- **Next.js App Router** handles routing, role-based layouts, and server components where appropriate.

---

## 7. Screens and Routes

### Admin

```
/admin                         → General dashboard
/admin/clients                 → Client list (organizations)
/admin/clients/new             → Create client (name, logo, color)
/admin/clients/[id]            → Client detail + positions (open and closed)
/admin/clients/[id]/users      → Client user management
/admin/clients/[id]/positions  → Client positions
/admin/positions/[id]          → Position pipeline (kanban + list) + activity
/admin/candidates              → Global candidate bank
/admin/candidates/new          → Create candidate (data + files + Manatal link)
/admin/candidates/[id]         → Full profile + assigned positions + activity
```

### Client

```
/positions                     → My open positions (list)
/positions/[id]                → Position candidates (kanban / list, with filters and sorting)
/positions/[id]/candidates/[cid] → Candidate profile + comments + activity history
```

### Shared

```
/login                         → Login with email/password
```

---

## 8. Candidate Pipeline (Stages)

```
┌──────────────┐    ┌────────────────┐    ┌────────────┐    ┌─────────────┐
│   Submitted  │───▶│  To Interview  │───▶│  Approved  │    │  Rejected   │
└──────────────┘    └────────────────┘    └────────────┘    └─────────────┘
                           │                                       ▲
                           └───────────────────────────────────────┘
```

- A candidate always starts at **Submitted** when the admin assigns them to a position.
- The client (or admin) can move them to **To Interview**, **Approved**, or **Rejected**.
- **Rejected** can be reached from any stage.
- Each stage change is recorded in the Activity Log with: who did it, from which stage to which, and when.
- **Stage is per position**: the same candidate can be "Approved" in one position and "Submitted" in another.

Stage colors (fixed, don't change with client branding):

| Stage | Color | Tailwind |
|---|---|---|
| Submitted | Blue | `blue-500` |
| To Interview | Amber | `amber-500` |
| Approved | Green | `emerald-500` |
| Rejected | Red | `red-500` |

---

## 9. Shared Candidates — Flow

Since a candidate can be in multiple positions and clients, the flow is:

1. **Admin creates candidate** in the global bank (data + files + optional Manatal link).
2. **Admin assigns candidate** to a position → creates a `CandidatePosition` with stage "Submitted".
3. The same candidate can be assigned to another position (same or different client).
4. **Each assignment has its own independent pipeline** (stage, comments, activity).
5. **The client only sees** candidates assigned to their open positions — never sees that the candidate is elsewhere.

### Data visible by role

| Field | Admin | Client |
|---|---|---|
| Full name | Yes | Yes |
| Email | Yes | Yes |
| Phone | Yes | Yes |
| Current role / company | Yes | Yes |
| Summary | Yes | Yes |
| Files (CV, docs) | Yes | Yes |
| Activity history | Yes | Yes |
| Comments from their org | Yes | Yes |
| Manatal link | Yes | No |
| Other assigned positions | Yes | No |
| Comments from other clients | No (isolated) | No (their org only) |

---

## 10. Non-Functional Requirements

- **Performance**: The app should load in < 2s. Convex provides realtime without polling. Next.js optimizes with SSR and server components.
- **Security**: Total isolation between organizations. A client never sees another's data. Convex queries always filter by org_id.
- **Mobile-friendly**: Responsive UI, usable from mobile (no native app).
- **Simplicity**: Maximum 3 clicks for any primary action.
- **Scalability**: Serverless (Convex + Vercel) scales automatically.
- **Theming**: Client branding is applied without rebuild — it's dynamic via CSS variables.
- **Storage**: No size or file type limit for candidate uploads.
- **Auditability**: Every stage change is recorded with user and timestamp. The log is immutable.

---

## 11. Future Iterations (Post-MVP)

| Version | Feature |
|---|---|
| v1.1 | Email notifications (new candidate, stage change, new comment) |
| v1.2 | Manatal API integration (import candidates and positions automatically) |
| v1.3 | Advanced filters and candidate search (by skills, experience, etc.) |
| v1.4 | Dashboard analytics (time-to-hire, approval rates by client, by position) |
| v1.5 | Customizable stages per client or organization |
| v1.6 | Granular permissions per client user (viewer, commenter, manager) |
| v1.7 | Dark mode |
| v2.0 | Public careers portal for Nimble's clients |

---

## 12. Success Criteria (MVP)

- An admin can create a client (with branding), a position, and upload candidates with files in < 5 minutes.
- A client can log in, see the platform with their branding, review candidates, leave feedback, and change stages without needing instructions.
- The client can toggle between kanban and list views, filter by stage, and sort by date or last interaction.
- The activity history clearly shows who did what and when.
- The same candidate can exist in multiple positions with independent pipelines.
- The system maintains total isolation between clients.
- Closed positions disappear from the client's view.
- Comments are collaborative among users of the same organization.
- The platform works correctly on desktop and mobile.
- The UI feels like a natural extension of nimble.la: clean, professional, minimalist.

---

*All open questions have been resolved. This PRD is ready to move to the build document phase.*
