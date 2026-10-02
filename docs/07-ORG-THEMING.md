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
| **Ninja CMS brand** (fixed) | Splash, boot hold, sign-in, forgot password | Navy `#0B2D6F` / blue `#1A4DB3` (`components/login/auth-palette.ts`) | white CMS NINJA wordmark |
| **No org yet** | org loading, org picker, "no organisations" | Ninja CMS blue `#1A4DB3` | CMS NINJA wordmark **tinted Ninja CMS blue** |
| **Org brand** (variable) | Everything behind sign-in, once an org is active | `Advice.colorTheme` → theme engine | CMS NINJA wordmark **tinted the org colour** (`theme.logoTint`) in the app bar + the org's own logo (`<OrgLogo>`, initials fallback) on org-coloured banners |

**The CMS NINJA wordmark is recoloured, not swapped.** It's white-on-transparent, so `<NinjaCmsLogo color=…>`
(`components/brand/ninja-cms-logo.tsx`) tints it with expo-image `tintColor`: no tint on the sign-in hero,
Ninja CMS blue before an org is chosen, `theme.logoTint` after.

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

**Colour rules** (revised 2026-10-02 to match the web picker):
- **On the org colour** (`onBase`): **white, like the web**, because org logos are white artwork. It only
  switches to ink for genuinely pale colours (contrast with white < 2:1, `ON_BASE_WHITE_MIN`). Brand greens
  and oranges (~2.4–2.7:1) stay white, as they do on the web.
- **Org-coloured body text on white** (`text`): darkened until 4.5:1 (WCAG AA).
- **Wordmark tint on white** (`logoTint`): darkened only until 3:1 (WCAG large/graphical), so oranges and
  greens stay close to the real brand colour. Ninja CMS blue when the org has no colour.

| Org colour | On it | `text` on white | `logoTint` |
|---|---|---|---|
| Cobalt `#0B2D6F` | white 13.0 | as-is 13.0 | as-is |
| Beryllium `#6B1424` | white 12.0 | as-is 12.0 | as-is |
| AIAFSL `#1E3A5F` | white 11.5 | as-is 11.5 | as-is |
| CLS `#8A8585` | white 3.6 | `#717077` 4.9 | as-is (3.6) |
| An Independent green `#6DAE43` | white 2.7 | `#508242` 4.6 | `#639F43` 3.2 |
| What If orange `#FF8900` | white 2.4 | `#9E5D19` 5.2 | `#CF730C` 3.4 |
| pale yellow `#FFE066` | **ink** 13.0 | `#6E6A4E` 5.5 | darkened |
| none / invalid | white (default navy) | `#0B2D6F` | **Ninja CMS blue `#1A4DB3`** |

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

Verified 2026-10-02 on a web render with mocked CMS responses (Puppeteer request interception: a session +
6 orgs in the user's reference colours, one with a broken logo URL): picker → tap Beryllium → red portal →
Switch → picker; single org → straight in; orange org → orange wordmark + white-on-orange banner. ⚠️ Not yet
with real org logos from the CMS on a device.


- ✅ Theme engine, provider, scope, `OrgLogo`, `useMyOrgs` (2026-10-01). `(app)` is wrapped in `OrgThemeScope`.
- ✅ **Org selection** (2026-10-02) — the gate in `src/app/(app)/_layout.tsx`:

  | Case | Result |
  |---|---|
  | role is editor / user (`canAccessPortal` false, `lib/roles.ts`) | "This app is for the adviser portal" + sign out |
  | `GET /api/advice/my` loading, no remembered org | Ninja CMS blue logo + spinner |
  | request failed, no remembered org | "Couldn't load your organisations" + Try again + sign out |
  | 0 orgs | "No organisations assigned" (web copy) + sign out |
  | **1 org** | **auto-selected → straight into the portal (no picker)** |
  | 2+ orgs (admins: all orgs) | remembered org if still in the list, else **the picker** |
  | remembered org | straight in while the list refreshes; colour/logo/name re-synced, dropped if membership removed |

  Picker = `src/app/(app)/select-org.tsx` + `components/orgs/org-card.tsx`, a port of the web
  `OrgSwitcher`/`OrgCard`: light `#F0F4FB` background, 3px navy→blue gradient bar, blue CMS NINJA wordmark,
  "Select an Organisation" / "Choose an organisation to access your adviser portal", 2-column grid of
  org-coloured square cards (logo or first letter + name, translucent "View Portal →" pill), pull-to-refresh,
  sign out. Orgs are sorted by name. `Stack.Protected` flips `index` ⇄ `select-org` on `setOrg`.
- ✅ Temporary portal home (`(app)/index.tsx`): app bar with the org-tinted wordmark + sign out, org banner
  (gradient, `<OrgLogo>`, welcome, "Switch organisation" only when 2+ orgs).
- ⬜ Real portal home + header nav (web PortalNav).
- ⬜ Acting-adviser cookie (`portal-acting-adviser`) for strict advisers — affects which orgs/membership
  apply (docs/01 §3).
- ⬜ Practice logo (`User.practiceLogo`) in the profile/menu.
- ⬜ Optional: boot hold in the remembered org's colour.
