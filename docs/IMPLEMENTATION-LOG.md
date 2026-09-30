# Implementation Log

A running diary of what we built and decided. **Newest entries at the top.** Each entry:
what changed, why, and anything worth remembering. This is our project memory.

---

## 2026-09-30 — Foundation: NativeWind, TanStack Query, fonts, folder skeleton

**Did:**
- Removed the template demo (tabs, explore, animated icon, themed components, `reset-project`) and the
  unused template deps `@expo/ui`, `expo-glass-effect`, `expo-device`.
- Added (via `npx expo install`): nativewind 4.2.7 + tailwindcss 3.4, @tanstack/react-query 5.104,
  zod 4, react-hook-form + @hookform/resolvers, clsx / tailwind-merge / cva, @rn-primitives/slot,
  lucide-react-native + react-native-svg, expo-network, expo-font + Bricolage Grotesque, eslint-config-expo.
- Config: `babel.config.js`, `metro.config.js` (input `src/global.css`), `tailwind.config.js`,
  `nativewind-env.d.ts`, `eslint.config.js` (ignores `ref/`), `.gitattributes` (LF), `.env.example`.
- `app.json`: name **Ninja CMS**, scheme **`ninjacms`**, bundle/package **`com.adviceninja.ninjacms`**,
  splash + adaptive icon background navy `#0B2D6F`, iOS phone-only, no-encryption flag.
- Code: `constants/env.ts`, `lib/{utils,fonts,query-client,query-keys}.ts`,
  `providers/query-provider.tsx`, `components/{screen,container}.tsx`, root `_layout.tsx`, placeholder `index.tsx`.

**Decisions:**
- `src/global.css` (template location) instead of the CRM's root `global.css`.
- **`refetchOnWindowFocus: true`** (CRM had it off) — here "focus" is wired to `AppState`, so data refreshes
  when the app comes back to the foreground. `onlineManager` pauses queries offline.
- Bricolage Grotesque for body *and* display (the CMS web uses it for everything).

**Gotchas / notes:**
- **TS 6.0** (SDK 57 default) errors on `import "../global.css"` (TS2882). Fixed with `src/types/css.d.ts`.
- `npx expo install` worked fine with `ref/` present (the CRM saw issues) — keep an eye on it.
- Checks: tsc ✅, lint ✅, expo-doctor 20/20 ✅, `expo export -p android` ✅. Device run still pending.

**Next:** login — better-auth 1.6 + `@better-auth/expo` + expo-secure-store, `apiFetch`, `(auth)/(app)`
groups with `Stack.Protected`, RNR button/text/input, sign-in screen.

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
