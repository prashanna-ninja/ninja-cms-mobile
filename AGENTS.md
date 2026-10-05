This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## This project (Ninja CMS Mobile)

- **Read `HANDOVER.md` first**, then `docs/README.md`. Log every meaningful change in
  `docs/IMPLEMENTATION-LOG.md` (newest first) and keep `HANDOVER.md` current.
- `ref/` is **read-only reference** (git-ignored): `ref/cms` = the Ninja CMS web app + backend (API
  source of truth); `ref/ninja-crm-mobile` = our earlier Expo app (conventions source of truth).
- Stack: Expo SDK 57, Expo Router, TanStack Query v5, better-auth (+ `@better-auth/expo`), NativeWind 4,
  React Native Reusables, react-hook-form + zod.
- Screens never call `fetch` directly — use hooks in `src/api/*.api.ts` → `apiFetch`. Query keys come
  from `src/lib/query-keys.ts`.
- Work page by page, small commits (`feat:`/`fix:`/`chore:`/`docs:`).
- **Native modules:** if a change adds/removes a package with native code or changes native config
  (app.json / app.config.ts / plugins / icons), say so explicitly in the hand-off with
  `npx expo prebuild --clean && npx expo run:ios|android`, and add a row to the rebuild log in
  `docs/02-SETUP-AND-STRUCTURE.md` §6. Probe optional native modules with `requireOptionalNativeModule`.
- **This is the ADVISER PORTAL app.** Behind sign-in, every brand colour + logo comes from the active
  organisation (`Advice.colorTheme` / `Advice.logo`) via `useOrgTheme()` / NativeWind classes — never
  hard-code brand colours in signed-in screens. Read `docs/07-ORG-THEMING.md` before building one.
