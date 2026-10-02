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

## 6. Order of work

1. ✅ Scaffold Expo SDK 57 app, git init, ignore `ref/`
2. ✅ Initial docs (this set)
3. ✅ Foundation: clean the template, NativeWind + tokens, TanStack Query provider, folder skeleton, env
4. ✅ **Login** — auth client, `apiFetch`, `(auth)/(app)` groups + guard, sign-in screen ([06-AUTH.md](06-AUTH.md))
5. ✅ Forgot password (request link; reset finishes on the web)
6. ✅ Org theming engine + org selection (auto if 1, picker if 2+) — [07-ORG-THEMING.md](07-ORG-THEMING.md)
7. ⬜ Portal home ("dashboard") for the active org
8. ⬜ …next pages as instructed
