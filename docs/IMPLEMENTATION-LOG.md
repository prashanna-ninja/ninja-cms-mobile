# Implementation Log

A running diary of what we built and decided. **Newest entries at the top.** Each entry:
what changed, why, and anything worth remembering. This is our project memory.

---

## 2026-09-30 — Keyboard avoidance on the auth screens

**Did:** the sign-in and forgot-password screens now keep the focused field **and** the button under it
above the keyboard, on iOS and Android, in Expo Go.
- `src/hooks/use-keyboard.ts` — measures the keyboard: `overlap = window height − keyboard top`
  (`keyboardWillShow/Hide` on iOS, `keyboardDidShow/Hide` on Android).
- `src/components/login/auth-screen.tsx` — the sheet's bottom padding grows by the overlap (scroll room),
  then `reveal()` measures the focused input (`TextInput.State.currentlyFocusedInput().measureInWindow`)
  and scrolls just enough to put it + **180px** (next field / Forgot link + Login button, with an error
  note) above the keyboard. The scroll never pushes the field under the status bar.
- `AuthField` calls `reveal()` on focus, so email "Next" → password re-scrolls while the keyboard is open.
- Removed `automaticallyAdjustKeyboardInsets` (iOS-only, and it doubled up with the padding).
  `keyboardDismissMode`: `interactive` on iOS, `on-drag` on Android.

**Decisions:**
- **Not `KeyboardAvoidingView`:** SDK 57 Android is edge-to-edge, the window doesn't resize, and KAV
  computes zero padding (CRM/PRM gotcha).
- **Not `react-native-keyboard-controller` (yet):** it is the SDK 57-compatible, recommended library
  (`1.21.9` in `bundledNativeModules.json`), but per the Expo docs it is **not in Expo Go**. We're
  testing in Expo Go, so this is hand-rolled. **When we move to a development build, replace this with
  `KeyboardProvider` + `KeyboardAwareScrollView`** and delete `use-keyboard.ts` + the reveal code.
- The overlap is **geometric** (not `endCoordinates.height`), so on a device that *does* resize the
  window the overlap is ~0 and nothing double-pads.

**Gotchas / notes:**
- `reveal()` waits one tick (50ms iOS / 80ms Android) so the new padding has laid out; otherwise
  `scrollTo` gets clamped to the old content height.
- Keyboard geometry for the async reveal lives in refs **written in an effect**, not during render
  (React Compiler lint).
- ⚠️ **Not tested on a device** — there's no Android emulator on this PC, and a browser has no soft
  keyboard. To test: small phone (iPhone SE / small Android), focus email → Next → password → Login, with
  and without a wrong-password error showing.

---

## 2026-09-30 — Login: email + password sign-in, forgot password, session guard

**Did:**
- **Sign-in screen** in the Ninja PRM/CRM design (from the user's reference screenshot: brand hero, white
  sheet, boxed icon fields, pill button, invite-only footer), but with **email + password** and CMS
  navy/blue. Adds a password field with show/hide, a "Forgot password?" link and "Secure, encrypted sign-in".
- **Forgot password** screen (same shell): `requestPasswordReset` → "Check your inbox" (48h, no
  account enumeration) → back to sign in.
- Auth plumbing ported from **Ninja PRM mobile** (SDK 57 sibling, newest patterns): `better-auth/client` +
  `expoClient` + SecureStore, `SessionProvider` (not `useSession` from better-auth/react), `apiFetch`,
  per-icon lucide imports (`lib/icons.ts`), `Stack.Protected` `(auth)`/`(app)` groups, navy boot hold.
- TanStack mutations `useSignIn` / `useRequestPasswordReset` in `src/api/auth.api.ts` (screens never call
  auth directly); `describeAuthError` maps CMS error codes to copy.
- **CMS NINJA logo** (`assets/images/ninja-cms-logo.png`) — none existed, so it was built from the PRM
  wordmark with "CMS" in Montserrat SemiBold (details in docs/03 §5).
- Deps: better-auth / @better-auth/expo / @better-auth/core **1.6.11 exact**, expo-secure-store,
  expo-linear-gradient. Local `.env` → `http://192.168.1.77:3000` (git-ignored).

**Decisions:**
- **Improved on PRM:** a 401 from `apiFetch` now goes through the SessionProvider
  (`setUnauthorizedHandler`). PRM calls `authClient.signOut()` directly, which clears the cookie but
  leaves the provider thinking you're still signed in.
- Kept **"Login"** as the button label to match the reference; it shows "Signing in…" while pending.
- The email field uses `textContentType="username"` so iOS offers saved Keychain logins with the password.
- The signed-in area is a plain Stack + placeholder until the dashboard step decides on tabs.

**Gotchas / notes:**
- npm resolved `@better-auth/expo`'s `@better-auth/core` peer to **1.7.6**, so core is pinned explicitly.
- **React Compiler lint** (eslint-config-expo 57) rejects `useRef(new Animated.Value(0)).current` and a
  synchronous `setState` in an effect. Fixed with `useState(() => new Animated.Value(0))`, and the session
  load now sets state only inside promise callbacks.
- Bash heredocs choked on JSX containing apostrophes — use the Write tool for TSX files.
- Verified: tsc ✅, lint ✅, expo-doctor 20/20 ✅, Android bundle ✅ (5.5MB, was 3.9MB — better-auth + zod +
  RHF), web-render screenshots of the empty / validation / network-error states ✅, CMS origin checks via
  curl ✅ (table in docs/06 §5). ⚠️ **Not yet done: a real sign-in with a real account on a phone.**

**Next:** test sign-in on a device → dashboard (❓ admin dashboard vs adviser portal home first).

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
