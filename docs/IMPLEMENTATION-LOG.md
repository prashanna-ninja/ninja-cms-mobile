# Implementation Log

A running diary of what we built and decided. **Newest entries at the top.** Each entry:
what changed, why, and anything worth remembering. This is our project memory.

---

## 2026-10-02 — Org selection after sign-in, org-coloured logo

**Asked:** after sign-in, pull the user's orgs with their colours; keep the Ninja CMS logo but **recolour**
it (Ninja CMS blue by default, the org colour once the org is known); show an org picker like the web
(reference screenshot) when there are several orgs, and go straight in when there's one.

**Did:**
- **Org gate** in `src/app/(app)/_layout.tsx` (`GET /api/advice/my` via `useMyOrgs`, sorted by name): editor/user →
  "use the web"; loading / error / 0 orgs states; **1 org → auto-select**; 2+ → remembered org or **picker**;
  the remembered org is re-synced with the server (colour/logo edits, removed memberships).
  `Stack.Protected` flips between `index` and `select-org` when `setOrg` runs.
- **Picker** `(app)/select-org.tsx` + `components/orgs/org-card.tsx` — a port of the web `OrgSwitcher`/`OrgCard`
  (copy, colours, gradient bar, "View Portal →" pill), as a 2-column grid with pull-to-refresh and sign out.
  A missing or broken logo falls back to the first letter + the name.
- **`<NinjaCmsLogo color>`** (`components/brand/ninja-cms-logo.tsx`) — expo-image `tintColor` on the white
  wordmark. New theme field **`logoTint`**: Ninja CMS blue `#1A4DB3` with no org colour, otherwise the org colour.
- Gate states (`components/orgs/org-gate-states.tsx`), `lib/roles.ts` (`canAccessPortal` from CMS lib/staff.ts),
  icons (`building`, `arrow-right`, `arrow-left-right`, `refresh-cw`).
- Temporary home: org-tinted wordmark app bar, org banner with `<OrgLogo>`, "Switch organisation" (2+ orgs only).

**Decisions:**
- **White on the org colour, like the web.** The first rule (whichever of white/ink contrasts more) put dark
  text on the green and orange cards, unlike the user's reference, where org logos are white artwork. Now
  white unless the colour is pale (< 2:1 with white). Body text on white still gets 4.5:1 (`text`); the
  wordmark tint gets 3:1 (`logoTint`), so orange stays orange (`#CF730C`) instead of brown (`#9E5D19`).
- **Light only** (`userInterfaceStyle: "light"`): the signed-in screens went dark under `automatic`, and the
  web portal is light-only.
- `apiFetch` reads the cookie through a non-throwing `readCookie()` (SecureStore has no web implementation,
  so the mocked web run surfaced it as "Couldn't load your organisations").

**Verified:** tsc ✅, lint ✅. Web render with **mocked CMS responses** (Puppeteer request interception: session +
6 orgs in the reference colours, Cobalt with a broken logo URL): picker → Beryllium → red portal + red wordmark →
Switch → picker; single org → straight in, no switch button; orange org → orange wordmark, white-on-orange banner.

**Gotcha:** `CI=1 npx expo start` turns **off** Metro's file watching. Two runs tested a stale bundle before
this was spotted. Restart Metro after edits when scripting.

**Not yet:** real org logos from the CMS on a device; acting-adviser orgs for strict advisers (see docs/04).

**Next:** the portal home for the active org (web `app/portal/[adviceId]/page.tsx`).

---

## 2026-10-01 — Adviser portal audience + org theming engine (colour + logo per org)

**Decision (user):** the app is for the **adviser site** (web `/portal/[adviceId]`), not the back office.
After sign-in the app uses the **organisation's theme colour**, and the **logo changes to the org's logo**,
like the web portal. This also settles the open "admin dashboard vs portal home" question: the dashboard is
the portal home. New doc: **[07-ORG-THEMING.md](07-ORG-THEMING.md)**.

**Researched (live CMS):** `Advice.colorTheme` (hex, nullable) paints the portal nav
(`?? "#0B2D6F"`), the home sections get a `themeColor` prop, tints are hex-alpha (`${themeColor}1a`).
`Advice.logo` (S3 URL) goes in the nav with an initials-tile fallback. `GET /api/advice/my` already returns
`{ id, name, colorTheme, logo }`, so **no backend change is needed**.

**Did:**
- `src/lib/org-theme.ts`: pure engine. hex → `{ base, onBase, text, pressed, soft, line, gradient,
  cssVars }`, hex validation, WCAG contrast picks white vs ink on the colour and darkens pale colours
  for text on white.
- `src/providers/org-theme-provider.tsx`: active org persisted in SecureStore (`ninjacms_active_org`),
  **keyed to userId**. `<OrgThemeScope>` applies NativeWind `vars()`, so `bg-primary` / `bg-accent` /
  `bg-secondary` recolour per org. `(app)/_layout.tsx` is wrapped in it.
- `src/components/org-logo.tsx` (expo-image, disk cache, initials fallback like PortalNav),
  `src/api/advice.api.ts` `useMyOrgs()`, `qk.myOrgs()`, `types/advice.types.ts`.
- Docs: 07 (new), 01 (audience + roadmap), 03 (two brand layers), 05, README, HANDOVER, AGENTS.md rule.

**Decisions:**
- Signed-out screens stay **Ninja CMS branded**: the org is unknown before sign-in, and the native splash
  is static.
- Default org colour **`#0B2D6F`** (web layout/nav), not `lib/portal.ts`'s `#1e3a5f` (web home). The
  web is inconsistent; we follow what frames every portal page.
- Only the brand tokens are org-driven; neutrals stay neutral so any org colour stays readable.
- **CLS grey `#8A8585` gets dark ink text** (4.6:1). The web uses white (3.7:1, fails AA for body text).

**Verified:** tsc ✅, lint ✅. Engine checked against all four entity colours plus pale/short/invalid input
(table in docs/07 §3), all ≥ 4.5:1.

**Next:** org selection after sign-in (0 / 1 auto / many → picker) → portal home in the org's theme.

---

## 2026-09-30 — Logo: small "CMS" like the PRM mark

**Did:** rebuilt `assets/images/ninja-cms-logo.png` from the user's PRM reference (1080×1080, small "PRM"
above the J–A). The first version had a big "CMS" filling the top-right (copied from PRM's 600px
`logo.png`). Now it's **Montserrat Bold "CMS"** at PRM's exact size and position (cap 77px, baseline 401,
left edge on the J), with the orange turned transparent. 838×464, shown at 120×66. Details in docs/03 §5.

**Why Montserrat Bold:** measured, not guessed. At cap height 77, Montserrat's P stem is 15 / **18** / 21px
for SemiBold / **Bold** / ExtraBold, and the word "PRM" is 245 / **248** / 252px. The reference is 18px /
249px, so it's Bold.

**Gotcha:** `TaskStop` on a background `npx expo start` only kills the npx wrapper — Metro kept port 8099.
Kill it by PID (`Get-NetTCPConnection -LocalPort 8099`).

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
