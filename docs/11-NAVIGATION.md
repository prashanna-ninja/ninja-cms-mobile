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
        └── revenue.tsx       Revenue    — placeholder
```

URLs: `/` (Dashboard), `/clients`, `/workflows`, `/revenue`, `/select-org`, `/sign-in`, `/forgot-password`.

## 2. Tab bar

- `Tabs` from **`expo-router/js-tabs`** (SDK 57 moved JS tabs there; the root `Tabs` export is deprecated).
  We don't use NativeTabs: they're still `unstable` in SDK 57, and JS tabs take lucide icons and any tint
  colour directly.
- Active tint = **`theme.logoTint`** (the org colour, darkened only if it's too pale for the white bar);
  inactive `#8A97B5`; white bar with a `#E2E8F2` hairline; labels Bricolage 500 11pt.
- Icons (lucide): Dashboard `layout-dashboard`, Clients `users`, Workflows `workflow`, Revenue `chart-line`.
  The focused icon gets a heavier stroke.
- `sceneStyle` = `#F0F4FB` (= `bg-background`) so switching tabs never flashes.
- `headerShown: false`; every tab renders **`<AppHeader />`** (`components/app-header.tsx`): the org-tinted
  CMS NINJA wordmark plus sign out.

## 3. Placeholders

`components/coming-soon.tsx` → `<ComingSoon title icon headline description features />`: a page title, then
an org-tinted card (icon tile, "Coming soon" pill, one-line pitch, the 3 things the tab will hold). Copy maps to
the web portal sections:

| Tab | Web source | Will hold |
|---|---|---|
| Clients | `/portal/[adviceId]/client-records` (+ clients, groups) | search/browse, profiles + notes + files, groups/tags |
| Workflows | `/portal/[adviceId]/workflows` (+ pipeline boards) | workflows + stages, clients per stage, checklists/comments |
| Revenue | `/portal/[adviceId]/my-revenue` | totals/trends, transactions, revenue by client |

## 4. Later

- **Hide tabs per user.** The web shows these portal sections only when the user's CMS flags allow:
  `clientRecordsEnabled`, `workflowsEnabled`, `revenueVisibilityEnabled` (on `User`; not in the session yet,
  so they need `GET /api/me` or a session field). Expo Router: `href: null` on a `Tabs.Screen` hides it.
- A Settings/profile tab or menu (sign out, switch org, theme), once there's more than sign out.
- Stacks inside tabs (e.g. `clients/[id]`) → turn `clients.tsx` into `clients/_layout.tsx` + `index.tsx`.
