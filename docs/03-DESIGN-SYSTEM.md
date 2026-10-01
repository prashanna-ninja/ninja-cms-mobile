# 03 — Design System

> **Status (2026-09-30):** first pass implemented in `src/global.css` + `tailwind.config.js`
> (light + dark HSL tokens below). Tune on device during the login step; update this doc when they change.

## 1. Brand

- Product name: **Ninja CMS** (web metadata: *"Adviser portal and content management platform"*).
- Portal wordmark: **NINJA CMS / PORTAL** (`app/portal/page.tsx`).
- Multi-brand: each licensee **entity** has its own colour + logo (`lib/entity-config.ts`), and each
  org (`Advice`) can override the theme colour (`Advice.colorTheme`, fallback `#1e3a5f` in `lib/portal.ts`).
  ➜ The mobile app uses the neutral **Ninja CMS navy** for the chrome and applies an org's colour only
  inside org-scoped screens (later).

| Entity | Colour | Logo (`ref/cms/public`) |
|---|---|---|
| Cobalt | `#0B2D6F` | `logo-black.png` |
| Beryllium | `#6B1424` | — |
| AIAFSL | `#1e3a5f` | — |
| CLS | `#8a8585` | `cls.png` |

### ⭐ Two brand layers (decided 2026-10-01)

| Layer | Where | Source |
|---|---|---|
| **Ninja CMS brand** (fixed) | splash, boot, sign-in, forgot password | navy/blue below + `auth-palette.ts`, CMS NINJA logo |
| **Org brand** (variable) | everything behind sign-in | `Advice.colorTheme` + `Advice.logo` of the active org |

The tokens in §3/§4 are the **defaults**. Behind sign-in, `--primary`, `--ring`, `--accent` and
`--secondary` (+ their foregrounds) are **overridden at runtime per org** with NativeWind `vars()`.
**Never hard-code a brand colour in a signed-in screen.** Full rules: [07-ORG-THEMING.md](07-ORG-THEMING.md) §4.

## 2. Fonts

- Web uses **Bricolage Grotesque** (400–800) for everything (`app/layout.tsx`, `next/font/google`).
- Mobile: `@expo-google-fonts/bricolage-grotesque` (same family as the CRM's display font), loaded
  with `expo-font`. Keys must match the Tailwind `fontFamily` names.

## 3. Colour tokens (portal palette — hard-coded inline in the web portal)

| Token | Light | Use |
|---|---|---|
| `primary` | `#1A4DB3` | buttons, links, active tab |
| `navy` (accent) | `#0B2D6F` | hero / header background, splash |
| `primary-light` | `#4A7AD4` | gradients, highlights |
| `background` | `#F0F4FB` (screens) / `#FFFFFF` (cards) | |
| `foreground` | `#0D1B3E` | body text |
| `muted-foreground` | `#7089B8` | secondary text |
| `chip` / `secondary` | `#E8F0FD` | chips, soft buttons |
| `destructive` | `oklch(0.577 0.245 27.325)` ≈ `#E7000B` | errors |

Hero gradient on the web: `#0B2D6F → #1A4DB3 → #4A7AD4`.
Back-office UI is stock shadcn neutral (`app/globals.css`, radius `0.625rem`).

## 4. Tailwind mapping (same approach as the CRM)

Implemented HSL values (`src/global.css`): primary `220 75% 40%`, accent `220 82% 24%`, background
`218 58% 96%`, foreground `223 65% 15%`, muted-foreground `219 34% 58%`, secondary `217 84% 95%`,
radius `0.625rem`. Fonts: `font-sans` (400), `font-sans-medium`, `font-sans-semibold`, `font-display` (700).


- `global.css` defines `:root { --primary: …; }` as HSL channels + a dark set.
- `tailwind.config.js` maps `primary: "hsl(var(--primary))"` etc., `nativewind/preset`.
- ⚠️ CRM lesson: alpha modifiers on themed colours (`bg-primary/10`) are unreliable in NativeWind —
  use solid tokens.

## 5. Auth screens (always light, brand-forward)

`src/components/login/auth-palette.ts` is deliberately **not** the themed tokens (same rule as Ninja PRM).
Layout copied from Ninja PRM/CRM: gradient hero → white sheet overlapping by 24px with a 28px top radius →
invite-only footer pinned to the bottom.

| Token | Value |
|---|---|
| hero gradient | `#1A4DB3` → `#0B2D6F` (top-left → bottom-right) |
| ink / inkSoft / muted | `#0D1B3E` / `#4A5878` / `#6B7A99` |
| line / fieldBg | `#E2E8F2` / `#F8FAFD` |
| brand / pressed / soft | `#1A4DB3` / `#153F94` / `#E8F0FD` |
| danger / dangerSoft | `#DC2626` / `#FEF2F2` |

**Logo:** `assets/images/ninja-cms-logo.png` — white "CMS NINJA" wordmark, **838×464** (≈1.81:1),
transparent, shown at **120×66** in the hero (`auth-hero.tsx`). There was no CMS logo anywhere, so it was
built from the Ninja PRM square mark (the user's 1080×1080 orange reference):
- Orange → transparent: alpha taken from the blue channel (bg 22 → 0, white 255 → 255), so the
  anti-aliasing is kept.
- "PRM" erased and replaced by **"CMS" in Montserrat Bold** — measured to match the original exactly
  (18px stem, 248 vs 249px word width at cap height 77). Same cap height (77px), baseline (y=401) and left
  edge (aligned to the **J**, x≈655) as "PRM": small letters over the J–A.
- Cropped tight around the artwork (+8px).

⚠️ Replace it with an official asset from design if one appears. The build script is not in the repo; the
steps above are enough to redo it (sharp + opentype.js + @expo-google-fonts/montserrat).

## 6. Dark mode

Planned: light by default, manual toggle persisted in SecureStore (CRM pattern), defined when we
build Settings.
