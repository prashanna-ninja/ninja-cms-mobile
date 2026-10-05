# 11 — Navigation (tabs)

Built 2026-10-05.

## 1. Route tree

```
src/app/
├── _layout.tsx               providers + session guard: (app) ⇄ (auth)
├── (auth)/                   sign-in, forgot-password            — Ninja CMS brand
└── (app)/
    ├── _layout.tsx           org gate (docs/07): (tabs) ⇄ select-org, + OrgThemeScope
    ├── select-org.tsx        org picker (2+ orgs)
    └── (tabs)/
        ├── _layout.tsx       bottom tabs, org-coloured
        ├── index.tsx         Dashboard — welcome banner + Notices (docs/09)
        ├── clients.tsx       Clients    — placeholder ("Coming soon")
        ├── workflows.tsx     Workflows  — placeholder
        ├── revenue.tsx       Revenue    — placeholder
        └── settings.tsx      Settings   — member card, org, account, app, sign out, delete account
```

URLs: `/` (Dashboard), `/clients`, `/workflows`, `/revenue`, `/settings`, `/select-org`, `/sign-in`, `/forgot-password`.

## 2. Tab bar

- `Tabs` from **`expo-router/js-tabs`** (SDK 57 moved JS tabs there; the root `Tabs` export is deprecated).
  We don't use NativeTabs: they're still `unstable` in SDK 57, and JS tabs take lucide icons and any tint
  colour directly.
- Active tint = **`theme.logoTint`** (the org colour, darkened only if it's too pale for the white bar);
  inactive `#8A97B5`; white bar with a `#E2E8F2` hairline; labels Bricolage 500 11pt.
- Icons (lucide): Dashboard `layout-dashboard`, Clients `users`, Workflows `workflow`, Revenue `chart-line`,
  Settings `settings`.
  The focused icon gets a heavier stroke.
- `sceneStyle` = `#F0F4FB` (= `bg-background`) so switching tabs never flashes.
- **Custom `tabBarButton` (`TabButton`), no ripple.** React Navigation's default tab button uses
  `android_ripple: { borderless: true }` (BottomTabItem.js). A borderless ripple isn't clipped to the button, so it
  spread as a "big bubble" over the bar on every tap (reported 2026-10-05). `TabButton` drops the ripple/hover/href/ref
  props and dims to 0.55 while pressed (a hand-tracked pressed state, since NativeWind drops function styles).
- **Bar sizing:** `height: 62 + insets.bottom`, `paddingTop: 4`, `paddingBottom: insets.bottom + 2`, and
  `TabButton` uses `paddingVertical: 2`. The button holds a fixed 28pt icon box, and the default 5pt padding left
  the label ~7–9pt tall with `overflow: hidden`, which clipped Bricolage's descenders (the "g" in Settings).
  Measured in the DOM, not guessed. `tabBarItemStyle` padding goes on the outer wrapper and doesn't help.
- `headerShown: false`; every tab renders **`<AppHeader />`** (`components/app-header.tsx`): the org-tinted
  CMS NINJA wordmark plus the user's **initials avatar → Settings** (sign out moved to Settings, 2026-10-05).

## 3. Placeholders

`components/coming-soon.tsx` → `<ComingSoon title icon headline description features />`: a page title, then
an org-tinted card (icon tile, "Coming soon" pill, one-line pitch, the 3 things the tab will hold). Copy maps to
the web portal sections:

| Tab | Web source | Will hold |
|---|---|---|
| Clients | `/portal/[adviceId]/client-records` (+ clients, groups) | search/browse, profiles + notes + files, groups/tags |
| Workflows | `/portal/[adviceId]/workflows` (+ pipeline boards) | workflows + stages, clients per stage, checklists/comments |
| Revenue | `/portal/[adviceId]/my-revenue` | totals/trends, transactions, revenue by client |

## 4. Settings tab (`(tabs)/settings.tsx`)

Design: refined and restrained, in the app's language (Bricolage, light surfaces, the org colour as accent),
with one memorable piece. Staggered `FadeIn` on open.

- **Member card** (`components/settings/member-card.tsx`): an org-gradient "pass" with the org logo, a
  letter-spaced role tag, an initials monogram, name + email, and "ADVISER PORTAL · {org}". Faint concentric rings
  top-right reuse the web `PortalNav` motif.
- **Organisation**: current org (colour swatch) + **Switch organisation** (only with 2+ orgs → `setOrg(null)`).
- **Account**: email, role (`lib/user-display.ts` labels), **Profile & password** → opens the web
  `/portal/[adviceId]/settings` in the in-app browser (profile/password editing stays on the web for now).
- **App**: version + build (`expo-application`; build = the EAS/TestFlight build number). (The server row was
  removed 2026-10-05 at the user's request.)
- **Sign out**: a calm destructive button (red text, a soft red wash when pressed) with a confirm alert.
- **Delete account** (below Sign out, quieter): confirm → a pre-filled `mailto:` **deletion request** to
  `SUPPORT_EMAIL` (`constants/env.ts`) with the account email, name and org; if there's no mail app, an alert
  shows the address. Same pattern as Ninja CRM mobile: accounts are org-provisioned, and the records belong to
  the organisation, so our team processes the request. ⚠️ `SUPPORT_EMAIL` is **temporarily the Ninja CRM
  inbox** (`support@ninjacrm.com.au`) — change before App Store submission.
- Footer: muted wordmark + "Ninja CMS · v{version} ({build})".
- Building blocks: `components/settings/settings-group.tsx` (`SettingsGroup` titled inset group, `SettingsRow`:
  org-tinted icon tile, label/caption, value, chevron or external glyph, hand-tracked pressed state).

## 5. Later

- **Hide tabs per user.** The web shows these portal sections only when the user's CMS flags allow:
  `clientRecordsEnabled`, `workflowsEnabled`, `revenueVisibilityEnabled` (on `User`; not in the session yet,
  so they need `GET /api/me` or a session field). Expo Router: `href: null` on a `Tabs.Screen` hides it.
- In-app profile/password editing (today: the web portal settings page), theme toggle.
- Stacks inside tabs (e.g. `clients/[id]`) → turn `clients.tsx` into `clients/_layout.tsx` + `index.tsx`.
