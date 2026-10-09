# Ninja CMS Mobile — Handover

The single entry point for whoever picks this up next: what works, how to run it, what not to undo,
and what to build next. Keep it current at the end of every step.

> ⭐ **This is the ADVISER PORTAL app** (web `/portal/[adviceId]`). Behind sign-in the app takes on the active
> organisation's **colour and logo** (`Advice.colorTheme` / `Advice.logo`). Read
> [docs/07-ORG-THEMING.md](docs/07-ORG-THEMING.md) before building any signed-in screen.

> **Status (2026-10-09):** ✅ Login + org selection, portal home (Notices), **Clients** (list + full client record,
> add / edit / archive / delete, fact find edit + PDF), **Workflows** (list, board, add client, client on a board,
> new workflow from templates), **Revenue** (My Revenue + Map Clients), Settings, per-org app icons (iOS + Android).
> ⚠️ Most features were verified with mocked CMS responses on web. See §8 for the device-test checklist.

## 1. What works today

- **Sign in** (`src/app/(auth)/sign-in.tsx`) — email + password, PRM/CRM design in CMS navy, CMS NINJA
  logo, show/hide password, field + server errors, "Forgot password?" link. See [docs/06-AUTH.md](docs/06-AUTH.md) §6.
- **Forgot password** (`(auth)/forgot-password.tsx`) — sends the CMS reset email; "check your inbox" state.
- **Keyboard avoidance** on both auth screens — focused field + button stay above the keyboard (iOS + Android,
  Expo Go). ⚠️ Needs a device check.
- **Session guard** — `Stack.Protected` in `src/app/_layout.tsx`, session from `providers/session-provider.tsx`.
- **Org theming** — `lib/org-theme.ts` + `providers/org-theme-provider.tsx`: the active org's colour
  overrides the NativeWind tokens across `(app)`; the CMS NINJA wordmark is **tinted the org colour**
  (Ninja CMS blue before an org is chosen); `<OrgLogo>` shows the org's own logo or initials.
- **Org selection** (`(app)/_layout.tsx` gate) — `GET /api/advice/my`: 1 org → straight in; 2+ → **picker**
  (`(app)/select-org.tsx`, web-style coloured cards); 0 → "No organisations assigned"; editor/user → "use the
  web". Remembered per user; "Switch organisation" on the home banner when 2+.
- **Bottom tabs** (2026-10-05) — Dashboard (welcome banner + Notices) · Clients · Workflows · Revenue · **Settings**,
  tinted in the org colour. Shared `AppHeader`
  (wordmark + initials avatar → Settings). docs/11-NAVIGATION.md.
- **Clients tab = Client Records** (2026-10-05) — shown only to users the CMS allows (403 → hidden); list with
  search-as-you-type, Active/Archived, type/tag/source sheets, infinite scroll, pull to refresh; **+** → Add client;
  tap → the client record (below). docs/12-CLIENTS.md.
- **Client detail** (2026-10-07) — header card + 7 sections: Overview (contact, details, editable source, partner
  link/unlink, tags, workflows + add to workflow), Revenue (gated by 403), Fact Find (edit per section + Generate PDF → share sheet, web config ported), Files (upload /
  open / rename / delete), File Notes (add / delete), Ongoing client (record consent, set review), Activity Log. **Add client, Edit,
  Archive / Restore, Delete** (staff: edit only). docs/12 §6.
- **Workflows tab** (2026-10-08) — access-gated like Clients; list (yours + shared) → board as a **stage rail +
  swipeable stage pages** → Add client (existing / create new) → client on a board (move stage, assign, due date,
  checklists, to-dos, comments, remove). **New workflow** (fresh / licensee template / copy a shared template) and
  **Add a stage**; other structure editing stays on the web. docs/13-WORKFLOWS.md.
- **Revenue tab** (2026-10-09) — the user's own revenue (`/api/my-revenue/*`, not org-scoped), hidden on 403. My Revenue:
  org-coloured statement card (gross, net, txns, clients), "N accounts not mapped" nudge, search + date / licensee / sort
  sheets, a month-grouped ledger; tap a transaction → map its account. **Map Clients:** progress, All / Mapped / Unmapped,
  account cards → map / change / unmap. docs/14-REVENUE.md.
- **Settings** — org member card, organisation (switch), account (email, role, web profile/password), app
  version/build, **sign out** (moved here from the header), **delete account** (confirm → pre-filled email
  request to support, the CRM pattern).
- **Notices on the portal home** — `GET /api/notices?adviceId=` + each notice's content; org-coloured cards
  (NEW badge, Brisbane dates, image/attachment counts), expand to read, filter chips + sort, pull to refresh.
  Content is rendered natively (rich text, images, documents, buttons, video/form links) by the reusable
  `components/content/*`. docs/09-NOTICES.md.
- **Per-org home-screen icon (iOS + Android)**. Android uses our own launcher aliases since 2026-10-07
  (`modules/ninja-app-icon` + `plugins/with-android-icon-aliases.js`; `.MainActivity` is never disabled; docs/08 §6). 7 icons generated in code (org colour + white CMS NINJA wordmark, default
  login blue); the icon follows the active org (iOS: at once, Android: on next background). Also the real
  app icon/splash now. ⚠️ Needs a **development build** — no-op in Expo Go. docs/08-APP-ICONS.md.
- Backend verified: the CMS accepts `ninjacms://` and Expo Go `exp://` origins (401 on bad creds, not 403).
- TanStack Query client with app-foreground refetch (`focusManager` ↔ `AppState`) and offline pause
  (`onlineManager` ↔ `expo-network`) — `src/lib/query-client.ts`, `src/providers/query-provider.tsx`.
- Query-key factory `src/lib/query-keys.ts`; `cn()` in `src/lib/utils.ts`; `Screen` / `Container` shells.
- Verified 2026-10-09: `npx tsc --noEmit` ✅, `npx expo lint` ✅, `npx expo-doctor` 20/20 ✅ (Expo 57.0.27).
  The user has run it on Android + iOS dev builds (login, icons, clients). Newer features still need a device pass (§8).

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

## 4. Building & releasing

- **Local dev build (Mac, iOS Simulator):** `npm run ios:dev` (= `npx expo run:ios`). After native config
  changes: `npx expo prebuild --clean --platform ios` first.
- **TestFlight (iOS, internal, no review):** `npm run release:ios` — EAS cloud build with the production env,
  then auto-submit. Full runbook + one-time setup (`eas init`, Apple credentials): **[docs/10-RELEASE-IOS.md](docs/10-RELEASE-IOS.md)**.
- Env: local `.env` = dev only and **never uploaded** (`.easignore`); store/preview builds get
  `EXPO_PUBLIC_API_BASE_URL=https://login.cobaltlicenseesolutions.com.au` from `eas.json`, and `app.config.ts`
  fails a release build without an https URL.

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
6. **No function `style` on `Pressable`** — see 17.
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
13. **Logos + app icons are generated** — wordmark: `node scripts/build-wordmark.mjs` (`CAP_HEIGHT`); icons: edit
    `src/constants/app-icons.json`, run `node scripts/generate-app-icons.mjs`,
    never hand-edit `assets/app-icons/`. Alternate icons are native: **rebuild** after changing the list. docs/08.
14. **New native module ⇒ rebuild the dev app** (`npx expo prebuild --clean && npx expo run:ios|android`). The register
    and rebuild log are in docs/02 §6. The latest native changes are the **local module `modules/ninja-app-icon` + the
    `plugins/with-android-icon-aliases.js` manifest plugin** (2026-10-07) and **expo-sharing** (2026-10-06).
    After `npx expo prebuild`, also check `git diff package.json`, since it rewrites the android/ios scripts.
    Test app icons with a **dev build** (`npm run ios:dev` on a Mac / `npm run android:dev`), never Expo Go;
    `expo start` now targets the dev build (press `s` for Expo Go).
    **Changed app.json / app.config.ts / app-icons.json / a native package? → `npx expo prebuild --clean`
    before `npx expo run:ios|android`** — otherwise the dev build runs a stale native project (template icon,
    missing modules).
15. **Opening a system screen from the app** (picker, share sheet, browser): wrap it in `holdAppIconSwitch()` from
    `src/lib/app-icon.ts`. Otherwise the Android icon switch runs on "background" and breaks it (docs/08 §6).
16. `apiFetch` must use `credentials: "omit"` and send
   the cookie manually; signing out on 401, not on 403.
17. **Never `style={({ pressed }) => …}` on `Pressable`.** NativeWind drops function styles on native (the button
    renders unstyled or white, though web looks fine). Track pressed state with `onPressIn` / `onPressOut` instead, like `PillButton` and
    `HeaderAddButton` (`src/components/header-add-button.tsx`).

## 8. Loose ends & what to build next

> ⏰ **REMINDER (user asked, 2026-10-05):** `SUPPORT_EMAIL` in `src/constants/env.ts` is temporarily
> **`support@ninjacrm.com.au`** (the CRM inbox) for delete-account requests. **Change it to the Ninja CMS / Advice
> Ninja support inbox before the App Store submission.**

1. ✅ Foundation.
2. ✅ Login + session guard (backend expo plugin ✅). ⚠️ Test a real sign-in on iOS + Android.
3. ✅ Forgot password.
4. ✅ **Org selection** + org theme + tinted wordmark. ⚠️ Check with real org logos on a device.
5. ✅ Per-org app icons (⚠️ verify on a dev build: iOS alert, Android switch on background).
6. ✅ **EAS** — `eas.json` profiles, `.easignore`, production env + guard (2026-10-02). ⬜ `eas init` + first
   TestFlight build (needs your Expo/Apple logins) — docs/10-RELEASE-IOS.md §2–3.
7. 🚧 **Portal home** — Notices ✅; next: quick links, events, … → proper dashboard. ⚠️ Check real notices on a device.
8. ✅ Tabs. ✅ Clients: list, record (7 sections), add / edit / archive / delete, add to workflow, fact-find edit + PDF
   (docs/12). ✅ Workflows: list, board, add client, client on a board, new workflow from templates, add a stage
   (docs/13; later maybe: checklist-item assignee / due editing, shared checklist templates, the Summary).
9. ✅ **Revenue tab** — My Revenue + Map Clients (docs/14). Later maybe: product filter (needs a CMS API for the
   provider list). Tell the CMS team: the web's "Save" when changing a mapped account's client fails with 404 (docs/14 §3).
10. ⬜ **Next:** ask the user. Candidates: the Dashboard (quick links, events), or more Workflows editing.

**Device-test checklist** (built + mock-tested, not yet confirmed on a phone):
- Android per-org icon switches after leaving the app; launching via `expo run:android` still works.
- File upload on Android (picker no longer stuck); Generate PDF → share sheet (iOS + Android).
- Fact-find section editor with the keyboard; the Save button in the header.
- Workflows: swiping between stage pages; add client; move stage; ticking checklists.
- Revenue: statement card with a pale and a dark org colour; date / licensee sheets; map / change / unmap an account
  (the custom date range opens a calendar sheet inside a sheet: check it on iOS).
- Confirm alerts (archive / delete client, remove from workflow, discard fact-find changes): they don't render on web.

**Rebuild needed?** The last native changes are listed in docs/02 §6. A dev build made before 2026-10-09 should be
rebuilt once to pick up the Expo patch updates (`npx expo prebuild --clean && npx expo run:ios|android`).

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
| `src/app/(app)/(tabs)/*` | bottom tabs: Dashboard (index), clients, workflows, revenue, settings |
| `src/components/app-header.tsx`, `src/components/coming-soon.tsx` | shared app bar (avatar → Settings); tab placeholder |
| `src/app/(app)/(tabs)/settings.tsx`, `src/components/settings/*`, `src/lib/user-display.ts` | Settings tab |
| `src/app/(app)/(tabs)/clients/*`, `src/api/clients.api.ts`, `src/components/clients/*`, `src/lib/clients.ts` | Client Records |
| `src/api/client-detail.api.ts`, `src/components/client-detail/*`, `src/lib/fact-find/*`, `src/lib/format.ts` | client detail (7 sections) |
| `src/app/(app)/(tabs)/clients/{new,edit,fact-find}.tsx`, `src/components/clients/client-form.tsx`, `src/schemas/client.schema.ts` | add / edit client, fact-find section editor |
| `src/app/(app)/(tabs)/workflows/*`, `src/api/workflows.api.ts`, `src/components/workflows/*`, `src/lib/workflows.ts`, `src/types/workflow.types.ts` | Workflows tab |
| `src/app/(app)/(tabs)/revenue/*`, `src/api/revenue.api.ts`, `src/components/revenue/*`, `src/lib/revenue.ts`, `src/types/revenue.types.ts` | Revenue tab (My Revenue, Map Clients) |
| `src/components/flash-note.tsx` | short confirmation toast |
| `src/components/header-add-button.tsx`, `src/components/forms/date-field.tsx` | shared "+" header tile; pure-JS date picker |
| `modules/ninja-app-icon/`, `plugins/with-android-icon-aliases.js` | Android per-org icons (local native module + manifest plugin) |
| `src/app/(app)/select-org.tsx`, `src/components/orgs/*` | org picker, card, gate states |
| `src/lib/roles.ts` | `canAccessPortal` (ported from CMS lib/staff.ts) |
| `src/constants/app-icons.json`, `scripts/generate-app-icons.mjs`, `assets/app-icons/` | per-org app icons (source, generator, output) |
| `app.config.ts` | release-env guard + registers alternate icons (on top of app.json) |
| `eas.json`, `.easignore` | EAS build profiles + production env; what gets uploaded (no `.env`) |
| `src/lib/app-icon.ts`, `src/hooks/use-org-app-icon.ts` | org → icon matching + switching |
| `src/api/notices.api.ts`, `src/components/notices/*` | Notices section |
| `src/components/content/*`, `src/schemas/grid-builder.schema.ts` | CMS content (grid-builder + rich text) renderer — reuse for articles |
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

## 12. Changing session (new chat) — the routine

When the user says they want to **change session / start a new chat**, do all of this without being asked again
(full checklist + prompt template: [docs/PROMPTS.md](docs/PROMPTS.md) § "Changing session"):

1. **Docs:** IMPLEMENTATION-LOG entry for anything unlogged; this file current (status line, §1, §7, §8, §9); feature
   docs (`docs/NN-*.md`) and the docs/02 §6 rebuild log up to date.
2. **Loose ends:** `npx tsc --noEmit`, `npx expo lint`, `npx expo-doctor` (fix patch drift with `npx expo install
   --fix`); `git status` clean (remove stray files, add ignores); stale TODOs/claims fixed; commit everything.
3. **Hand-off prompt:** give the user a ready-to-paste prompt for the new session (template in docs/PROMPTS.md).
