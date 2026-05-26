# Ward 54 — Indian National Congress

Premium voter directory and field-operations platform for **Ward No. 54 (163-Entally Assembly Constituency)**, Kolkata Municipal Corporation.

This repo holds **two completely independent Next.js applications** sharing a single Supabase backend:

- **`apps/public`** — public voter directory (`ward54.in`)
- **`apps/admin`** — secure CMS console (`admin.ward54.in`)

The legacy single-file `index.html` / `admin.html` remain in the repo as a static fallback during the migration.

---

## Architecture

```
ward54-inc/
├── apps/
│   ├── public/              Next.js 14 — public voter directory
│   │   └── src/app          /, /directory, /parts, /volunteers
│   └── admin/               Next.js 14 — admin console
│       ├── src/middleware.ts  JWT + allowlist enforcement
│       └── src/app
│           ├── login        magic-link auth
│           └── (dashboard)  /, /stations, /parts, /volunteers, /homepage, /activity
├── packages/
│   ├── db/                  Supabase client + Database types
│   └── ui/                  Shared design system (tokens, primitives, motion)
├── supabase/
│   ├── schema.sql           Tables, RLS policies, views
│   ├── seed.sql             12 polling stations + 38 part stubs + homepage config
│   └── config.toml          Local Supabase config
├── scripts/
│   └── migrate-from-html.mjs  Extract legacy data → Supabase
├── index.html               Legacy v1 (kept as fallback)
└── admin.html               Legacy v1 admin (kept as fallback)
```

### Tech

- **Framework**: Next.js 14 (App Router, RSC, Server Actions)
- **Styling**: TailwindCSS 3 with shared `tailwind-preset`
- **Motion**: Framer Motion
- **DB**: Supabase Postgres with Row-Level Security
- **Auth**: Supabase magic-link → JWT cookies, middleware-enforced allowlist
- **Hosting**: Vercel (two projects, one per app — see deployment below)

### Design language

The visual system blends **Claude.ai's warm dark palette** (deep ink + cream accents), **Apple-style spacing** (4 px grid, generous whitespace), and **Bloomberg's information density** (compact stat pills, tabular numerals). All surfaces are **glassmorphic** — translucent panels over a low-saturation ink base, with soft neon-glow borders used sparingly for the three brand accents (saffron, cream, green — the INC tricolour, restrained).

Tokens live in [`packages/ui/src/tokens.ts`](./packages/ui/src/tokens.ts) and the Tailwind preset.

---

## Local development

### Prerequisites

- Node ≥ 20 (`.nvmrc`)
- pnpm 9 (`corepack enable && corepack prepare pnpm@latest --activate`)
- Supabase CLI (`brew install supabase/tap/supabase`)

### First run

```bash
# 1) Install
pnpm install

# 2) Start Supabase locally
supabase start                     # exposes :54321 (REST) + :54322 (Postgres)
supabase db reset                  # applies schema.sql + seed.sql

# 3) Copy env templates
cp apps/public/.env.local.example apps/public/.env.local
cp apps/admin/.env.local.example  apps/admin/.env.local
# Paste the local Supabase URL + anon + service-role keys printed by `supabase start`.

# 4) Run both apps
pnpm dev:public                   # http://localhost:5454
pnpm dev:admin                    # http://localhost:5455
```

### Migrating data from the legacy `index.html`

```bash
node scripts/migrate-from-html.mjs                                   # dry run
MIGRATE=apply node scripts/migrate-from-html.mjs                     # write to DB
```

---

## Deployment

### One Supabase project, two Vercel apps

| Hostname | Vercel project | Root directory | Env vars |
|---|---|---|---|
| `ward54.in` | `ward54-public` | `apps/public` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `admin.ward54.in` | `ward54-admin` | `apps/admin` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |

In each Vercel project: **Framework Preset = Next.js**, **Install Command = `pnpm install`**, **Build Command = `pnpm --filter @ward54/public build`** (or `…/admin`).

In Supabase **Auth → URL Configuration**, add both production domains to **Redirect URLs**:

- `https://admin.ward54.in/auth/callback`
- `https://ward54.in` (for public anon reads — no auth required)

### Email allowlist

Admin access is locked to a hard-coded list in [`apps/admin/src/lib/admin-allowlist.ts`](./apps/admin/src/lib/admin-allowlist.ts). Three layers of defence:

1. **Middleware** rejects anyone outside the list before any UI renders.
2. **RLS** denies writes unless `admin_users.role IN (super_admin, editor)`.
3. **Service-role key** is only present in `apps/admin` env, never in `apps/public`.

To onboard a new admin:

1. Append their email to `ADMIN_EMAIL_ALLOWLIST`.
2. After their first magic-link login, promote them in Supabase:
   ```sql
   update public.admin_users set role = 'editor' where email = 'new@ward54.in';
   ```

---

## Security model

- **Public app** can only read tables/views where `is_published = true`, via the `anon` role bounded by RLS policies in `supabase/schema.sql`.
- **Voter `support` column** (political affinity) is never exposed to `anon` — the public app reads from the `voters_public` view, which omits it.
- **Admin app** middleware checks JWT freshness on every request and refuses any email outside the allowlist.
- **Activity log** records every admin write (`upsert`, `publish`, `delete`, `reorder`) with actor email + diff.
- **Admin app responses** carry `X-Robots-Tag: noindex, nofollow, noarchive`, `X-Frame-Options: DENY`, and a strict referrer policy.

---

## Data source

All booth metadata is sourced from the official **Electoral Roll 2026 S25 West Bengal — Draft Roll Revision 1** (Date of Updation: 16 Dec 2025), Special Intensive Revision 2026:

- **Assembly Constituency:** 163 — Entally (General)
- **Parliamentary Constituency:** 24 — Kolkata Uttar (Gen)
- **Ward:** 054, District: Kolkata North, PIN: 700014
- **Total electors:** 26,849 (M 13,850 / F 12,999)
- **38 polling booths** across 12 physical buildings

---

## License

Internal campaign tool for the Ward 54 INC unit. Not for redistribution.
