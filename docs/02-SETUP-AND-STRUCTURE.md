# 02 — Setup & Structure

## 1. Prerequisites

- **Node 20+** (developed on Node 24.14, npm 11).
- **Git.**
- A phone with a **development build** (preferred; needed once we add native modules such as
  `expo-secure-store`) or **Expo Go** for the very first screens.
- For device builds: an Expo account + `npx eas-cli@latest` (no local Xcode/Android Studio needed).
- The **CMS backend running** somewhere your phone can reach (see §5).

## 2. How it was scaffolded

```bash
npx create-expo-app@latest ninja-cms-mobile --template default@sdk-57 --no-install
# copied into this folder (ref/ already here), then:
npm install
```

- **Why SDK 57:** on 2026-09-30 `npm view expo dist-tags` gives `latest: 57.0.26`; SDK 58 was published
  the day before under `next` (beta). We stay on the latest **stable** SDK.
- SDK 57 = React Native **0.86**, React **19.2**, Expo Router **57**, TypeScript **6.0**, New
  Architecture always on, React Compiler enabled (`experiments.reactCompiler`).
- The default template already uses **`src/app`** for routes and the `@/*` → `src/*` alias.

> **Beginner note:** with SDK 57 every Expo package version matches the SDK major (`expo-router ~57`,
> `expo-image ~57`…). Add Expo packages with `npx expo install <pkg>` so the SDK-compatible version is
> picked. ⚠️ The CRM hit a problem where `expo install` got confused by the nested `ref/` project — if
> that happens here, fall back to `npm install <pkg>@<version from expo docs>`.

## 3. Folder structure (target — mirrors Ninja CRM mobile)

```
src/
├── app/                 # ROUTES ONLY (every file is a screen)
│   ├── _layout.tsx      # providers + fonts + Stack.Protected auth guard
│   ├── (auth)/          # signed-out stack: sign-in, forgot-password
│   └── (app)/           # signed-in area: tabs (dashboard, …, settings)
├── api/                 # <domain>.api.ts — fetch fns + TanStack hooks (auth.api.ts, dashboard.api.ts…)
├── components/
│   ├── ui/              # primitives (RNR: button, text, input, card…) — we own these files
│   └── <screen>/        # components grouped by screen (login/, dashboard/…)
├── constants/           # env.ts (EXPO_PUBLIC_* vars), app constants
├── hooks/               # reusable hooks (use-color-scheme, use-permissions…)
├── lib/                 # api-client, auth-client, query-client, query-keys, utils (cn), fonts
├── providers/           # query-provider, theme-provider
├── schemas/             # zod schemas (*.schema.ts)
└── types/               # TS types (*.types.ts), inferred from schemas where possible
assets/                  # icons, splash, images (template location — kept)
```

**The rules (where does my file go?)**

1. `src/app/` holds **routes only**. Screens are thin: layout + hooks + components.
2. A component used by one screen → `components/<screen>/`. Used everywhere → `components/ui/`.
3. **Screens never call `fetch`.** They call hooks from `src/api/*.api.ts`, which call `apiFetch`.
4. Every query key comes from `lib/query-keys.ts` (a key factory) — no ad-hoc arrays.
5. Zod schemas in `schemas/`; types inferred with `z.infer` in `types/`.
6. Files are **kebab-case**; suffixes `*.api.ts`, `*.schema.ts`, `*.types.ts`.
7. Never touch `ios/` / `android/` (generated) or anything in `ref/`.

## 4. Design patterns

| Concern | Pattern |
|---|---|
| Auth state | `authClient.useSession()` (better-auth) drives `Stack.Protected` in the root layout — no manual redirects. |
| API calls | `apiFetch<T>(path, opts)` in `lib/api-client.ts`: base URL + `Cookie` header from `authClient.getCookie()`, `credentials: "omit"`, typed `ApiError`, auto sign-out on 401. |
| Server state | TanStack Query. One QueryClient (`lib/query-client.ts`), `focusManager` wired to `AppState`, `onlineManager` wired to `expo-network`. |
| Mutations | `useMutation` + `invalidateQueries` on success (keys from the factory). |
| Forms | react-hook-form + `zodResolver`, `Controller` around inputs, schema mirrors the web's `lib/validations/*`. |
| Styling | NativeWind classes, tokens as CSS variables in `global.css` (light + dark). |
| Secrets/session | `expo-secure-store` only. Never AsyncStorage for tokens. |

## 5. Environment / config

`.env` (git-ignored; copy from `.env.example`):

```
EXPO_PUBLIC_API_BASE_URL=https://<cms-host>   # same value as the CMS's BETTER_AUTH_URL
```

- Local dev: the CMS on `http://localhost:3000` is **not** reachable from a phone. Use your PC's LAN IP
  (`http://192.168.x.x:3000`) or a tunnel, and add that origin to the CMS's `TRUSTED_ORIGINS`.
- Production CMS: `https://login.cobaltlicenseesolutions.com.au` (from the CMS `.env.example`).
- `EXPO_PUBLIC_*` values are **baked into the bundle** — never put secrets there.

## 6. ⭐ Native modules — when you must rebuild the dev app

JS changes reload instantly. **Native** changes (a new package with native code, or config-plugin /
`app.json` / `app.config.ts` / icon changes) only reach a dev build after a **rebuild**:

```bash
npx expo prebuild --clean            # regenerate ios/ + android/ from config
npx expo run:ios                     # or: npx expo run:android
```

Skip it and the dev build either runs a stale native project (old icon, missing modules) or hits
`Cannot find native module '…'`. EAS cloud builds always prebuild fresh, so no action is needed there.

**Rule (for whoever adds code, Claude included): whenever a change adds or removes a native module or changes
native config, say so explicitly in the hand-off, with the rebuild command, and add a row below.**
Code that uses an optional native module probes it first (`requireOptionalNativeModule`, see
`lib/app-version.ts`, `lib/app-icon.ts`), so a stale build degrades quietly instead of showing a red error.

**Native packages in the app** (anything with `ios/`, `android/` or `expo-module.config.json`): expo,
expo-alternate-app-icons, expo-application, expo-constants, expo-document-picker, expo-dev-client, expo-file-system, expo-font, expo-image,
expo-linear-gradient, expo-linking, expo-network, expo-router, expo-secure-store, expo-sharing, expo-splash-screen,
expo-status-bar, expo-symbols, expo-system-ui, expo-web-browser, react-native, react-native-gesture-handler,
react-native-reanimated, react-native-safe-area-context, react-native-screens, react-native-svg,
react-native-worklets.

**Rebuild log — native changes after the scaffold** (rebuild if your dev build is older than the row):

| Date | Change | Commit | In Expo Go? |
|---|---|---|---|
| 2026-09-30 | expo-network, react-native-svg, expo-font | foundation `37c8db7` | ✅ |
| 2026-09-30 | expo-secure-store, expo-linear-gradient | login `f641ece` | ✅ |
| 2026-10-02 | **expo-alternate-app-icons** + per-org icons in `app.config.ts` | `cd57c27` | ❌ dev build only |
| 2026-10-02 | **expo-dev-client** | `097a0c4` | — |
| 2026-10-02 | brand-logo icons (native assets) | `5f105dd`, `f6aaf1b` | — |
| 2026-10-02 | expo-secure-store `faceIDPermission: false` (Info.plist) | `3438774` | — |
| 2026-10-05 | **expo-application** (Settings → version/build) | `4e665e2` | ✅ |
| 2026-10-07 | **expo-document-picker** (client Files → Upload) | client detail commit | ✅ |
| 2026-10-06 | default Ninja CMS icon: larger wordmark (native assets) | icon size commit | — |
| 2026-10-06 | **expo-sharing** (Fact Find → Generate PDF). expo-file-system is now a direct dependency but already shipped inside `expo`, so it adds no native code | fact-find PDF commit | ✅ |

## 7. Order of work

1. ✅ Scaffold Expo SDK 57 app, git init, ignore `ref/`
2. ✅ Initial docs (this set)
3. ✅ Foundation: clean the template, NativeWind + tokens, TanStack Query provider, folder skeleton, env
4. ✅ **Login** — auth client, `apiFetch`, `(auth)/(app)` groups + guard, sign-in screen ([06-AUTH.md](06-AUTH.md))
5. ✅ Forgot password (request link; reset finishes on the web)
6. ✅ Org theming engine + org selection (auto if 1, picker if 2+) — [07-ORG-THEMING.md](07-ORG-THEMING.md)
7. ⬜ Portal home ("dashboard") for the active org
8. ⬜ …next pages as instructed
