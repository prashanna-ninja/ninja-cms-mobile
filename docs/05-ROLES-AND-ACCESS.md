# 05 — Roles & Access

Researched 2026-09-30 against `ref/cms` (`prisma/schema/base.prisma`, `lib/auth.ts`,
`lib/auth-permissions.ts`, `lib/auth-guard.ts`, `lib/auth-roles.ts`, `lib/roles.ts`, `lib/staff.ts`).

## 1. Three concepts

1. **Role** — one per user, `User.role` (enum `Role`): `superadmin`, `admin`, `orgadmin`, `adviser`,
   `onboarding`, `staff`, `editor`, `user`. Managed by better-auth's `admin` plugin
   (`adminRoles: ["superadmin", "admin"]`).
2. **Organisation membership** — `AdviceMember (userId, adviceId)`. Portal URLs are `/portal/[adviceId]`;
   the server checks membership on every portal route.
3. **Per-user feature flags** on `User`: `clientVerificationEnabled`, `atoResearchConsentEnabled`,
   `pipelinesEnabled`, `documentUploadEnabled`, `revenueVisibilityEnabled`, `clientRecordsEnabled`,
   `workflowsEnabled`. These hide or show portal features.

## 2. Where each role lands (`getDefaultRedirect`)

| Role | Web landing | Mobile (planned) |
|---|---|---|
| superadmin, admin | `/dashboard` | portal **preview** (can pick any org, like web `canAccessPortal`); no back office on mobile |
| orgadmin | `/manage-article-group` | portal preview for their orgs |
| editor | `/manage-article-group` | ❓ not a portal user (web `canAccessPortal` = false) — show a "use the web" message |
| adviser, onboarding, staff | `/portal` → org | **portal home for the active org, in the org's theme** (primary audience) |
| user | `/settings` | settings |

## 3. Active organisation (portal)

- 0 memberships → "No organisations assigned". 1 → auto-select. More than 1 → org picker.
- Admins can preview any org.
- The web remembers the last org in `localStorage["portal_advice_id"]`. Mobile: SecureStore key
  `ninjacms_active_org` (whole org incl. colour + logo, keyed to the user) — see 07-ORG-THEMING.md.

## 4. How we use it on mobile

- Read `session.user.role` (+ flags from `GET /api/me` if needed) → helpers in `src/lib/roles.ts`
  ported from `lib/auth-guard.ts` as **pure functions** (`isAdmin(user)`, `canAccessPortal(user)`…).
- UI gating is cosmetic only — the server remains the authority (401/403).
- Filled in properly when the dashboard step starts.
