# Ninja CMS — Mobile

The native (iOS + Android) **adviser portal** app for **Ninja CMS**, the adviser portal and
content-management platform (the Next.js app in `ref/cms`). It is for advisers, staff and onboarding
users, and after sign-in it takes on **their organisation's colour and logo**, like the web `/portal`.
Built with **Expo SDK 57 + React Native + TanStack Query**,
authenticating against the CMS's existing **better-auth** backend.

> **Status (2026-10-01):** 🚧 Sign-in + forgot password done; org theming engine in place. Next: org
> selection → portal home.
> See **[HANDOVER.md](HANDOVER.md)** for current status, how to run, and next steps.

## What this app does (planned, built page by page)

1. **Sign in** — email + password against the CMS (same accounts as the web; no sign-up, invite-only).
2. **Forgot password** — request a reset email (the reset itself completes on the web link).
3. **Organisation selection** — auto when you belong to one org, a picker when several; the app then
   takes on that org's **colour and logo**.
4. **Portal home** — the adviser portal home for the active org (notices, quick links, content…).
5. …further screens are added one at a time, in the order the user gives them — see
   [docs/01-OVERVIEW.md](docs/01-OVERVIEW.md) §5 for the candidate list.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Expo SDK 57** (React Native 0.86, React 19.2) | Latest stable SDK (SDK 58 is still `next`/beta). CNG — no hand-edited `ios/`/`android/`. |
| Routing | **Expo Router** (file-based, typed routes) | Same mental model as Next.js App Router; `Stack.Protected` for the auth guard. |
| Server state | **TanStack Query v5** | Fetching, caching, retries, invalidation. Same library the CMS web uses. |
| Auth | **better-auth** + `@better-auth/expo` client, **expo-secure-store** | The CMS already runs better-auth; the session cookie is kept in the Keychain/Keystore. |
| Styling | **NativeWind v4** (Tailwind 3) + React Native Reusables | Tailwind classes like the web; shadcn-style owned components. Same as Ninja CRM mobile. |
| Forms | **react-hook-form + zod** | Same schemas/validation rules as the web forms. |
| Language | TypeScript (strict) | |

## Documentation

Read in order — written so someone new to React Native can follow along.

| Doc | What's in it |
|---|---|
| [HANDOVER.md](HANDOVER.md) | **Start here.** Status, how to run, gotchas, next steps. |
| [docs/README.md](docs/README.md) | Docs index. |
| [docs/01-OVERVIEW.md](docs/01-OVERVIEW.md) | What we're building + a plain-English map of the CMS. |
| [docs/02-SETUP-AND-STRUCTURE.md](docs/02-SETUP-AND-STRUCTURE.md) | Setup, folder structure, patterns, order of work. |
| [docs/03-DESIGN-SYSTEM.md](docs/03-DESIGN-SYSTEM.md) | Colours, fonts, tokens (from the CMS portal). |
| [docs/04-BACKEND-REFERENCE.md](docs/04-BACKEND-REFERENCE.md) | CMS API endpoints the app will call. |
| [docs/05-ROLES-AND-ACCESS.md](docs/05-ROLES-AND-ACCESS.md) | Roles, orgs (`Advice`), where each role lands. |
| [docs/06-AUTH.md](docs/06-AUTH.md) | Login design + the small backend change it needs. |
| [docs/07-ORG-THEMING.md](docs/07-ORG-THEMING.md) | ⭐ Org colour + logo per organisation (adviser portal). |
| [docs/08-APP-ICONS.md](docs/08-APP-ICONS.md) | Per-org home-screen icon, generated in code. |
| [docs/09-NOTICES.md](docs/09-NOTICES.md) | Notices on the portal home + CMS content renderer. |
| [docs/10-RELEASE-IOS.md](docs/10-RELEASE-IOS.md) | ⭐ iOS TestFlight release: EAS profiles, env, build + submit. |
| [docs/11-NAVIGATION.md](docs/11-NAVIGATION.md) | Route tree + bottom tabs. |
| [docs/12-CLIENTS.md](docs/12-CLIENTS.md) | Client Records: access-gated tab, list + filters. |
| [docs/IMPLEMENTATION-LOG.md](docs/IMPLEMENTATION-LOG.md) | Running diary of changes and decisions. |
| [docs/PROMPTS.md](docs/PROMPTS.md) | How we work together + reusable prompts. |

## The reference projects (`ref/`, git-ignored, read-only)

- **`ref/cms`** — the Ninja CMS web app **and backend** (Next.js 16, better-auth, Prisma/Postgres).
  The source of truth for API routes, data shapes, roles and UI.
- **`ref/ninja-crm-mobile`** — our earlier Expo app for Ninja CRM. The source of truth for **mobile
  conventions** (folder layout, auth client, `apiFetch`, query hooks, RNR components, docs format).

Never edit anything under `ref/`; it is excluded from git and from EAS uploads.
