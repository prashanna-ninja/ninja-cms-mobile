# 04 — Backend Reference (Ninja CMS API)

Researched 2026-09-30 against `ref/cms`. All paths are relative to the CMS base URL
(`EXPO_PUBLIC_API_BASE_URL`). Each resource section gets filled in with request/response shapes
**when we build the screen that uses it** — verify against the route file before relying on it.

## 0. Conventions

- Every route checks the session itself: `auth.api.getSession({ headers })` → **401** if missing,
  **403** if the role/membership is wrong. There is **no** `middleware.ts`/`proxy.ts`.
- Error body: `{ "message": "…" }` (the CRM used `{ error }` — our `apiFetch` should read both).
- No CORS headers on normal routes — irrelevant for native `fetch`.
- Portal routes are scoped by `[adviceId]` and membership-checked (acting-adviser aware).

## 1. Auth (better-auth, `app/api/auth/[...all]/route.ts`)

| Method + path | What | Notes |
|---|---|---|
| `POST /api/auth/sign-in/email` | `{ email, password, rememberMe? }` → session cookie | `disableSignUp: true` — no sign-up endpoint usage |
| `GET /api/auth/get-session` | current `{ session, user }` or `null` | `user.role` is on the user (admin plugin) |
| `POST /api/auth/sign-out` | ends session | |
| `POST /api/auth/request-password-reset` | `{ email, redirectTo }` | sends branded email; link opens the **web** `/reset-password` |
| `POST /api/auth/reset-password` | `{ newPassword, token }` | web-only flow for now |
| `POST /api/auth/change-password` | `{ currentPassword, newPassword, revokeOtherSessions? }` | Settings screen |

Session defaults (no custom config): cookie `better-auth.session_token` (`__Secure-` prefix on https),
7-day expiry, refreshed daily. A `LoginHistory` row is written on every sign-in.

## 2. Me / profile

| Method + path | What |
|---|---|
| `GET /api/me` | id, name, email, bio, image, practice fields, role |
| `PUT /api/me` | update profile |
| `GET/PATCH /api/me/practice-branding`, `PATCH /api/me/practice-logo` | adviser branding |
| `GET /api/advice/my` | the orgs (`Advice`) I belong to → `[{ id, name, colorTheme, logo }]`; admins/superadmins get **all** orgs; no ORDER BY (mobile sorts by name). ⚠️ uses the user's own memberships, not the acting adviser's (the web picker uses the acting adviser for strict advisers). Used by the org gate/picker (07-ORG-THEMING.md). |

## 3. Admin dashboard (`app/(protected)/dashboard`, admin/superadmin)

`GET /api/dashboard` (`lib/queries/dashboard.ts`) → `userCount`, `articleGroupCount`, `adviceCount`,
`recentLoginHistory` (5), `topPages` (5), `topSearchQueries` (5), `latestNotices` (5), `workforceStats`,
`verificationAdviserStats`, `adviserBirthdays`, `advisersMissingBirthday`, `birthdayOrganisations`,
`workflowStats`. Shapes: TODO when we build the dashboard.

## 4. Portal (adviser/staff/onboarding)

| Method + path | What |
|---|---|
| `GET /api/portal/[adviceId]` | org, article groups (nav), quick-link categories |
| `GET /api/portal/[adviceId]/search` | content search |
| `GET /api/portal/[adviceId]/[groupSlug]` / `…/[articleSlug]` | content pages |
| `POST /api/portal/[adviceId]/page-view` | analytics |
| `POST /api/portal/acting-adviser` | `{ adviserUserId }` → sets `portal-acting-adviser` cookie (30 days) |
| `GET /api/notices?adviceId=&pageSize=100&sortBy=-createdAt` | org notices (no content) — membership-checked, see 09-NOTICES.md |
| `GET /api/notices/[id]` | one notice + `content` (grid-builder rows) |
| `GET /api/events`, `POST /api/events/[id]/rsvp` | home widgets |
| `/api/portal/[adviceId]/client-records/**`, `/clients/**`, `/pipeline/**`, `/workflows/**`, `/verification/**`, `/ato-research-consent/**` | feature areas (documented per feature) |

## 5. Not for mobile

`/api/public/*`, `/api/webhooks/*`, the `cross-site-*` helpers (marketing-site login), and the
admin-only `/api/admin/*` bulk tools (unless a later page needs one).

## 6. Data-fetching plan for mobile

- One `src/api/<domain>.api.ts` per resource; fetchers are plain functions, hooks wrap them.
- Query keys from `lib/query-keys.ts`, e.g. `qk.me()`, `qk.dashboard()`, `qk.portal(adviceId)`.
- Defaults: `staleTime: 30s` (same as the CMS web `components/Providers.tsx`), `retry: 1`, refetch on
  app foreground via `focusManager`.
