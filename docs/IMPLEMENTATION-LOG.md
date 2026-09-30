# Implementation Log

A running diary of what we built and decided. **Newest entries at the top.** Each entry:
what changed, why, and anything worth remembering. This is our project memory.

---

## 2026-09-30 — Project kick-off: Expo SDK 57 scaffold + docs

**Did:**
- Studied both references: `ref/cms` (Next.js 16 CMS + backend, HEAD `a147f92`) and
  `ref/ninja-crm-mobile` (our Expo 54 CRM app, HEAD `065827f`).
- Scaffolded with `create-expo-app@latest --template default@sdk-57`, git-initialised this folder,
  added `/ref` to `.gitignore`, `.env` ignored with `!.env.example` kept.
- Wrote the initial docs: README, HANDOVER, `docs/01…06`, PROMPTS, this log.

**Decisions:**
- **Expo SDK 57** (`expo@57.0.26`, RN 0.86, React 19.2). SDK 58 was published 2026-09-29 under the
  `next` tag — beta, not "latest stable". Revisit once 58 becomes `latest` and has a few patches.
- **Same stack as the CRM** (NativeWind 4 / Tailwind 3, React Native Reusables, react-hook-form + zod,
  TanStack Query 5, better-auth + expoClient + SecureStore) so both apps share patterns and people.
  NativeWind 5 is still an RC — not adopting.
- **Improvements over the CRM** planned: a query-key factory (`lib/query-keys.ts`), `focusManager` /
  `onlineManager` wiring, `apiFetch` reading both `{ message }` (CMS) and `{ error }` error bodies.
- **Auth = email + password**, not magic link — that's what the CMS supports (`emailAndPassword`,
  `disableSignUp: true`, `admin` plugin only). See [06-AUTH.md](06-AUTH.md).
- better-auth pinned to the **1.6.x** line to match the CMS server (1.6.11).

**Gotchas / notes:**
- ⚠️ The CMS has **no `@better-auth/expo` server plugin** — native sign-in likely needs `expo()` +
  `ninjacms://` in trusted origins on the backend. Documented in 06-AUTH §3; to confirm on first login.
- The CMS has **no server actions** and **no middleware** — every page has a REST twin under
  `app/api`, and each route checks the session itself. Good news for mobile.
- Two different "home" screens exist on the web (admin `/dashboard` vs adviser `/portal/[adviceId]`) —
  open question for the dashboard step.

**Next:** foundation commit (clean template, NativeWind, Query provider, folder skeleton, env), then login.

---

<!-- Template for new entries:

## YYYY-MM-DD — <short title>
**Did:** …
**Why:** …
**Decisions:** …
**Gotchas / notes:** …
**Next:** …
-->
