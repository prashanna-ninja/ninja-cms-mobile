# Design — the default Ninja CMS blue (no organisation branding)

The same palette as the Ninja CMS app's sign-in and splash screens, before any organisation is chosen. The site
always uses this. It never takes on a licensee's colour.

## Colours

| Token | Hex | Use |
|---|---|---|
| `navy` | `#0B2D6F` | Hero background, footer background, headings on light |
| `brand` | `#1A4DB3` | Primary buttons, links, icons, focus ring |
| `brand-pressed` | `#153F94` | Button hover and active |
| `brand-light` | `#4A7AD4` | Gradient end, small highlights |
| `brand-soft` | `#E8F0FD` | Chips, icon tiles, soft section background |
| `page` | `#F0F4FB` | Page background between sections |
| `card` | `#FFFFFF` | Cards, the policy reading column |
| `ink` | `#0D1B3E` | Body text |
| `ink-soft` | `#4A5878` | Secondary text |
| `muted` | `#6B7A99` | Captions, footer small print |
| `line` | `#E2E8F2` | Borders, dividers |

- **Hero gradient:** `linear-gradient(135deg, #1A4DB3 0%, #0B2D6F 100%)`. An optional soft radial glow of
  `#4A7AD4` at about 25% opacity can sit in the top-right corner. The web portal's 3-stop version is
  `#0B2D6F → #1A4DB3 → #4A7AD4`.
- White text on `navy`, `brand` and the gradient. `ink` on white and `page`.
- Light theme only.

## Typography

- **Bricolage Grotesque** for everything (`next/font/google`, weights 400, 500, 600, 700).
- Hero `h1`: 700, `clamp(2.25rem, 5vw, 3.5rem)`, line-height 1.05, letter-spacing -0.02em.
- Section `h2`: 700, about 1.75rem. Card titles: 600, 1.125rem.
- Body: 400, 1rem to 1.0625rem, line-height 1.6. The privacy text column is at most 68ch wide.

## Shape and spacing

- Radius: cards 16px, buttons 12px, icon tiles 12px.
- The app's signature shape: the white content sheet **overlaps the hero by 24px**, with a **28px top radius**
  (like the sign-in screen). Use it on the landing page, where the first white section rises over the hero.
- Cards: white, 1px `line` border, a very soft shadow (`0 1px 2px rgb(13 27 62 / 0.06)`).
- Max content width 1120px, side gutter 16px on mobile and 24px from 768px up.
- Icons: **lucide** (`lucide-react`), 20–24px, `brand` on a `brand-soft` tile.

## Logo

- `assets/ninja-cms-logo-white.png`: the white "CMS NINJA" wordmark, 838×477 (aspect about 1.757), transparent.
  Use it **only on navy, brand or the gradient**. Hero width 160–200px, header and footer width 96–120px.
- For a light background, make a blue version by tinting the same PNG (CSS `mask-image` filled with `#1A4DB3`).
  Don't redraw it, and don't put the white PNG on a light background.
- `assets/app-icon.png` (1024²) can be shown in the hero as the app tile, at about 88px with a 22% radius.
- Favicon and apple-touch-icon: `assets/favicon.png` (resize as needed).

## Motion

A subtle fade-up on the hero text and cards when they enter (opacity 0→1, translateY 8px→0, 400ms, staggered by
60ms). Turn it off with `prefers-reduced-motion`. Nothing else moves.
