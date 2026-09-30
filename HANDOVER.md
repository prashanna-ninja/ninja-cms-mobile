# Ninja CMS Mobile — Handover

The single entry point for whoever picks this up next: what works, how to run it, what not to undo,
and what to build next. Keep it current at the end of every step.

> **Status (2026-09-30):** 🚧 Foundation done — Expo SDK 57, NativeWind tokens, TanStack Query,
> fonts, folder skeleton. One placeholder screen. Next: **login**.

## 1. What works today

- App boots to a placeholder screen (`src/app/index.tsx`) styled with NativeWind + Bricolage Grotesque.
- TanStack Query client with app-foreground refetch (`focusManager` ↔ `AppState`) and offline pause
  (`onlineManager` ↔ `expo-network`) — `src/lib/query-client.ts`, `src/providers/query-provider.tsx`.
- Query-key factory `src/lib/query-keys.ts`; `cn()` in `src/lib/utils.ts`; `Screen` / `Container` shells.
- Verified: `npx tsc --noEmit` ✅, `npx expo lint` ✅, `npx expo-doctor` 20/20 ✅, `expo export -p android` bundles ✅.
  Not yet run on a physical device.

## 2. Prerequisites

Node 20+ (dev: 24.14), npm, Git, a phone with Expo Go / a development build. See
[docs/02-SETUP-AND-STRUCTURE.md](docs/02-SETUP-AND-STRUCTURE.md) §1.

## 3. Get it running (day-to-day)

```bash
npm install
cp .env.example .env          # set EXPO_PUBLIC_API_BASE_URL
npx expo start -c             # scan the QR with Expo Go / dev build
```

## 4. Building

Not set up yet. Will use EAS (`npx eas-cli@latest build -p android --profile development`) once we
add native modules (`expo-secure-store`) — same profiles as the CRM (`development`, `preview`, `production`).

## 5. Backend dependency

The app talks to the Ninja CMS (`ref/cms`) REST API + better-auth. ⚠️ The CMS needs the
`@better-auth/expo` server plugin + `ninjacms://` trusted origin for native sign-in —
see [docs/06-AUTH.md](docs/06-AUTH.md) §3.

## 6. Architecture at a glance

| Layer | Choice |
|---|---|
| Framework | Expo SDK 57, React Native 0.86, React 19.2, TypeScript strict |
| Routing | Expo Router (`src/app`), typed routes, `Stack.Protected` guard |
| Server state | TanStack Query v5 |
| Auth | better-auth 1.6 + `@better-auth/expo` client + expo-secure-store |
| UI | NativeWind 4 + React Native Reusables |
| Forms | react-hook-form + zod |

Folder conventions: [docs/02-SETUP-AND-STRUCTURE.md](docs/02-SETUP-AND-STRUCTURE.md) §3.

## 7. Gotchas — do NOT undo these

1. **`/ref` is git-ignored and read-only.** Never commit or edit it.
2. **Stay on the latest *stable* SDK** — check `npm view expo dist-tags` (`latest`, not `next`).
3. **TS 6 + CSS import:** `src/types/css.d.ts` declares `*.css` — without it `import "../global.css"`
   fails typecheck (`noUncheckedSideEffectImports`). Don't delete it.
4. **Icons/splash are still the Expo template art** (colours set to navy `#0B2D6F`). Replace before any store build.
5. (Carried from the CRM, applies once auth lands) `apiFetch` must use `credentials: "omit"` and send
   the cookie manually; signing out on 401, not on 403.

## 8. Loose ends & what to build next

1. ✅ Foundation.
2. ⬜ Login (email + password) + session guard + backend expo plugin.
3. ⬜ Forgot password.
4. ⬜ Dashboard — ❓ admin dashboard vs adviser portal home first.

## 9. Where things live

| Path | What |
|---|---|
| `src/app/` | Routes (screens) |
| `src/lib/` | query-client, query-keys, fonts, utils (later: api-client, auth-client) |
| `src/providers/` | QueryProvider |
| `src/constants/env.ts` | `API_BASE_URL`, `APP_SCHEME` |
| `src/global.css`, `tailwind.config.js` | Design tokens |
| `docs/` | All project docs |
| `ref/cms` | CMS web + backend (reference) |
| `ref/ninja-crm-mobile` | CRM mobile (conventions reference) |

## 10. Docs

[docs/README.md](docs/README.md) — index of everything.

## 11. Handy commands

```bash
npx expo start -c        # start, clear cache
npx expo lint            # lint
npx tsc --noEmit         # typecheck
npx expo-doctor          # dependency/config health
npx expo install --fix   # align package versions with the SDK
```
