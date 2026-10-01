# 07 — Org Theming (colour + logo per organisation)

Researched 2026-10-01 against the live CMS (`../cms`, HEAD `1271309`).

> **The rule:** this app is the **adviser portal** on mobile (the web `/portal/[adviceId]`), **not** the
> back office. Once an organisation is chosen after sign-in, the signed-in app wears **that org's colour
> and logo**, the same way the web portal does. Nothing org-specific may be hard-coded. Every brand colour
> behind sign-in comes from the active org's theme.

## 1. What the web portal does

| Thing | Where it lives (CMS) | Web behaviour |
|---|---|---|
| Org colour | `Advice.colorTheme` (`String?`, hex), set per org in back office `/manage-advice` | Nav background: `advice.colorTheme ?? "#0B2D6F"` (`app/portal/[adviceId]/layout.tsx`, `_components/PortalNav.tsx`). Home sections take a `themeColor` prop (`app/portal/[adviceId]/page.tsx`). |
| Tints | inline styles | Hex-alpha on the org colour, e.g. `borderColor: \`${themeColor}1a\`` (`WelcomeBanner.tsx`). |
| Org logo | `Advice.logo` (`String?`, S3 URL) | `<img>` in the nav, 36px high, `object-contain`. **No logo → initials tile** (`rgba(255,255,255,0.15)` bg, white initials) + the org name split over two lines. |
| Practice logo | `User.practiceLogo` (adviser's own practice) | Shown in the adviser menu (not the org logo). Hidden for `onboarding`. |
| Active org | URL `/portal/[adviceId]` + `localStorage["portal_advice_id"]` | 0 memberships → "No organisations assigned"; 1 → auto-redirect; >1 → org picker (`OrgSwitcher`, `OrgCard`). "Switch org" clears the key. |
| Default colour | — | ⚠️ The web is inconsistent: the layout/nav use `#0B2D6F`, but `lib/portal.ts` `DEFAULT_THEME_COLOR` is `#1e3a5f` (the home page). **Mobile uses `#0B2D6F`**, which is what frames every portal page. |

**API (all already exist, no backend changes needed):**

| Endpoint | Gives |
|---|---|
| `GET /api/advice/my` | `[{ id, name, colorTheme, logo }]` — my orgs (admins: all) |
| `GET /api/portal/[adviceId]` | `{ name, logo, colorTheme, … articleGroups, quickLinkCategories }` — membership-checked |

## 2. Two brand layers on mobile

| Layer | Screens | Colour | Logo |
|---|---|---|---|
| **Ninja CMS brand** (fixed) | Splash, boot hold, sign-in, forgot password | Navy `#0B2D6F` / blue `#1A4DB3` (`components/login/auth-palette.ts`) | `assets/images/ninja-cms-logo.png` |
| **Org brand** (variable) | Everything behind sign-in, once an org is active | `Advice.colorTheme` → theme engine | `Advice.logo` → `<OrgLogo>` (initials fallback) |

Why the sign-in screen is not org-themed: we don't know the org until the user has signed in and
picked one. The native splash is a static asset, so it can't be org-coloured either.
*(Possible later: tint the boot hold with the remembered org's colour.)*

## 3. How it's built (implemented 2026-10-01)

```
GET /api/advice/my ──► pick org (auto if 1, picker if >1) ──► setOrg(org)
                                                                │
                      OrgThemeProvider  ◄───────────────────────┘
                      ├─ org      (persisted in SecureStore "ninjacms_active_org", keyed to userId)
                      └─ theme = buildOrgTheme(org.colorTheme)
                               │
   (app)/_layout ── <OrgThemeScope> ── vars(theme.cssVars) ──► every bg-primary / text-primary /
                                                               bg-accent / bg-secondary class recolours
```

| File | Job |
|---|---|
| `src/lib/org-theme.ts` | **Pure theme engine.** `buildOrgTheme(colorTheme)` → `{ base, onBase, text, pressed, soft, line, gradient, isDefault, cssVars }`. Validates hex (`#abc`, `#aabbcc`, `aabbcc`; anything else → default). |
| `src/providers/org-theme-provider.tsx` | `OrgThemeProvider` (active org + theme, persisted), `useOrgTheme()`, `<OrgThemeScope>` (applies `vars()`). |
| `src/components/org-logo.tsx` | Org logo (expo-image, disk-cached) or the initials tile — for org-coloured headers. |
| `src/api/advice.api.ts` | `useMyOrgs()` → `GET /api/advice/my` (`qk.myOrgs()`). |
| `src/types/advice.types.ts` | `OrgSummary`, `ActiveOrg`. |

**What `cssVars` overrides** (the tokens in `src/global.css`):

| CSS var | Becomes | Used for |
|---|---|---|
| `--primary`, `--ring` | org colour | filled buttons, active tab, focus |
| `--primary-foreground` | white **or** ink, whichever contrasts better | text on buttons |
| `--accent` / `--accent-foreground` | org colour / on-colour | headers, heroes (like the web nav) |
| `--secondary` / `--secondary-foreground` | 10% tint / readable org text | chips, soft buttons, icon tiles |

Everything else (background, cards, muted, borders, destructive) stays neutral, so the app stays
readable whatever colour an org picks.

**Readability guarantees** (checked against the real entity colours on 2026-10-01):

| Org colour | Text on it | Org-coloured text on white |
|---|---|---|
| Cobalt `#0B2D6F` | white, 13.0:1 | as-is, 13.0:1 |
| Beryllium `#6B1424` | white, 12.0:1 | as-is, 12.0:1 |
| AIAFSL `#1E3A5F` | white, 11.5:1 | as-is, 11.5:1 |
| CLS `#8A8585` | **ink**, 4.6:1 (the web uses white, 3.7:1) | darkened → `#717077`, 4.9:1 |
| pale yellow `#FFE066` | ink, 13.0:1 | darkened → `#6E6A4E`, 5.5:1 |

## 4. Rules for every screen we build

1. **Never hard-code a brand colour behind sign-in.** Use classes (`bg-primary`, `text-primary`,
   `bg-accent`, `bg-secondary`, `border-ring`) or `useOrgTheme().theme` for props that can't take a class
   (gradients, icon `color`, `StatusBar`, `ActivityIndicator`).
2. Text **on** the org colour → `text-primary-foreground` / `theme.onBase` (never assume white).
   Org-coloured **text on white** → `theme.text` (never `theme.base`; it may be too pale).
3. Tints → `theme.soft` / `theme.line` (solid, pre-mixed). NativeWind alpha on themed colours
   (`bg-primary/10`) is unreliable, so don't use it.
4. Headers show `<OrgLogo>` on `bg-accent` (or `theme.gradient`).
5. The neutral `auth-palette.ts` is **only** for the signed-out screens.
6. Switching org = `setOrg(next)` + invalidate org-scoped queries (portal data is per `adviceId`).
7. Sign-out leaves the stored org on the device, but it is keyed to `userId`, so a different user never
   sees it. The same user signing back in gets their org straight away.

## 5. Status

- ✅ Theme engine, provider, scope, `OrgLogo`, `useMyOrgs` (2026-10-01). `(app)` is wrapped in `OrgThemeScope`.
- ⬜ **Org selection** — after sign-in: `useMyOrgs()` → 0 orgs: "No organisations assigned" screen /
  1 org: `setOrg` automatically / >1: org picker (web `OrgSwitcher`) → `setOrg`. **Next step, together with
  the dashboard (portal home).**
- ⬜ Header with `<OrgLogo>` + "switch org" (web PortalNav).
- ⬜ Acting-adviser cookie (`portal-acting-adviser`) for strict advisers — affects which orgs/membership
  apply (docs/01 §3).
- ⬜ Practice logo (`User.practiceLogo`) in the profile/menu.
- ⬜ Optional: boot hold in the remembered org's colour.
