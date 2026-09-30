# Ninja CMS Mobile — Handover

The single entry point for whoever picks this up next: what works, how to run it, what not to undo,
and what to build next. Keep it current at the end of every step.

> **Status (2026-09-30):** 🚧 Project initialised — Expo SDK 57 scaffold, git, docs.
> No app screens yet beyond the template. Next: foundation → login.

## 1. What works today

- Expo SDK 57 default template runs (`npx expo start`).
- Docs set in place (`docs/`).

## 2. Prerequisites

Node 20+ (dev: 24.14), npm, Git, a phone with Expo Go / a development build. See
[docs/02-SETUP-AND-STRUCTURE.md](docs/02-SETUP-AND-STRUCTURE.md) §1.

## 3. Get it running (day-to-day)

```bash
npm install
cp .env.example .env          # set EXPO_PUBLIC_API_BASE_URL (once the foundation step adds it)
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
3. (Carried from the CRM, applies once auth lands) `apiFetch` must use `credentials: "omit"` and send
   the cookie manually; signing out on 401, not on 403.

## 8. Loose ends & what to build next

1. ⬜ Foundation: remove template demo screens, NativeWind + tokens, QueryClient provider, env, folders.
2. ⬜ Login (email + password) + session guard + backend expo plugin.
3. ⬜ Forgot password.
4. ⬜ Dashboard — ❓ admin dashboard vs adviser portal home first.

## 9. Where things live

| Path | What |
|---|---|
| `src/app/` | Routes (screens) |
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
