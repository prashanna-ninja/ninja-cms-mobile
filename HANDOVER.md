# Ninja CMS Mobile — Handover

The single entry point for whoever picks this up next: what works, how to run it, what not to undo,
and what to build next. Keep it current at the end of every step.

> ⭐ **This is the ADVISER PORTAL app** (web `/portal/[adviceId]`). Behind sign-in the app takes on the active
> organisation's **colour and logo** (`Advice.colorTheme` / `Advice.logo`). Read
> [docs/07-ORG-THEMING.md](docs/07-ORG-THEMING.md) before building any signed-in screen.

> **Status (2026-09-30):** 🚧 **Login done** — email + password sign-in, forgot password, session guard,
> `apiFetch`, org selection (picker / direct) with per-org colour + tinted logo. The portal home is a
> placeholder. ⚠️ Real sign-in on a device not yet tested. Next: **portal home**.

## 1. What works today

- **Sign in** (`src/app/(auth)/sign-in.tsx`) — email + password, PRM/CRM design in CMS navy, CMS NINJA
  logo, show/hide password, field + server errors, "Forgot password?" link. See [docs/06-AUTH.md](docs/06-AUTH.md) §6.
- **Forgot password** (`(auth)/forgot-password.tsx`) — sends the CMS reset email; "check your inbox" state.
- **Keyboard avoidance** on both auth screens — focused field + button stay above the keyboard (iOS + Android,
  Expo Go). ⚠️ Needs a device check.
- **Session guard** — `Stack.Protected` in `src/app/_layout.tsx`, session from `providers/session-provider.tsx`.
- **Signed-in placeholder** (`(app)/index.tsx`) — name, email, role, sign out.
- **Org theming** — `lib/org-theme.ts` + `providers/org-theme-provider.tsx`: the active org's colour
  overrides the NativeWind tokens across `(app)`; the CMS NINJA wordmark is **tinted the org colour**
  (Ninja CMS blue before an org is chosen); `<OrgLogo>` shows the org's own logo or initials.
- **Org selection** (`(app)/_layout.tsx` gate) — `GET /api/advice/my`: 1 org → straight in; 2+ → **picker**
  (`(app)/select-org.tsx`, web-style coloured cards); 0 → "No organisations assigned"; editor/user → "use the
  web". Remembered per user; "Switch organisation" on the home banner when 2+.
- **Per-org home-screen icon** — 7 icons generated in code (org colour + white CMS NINJA wordmark, default
  login blue); the icon follows the active org (iOS: at once, Android: on next background). Also the real
  app icon/splash now. ⚠️ Needs a **development build** — no-op in Expo Go. docs/08-APP-ICONS.md.
- Backend verified: the CMS accepts `ninjacms://` and Expo Go `exp://` origins (401 on bad creds, not 403).
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
cp .env.example .env          # set EXPO_PUBLIC_API_BASE_URL (dev: http://192.168.1.77:3000)
# the CMS must be running and reachable from the phone (same Wi-Fi): pnpm dev in ../cms
npx expo start -c             # scan the QR with Expo Go / dev build
```

## 4. Building

Not set up yet. Everything so far (secure-store, linear-gradient, network) ships in **Expo Go SDK 57**, so
Expo Go works for now. EAS profiles (`development`, `preview`, `production`, like the CRM) come before the first store build.

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
4. **Auth imports from `better-auth/client`, never `better-auth/react`**, and the session comes from
   `useSession()` in `providers/session-provider.tsx` (React 19 tearing — PRM bug). See docs/06-AUTH.md §6.
5. **better-auth packages are pinned exactly to 1.6.11** (incl. `@better-auth/core`) = the CMS. Bump them together.
6. **No function `style` on `Pressable`** — NativeWind drops it (invisible button, PRM bug). Use plain objects.
7. **Animated values via `useState(() => new Animated.Value(0))`**, not `useRef().current` — the React
   Compiler lint (`eslint-config-expo` 57) errors on reading refs during render.
8. **Icons from `@/lib/icons`** (per-icon subpaths), never the `lucide-react-native` barrel (+3MB).
9. **Keyboard avoidance on auth screens is hand-rolled** (`hooks/use-keyboard.ts` + `reveal()` in
   `components/login/auth-screen.tsx`) because `react-native-keyboard-controller` isn't in Expo Go. Don't add
   `KeyboardAvoidingView` (breaks on Android edge-to-edge). Swap in keyboard-controller once on a dev build.
10. **No hard-coded brand colours behind sign-in** — use `bg-primary`/`bg-accent`/`bg-secondary` classes or
    `useOrgTheme().theme` (`onBase` for text on the colour, `text` for org-coloured text on white).
    `auth-palette.ts` is for signed-out screens only. See docs/07 §4.
11. **App is light-only** (`userInterfaceStyle: "light"`) — the web portal is light-only and org colours assume it.
12. **`CI=1 npx expo start` disables file watching** — fine for scripted screenshots, but restart Metro after
    edits or you'll test a stale bundle (cost two confusing runs on 2026-10-02).
13. **App icons are generated** — edit `src/constants/app-icons.json`, run `node scripts/generate-app-icons.mjs`,
    never hand-edit `assets/app-icons/`. Alternate icons are native: **rebuild** after changing the list. docs/08.
14. **After `npx expo prebuild`, check `git diff package.json`** — it rewrites the android/ios scripts.
15. ~~Icons/splash are still the Expo template art~~ (replaced 2026-10-02) (colours set to navy `#0B2D6F`). Replace before any store build.
16. `apiFetch` must use `credentials: "omit"` and send
   the cookie manually; signing out on 401, not on 403.

## 8. Loose ends & what to build next

1. ✅ Foundation.
2. ✅ Login + session guard (backend expo plugin ✅). ⚠️ Test a real sign-in on iOS + Android.
3. ✅ Forgot password.
4. ✅ **Org selection** + org theme + tinted wordmark. ⚠️ Check with real org logos on a device.
5. ✅ Per-org app icons (⚠️ verify on a dev build: iOS alert, Android switch on background).
6. ⬜ **EAS / dev build** setup (eas.json like the CRM) — needed to see the app icons switch.
7. ⬜ **Portal home** ("dashboard") for the active org — `app/portal/[adviceId]/page.tsx`, org-themed.

## 9. Where things live

| Path | What |
|---|---|
| `src/app/` | Routes (screens) |
| `src/lib/` | api-client, auth-client, query-client, query-keys, icons, fonts, utils |
| `src/providers/` | QueryProvider, SessionProvider |
| `src/api/auth.api.ts` | sign-in / reset mutations + error copy |
| `src/components/login/` | auth screen shell, hero, field, button, forms |
| `assets/images/ninja-cms-logo.png` | white CMS NINJA wordmark |
| `src/lib/org-theme.ts` | org colour → theme engine (pure) |
| `src/providers/org-theme-provider.tsx` | active org, `useOrgTheme()`, `<OrgThemeScope>` |
| `src/components/org-logo.tsx` | org logo / initials tile |
| `src/components/brand/ninja-cms-logo.tsx` | tintable CMS NINJA wordmark |
| `src/app/(app)/_layout.tsx` | org gate (0 / 1 / many orgs) + guarded stack |
| `src/app/(app)/select-org.tsx`, `src/components/orgs/*` | org picker, card, gate states |
| `src/lib/roles.ts` | `canAccessPortal` (ported from CMS lib/staff.ts) |
| `src/constants/app-icons.json`, `scripts/generate-app-icons.mjs`, `assets/app-icons/` | per-org app icons (source, generator, output) |
| `app.config.ts` | registers alternate icons (on top of app.json) |
| `src/lib/app-icon.ts`, `src/hooks/use-org-app-icon.ts` | org → icon matching + switching |
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
