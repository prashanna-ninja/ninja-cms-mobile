/**
 * Org theming engine — turns an organisation's `Advice.colorTheme` (a hex string
 * set per org in the CMS, nullable) into the colours the app paints with.
 *
 * The CMS adviser portal does the same on the web: `advice.colorTheme ?? "#0B2D6F"`
 * paints the nav/banners (app/portal/[adviceId]/layout.tsx, PortalNav.tsx), and
 * tints are hex-alpha (`${themeColor}1a`). See docs/07-ORG-THEMING.md.
 *
 * Pure functions only — no React. The provider (providers/org-theme-provider.tsx)
 * calls `buildOrgTheme` and pushes `cssVars` into NativeWind with `vars()`, so
 * every `bg-primary` / `text-primary` / `bg-accent` / `bg-secondary` class
 * recolours per org without components knowing about orgs.
 */

/**
 * Fallback when an org has no colour (or before an org is chosen). Matches the web
 * portal layout + nav (`?? "#0B2D6F"`). Note the web home page uses
 * lib/portal.ts DEFAULT_THEME_COLOR "#1e3a5f" — an inconsistency on the web; we
 * follow the layout/nav, which is what frames every portal page.
 */
export const DEFAULT_ORG_COLOR = "#0B2D6F";

const WHITE = "#FFFFFF";
/** Dark ink used on light org colours (portal text colour #0D1B3E). */
const INK = "#0D1B3E";

type Rgb = { r: number; g: number; b: number };

/** "#abc" | "#aabbcc" | "aabbcc" (any case, whitespace ok) → "#AABBCC", else null. */
export function normalizeHex(input: string | null | undefined): string | null {
  if (!input) return null;
  let hex = input.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(hex)) hex = hex.replace(/./g, (c) => c + c);
  if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
  return `#${hex.toUpperCase()}`;
}

function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }: Rgb): string {
  const to = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

/** Linear blend: amount 0 → a, 1 → b. */
export function mix(a: string, b: string, amount: number): string {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex({
    r: x.r + (y.r - x.r) * amount,
    g: x.g + (y.g - x.g) * amount,
    b: x.b + (y.b - x.b) * amount,
  });
}

/** WCAG relative luminance (0 black … 1 white). */
function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const ch = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

/** WCAG contrast ratio between two colours (1 … 21). */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Darken toward `INK` until the colour reaches `min` contrast on white —
 * so an org that picks a pale colour still gets readable links/labels.
 */
function readableOnWhite(hex: string, min = 4.5): string {
  let out = hex;
  for (let i = 1; i <= 10 && contrast(out, WHITE) < min; i++) out = mix(hex, INK, i / 10);
  return out;
}

/** "#1A4DB3" → "220 75% 40%" — the HSL-triple format our CSS variables use (src/global.css). */
export function hexToHslTriple(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === rn) h = 60 * (((gn - bn) / d) % 6);
    else if (max === gn) h = 60 * ((bn - rn) / d + 2);
    else h = 60 * ((rn - gn) / d + 4);
  }
  if (h < 0) h += 360;
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export type OrgTheme = {
  /** The org's colour, normalised (or the default). */
  base: string;
  /** Text/icon colour ON `base` (white, or ink for light org colours). */
  onBase: string;
  /** `base`, darkened if needed so it reads as text/links on white. */
  text: string;
  /** Pressed state for filled buttons. */
  pressed: string;
  /** Soft tint for chips / icon tiles (≈ web `${themeColor}1a` over white). */
  soft: string;
  /** Hairline borders in the org colour (≈ web `${themeColor}26`). */
  line: string;
  /** Header / hero gradient, light → deep (mirrors the auth hero). */
  gradient: [string, string];
  /** True when no valid org colour was given and the default is in use. */
  isDefault: boolean;
  /** NativeWind CSS variables — pass to `vars()` on a wrapping View. */
  cssVars: Record<`--${string}`, string>;
};

export function buildOrgTheme(colorTheme?: string | null): OrgTheme {
  const parsed = normalizeHex(colorTheme);
  const base = parsed ?? DEFAULT_ORG_COLOR;
  // Pick whichever of white / ink reads better on the org colour.
  const onBase = contrast(base, WHITE) >= contrast(base, INK) ? WHITE : INK;
  const text = readableOnWhite(base);
  const soft = mix(base, WHITE, 0.9);
  const line = mix(base, WHITE, 0.85);
  const pressed = mix(base, "#000000", 0.15);

  return {
    base,
    onBase,
    text,
    pressed,
    soft,
    line,
    gradient: [mix(base, WHITE, 0.12), base],
    isDefault: !parsed,
    cssVars: {
      // Filled buttons, active tabs, focus rings → the org colour itself.
      "--primary": hexToHslTriple(base),
      "--primary-foreground": hexToHslTriple(onBase),
      "--ring": hexToHslTriple(base),
      // Headers / heroes (`bg-accent`) → the org colour, like the web nav.
      "--accent": hexToHslTriple(base),
      "--accent-foreground": hexToHslTriple(onBase),
      // Chips / soft buttons (`bg-secondary text-secondary-foreground`).
      "--secondary": hexToHslTriple(soft),
      "--secondary-foreground": hexToHslTriple(text),
    },
  };
}
