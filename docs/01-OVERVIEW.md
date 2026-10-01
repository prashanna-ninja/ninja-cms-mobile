# 01 — Overview

Researched 2026-09-30 against `ref/cms` (HEAD `a147f92`) and `ref/ninja-crm-mobile` (HEAD `065827f`).

## 1. What we're building

> **Audience (decided 2026-10-01): the ADVISER PORTAL.** This app is the mobile version of the web
> `/portal/[adviceId]` for advisers, staff and onboarding users, **not** the back office (`/dashboard`,
> `/manage-*`). After sign-in the app takes on the active **organisation's colour and logo**, like the web
> portal. See [07-ORG-THEMING.md](07-ORG-THEMING.md).

A native mobile app for **Ninja CMS** — the adviser portal + content-management platform used by the
licensee groups (Cobalt, Beryllium, AIAFSL, CLS). The web app lives in `ref/cms`; this app talks to
**the same backend** (same accounts, same data) over its REST routes.

We build it **page by page**, in the order the user gives: login first, then the dashboard, then the
rest. Each page gets a log entry in [IMPLEMENTATION-LOG.md](IMPLEMENTATION-LOG.md) and, if it is a real
feature, its own numbered doc (`07-…`).

## 2. The reference CMS in plain English

| Thing | What it is |
|---|---|
| **Next.js 16 app** | Web UI **and** the backend (API routes in `app/api/**/route.ts`). No separate server. |
| **better-auth 1.6** | Auth library. Email + password only, `admin` plugin (roles, ban, impersonate). **No sign-up** — admins create users and an invite email lets them set a password. |
| **Prisma 7 + Postgres** | Database. Schema split across `prisma/schema/*.prisma`. |
| **Advice** | An *organisation* (a licensee / AFSL / practice). Users belong to orgs via `AdviceMember`. Not better-auth's organization plugin — it's custom. |
| **Portal** | The adviser-facing side: `/portal/[adviceId]/…` — home, content pages, clients, pipelines, workflows, verifications, invoices, revenue… |
| **Back office** | The admin side: `/dashboard`, `/manage-*` — users, content, notices, invoices, jobs, events… |
| **Article group / Article** | CMS content: a "page" (group, with slug) holding ordered articles, published per org. |
| **Notice** | An announcement shown on the portal home. |
| **Quick links** | Per-org link categories shown on the portal home. |

**Important:** there are **no server actions** in the CMS. Pages load first data in server components
(Prisma directly — not callable from mobile), but almost everything also has a matching **REST route**
that the web's client components call via TanStack Query. **Mobile uses those REST routes.** See
[04-BACKEND-REFERENCE.md](04-BACKEND-REFERENCE.md).

## 3. Jargon cheat-sheet

- **AFSL** — Australian Financial Services Licence; here "an AFSL" ≈ an `Advice` org.
- **Adviser** — a financial adviser; primary portal user.
- **Staff** — an adviser's staff member, linked via `StaffAdviserAssignment`.
- **Acting adviser** — a staff/strict adviser can "act as" an associated adviser (cookie
  `portal-acting-adviser`, set by `POST /api/portal/acting-adviser`).
- **Entity** — the licensee brand (`Cobalt | Beryllium | AIAFSL | CLS`), drives logo/colours/emails.

## 4. The web app's screens (IA)

**Public:** `/login`, `/forget-password`, `/reset-password`, `/setup-password` (invite), plus
token-based client forms (`/verify/[token]`, `/ato-consent/[token]`, `/upload/[token]`) — not for mobile.

**Where you land after login** (`lib/auth-guard.ts` → `getDefaultRedirect`):

| Role | Lands on |
|---|---|
| `superadmin`, `admin` | `/dashboard` (admin overview) |
| `orgadmin`, `editor` | `/manage-article-group` |
| `adviser`, `onboarding`, `staff` | `/portal` → org picker → `/portal/[adviceId]` |
| `user` | `/settings` |

**Back office** (`app/(protected)/*`): dashboard, manage-member, manage-quick-links, manage-notice,
manage-article-group, manage-article, manage-advice, manage-invoices, manage-docs, manage-jobs,
manage-job-notices, manage-verifications, manage-clients, manage-client-groups, manage-workflow-library,
manage-pipelines, manage-events, manage-adviser-survey, manage-website-enquiries, manage-adviser-faq,
settings; superadmin-only: manage-revenue, manage-ato-research-consent, manage-adviser-sms.

**Portal** (`app/portal/*`): org picker, portal home, content pages (`/[groupSlug]/[articleSlug]`),
client-records, clients, pipeline (kanban + cards), workflows, verification, ato-research-consent,
document-upload, forms, invoices/receipts, my-revenue, fee-deductibility-calculator, team, settings.

## 5. How mobile maps to web (candidate order — confirmed page by page)

| # | Mobile screen | Web source | Status |
|---|---|---|---|
| 1 | Sign in | `app/login`, `app/_components/LoginForm.tsx` | ⬜ next |
| 2 | Forgot password | `app/(public)/forget-password` | ⬜ |
| 3 | Org selection (auto if 1, picker if >1) → applies org theme + logo | `app/portal/page.tsx` + `OrgSwitcher` | ⬜ next |
| 4 | Portal home ("dashboard") | `app/portal/[adviceId]/page.tsx` | ⬜ |
| 5 | Settings (profile, change password, sign out) | `app/(protected)/settings` | ⬜ |
| … | Notices, content pages, clients, workflows… | see §4 | ⬜ |

✅ **Settled 2026-10-01:** the web has two "home" screens, the admin dashboard (`/dashboard`) and the
**adviser portal home** (`/portal/[adviceId]`). Mobile is the **adviser portal**, so "dashboard" means the
portal home, themed with the org's colour and logo.
