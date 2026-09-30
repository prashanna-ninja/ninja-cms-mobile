/**
 * The sign-in screens' palette, deliberately NOT the themed tokens.
 *
 * Auth is always light and brand-forward: it's the first impression, shown before
 * we know anything about the user. Everything behind the session guard uses the
 * themed tokens from src/global.css as normal.
 *
 * Same layout as Ninja PRM/CRM mobile (brand hero + white sheet); here the brand
 * is the CMS portal navy/blue (web hero gradient #0B2D6F → #1A4DB3, see
 * docs/03-DESIGN-SYSTEM.md). The wordmark is white, so it needs a saturated ground.
 */
export const AUTH = {
  /* Hero — lighter blue at the top-left, deep navy at the fold (depth, not a flat block). */
  heroTop: "#1A4DB3",
  heroBottom: "#0B2D6F",
  heroText: "#FFFFFF",
  heroMuted: "rgba(255,255,255,0.86)",

  /* Sheet */
  sheet: "#FFFFFF",
  ink: "#0D1B3E",
  inkSoft: "#4A5878",
  muted: "#6B7A99",
  line: "#E2E8F2",
  lineStrong: "#C5CFDF",
  fieldBg: "#F8FAFD",

  /* Brand — the CTA and focus accents. */
  brand: "#1A4DB3",
  brandPressed: "#153F94",
  brandSoft: "#E8F0FD",

  danger: "#DC2626",
  dangerSoft: "#FEF2F2",
  success: "#15803D",
  white: "#FFFFFF",
} as const;

/** Font family names — must match src/lib/fonts.ts keys. */
export const AUTH_FONT = {
  regular: "BricolageGrotesque_400Regular",
  medium: "BricolageGrotesque_500Medium",
  semibold: "BricolageGrotesque_600SemiBold",
  bold: "BricolageGrotesque_700Bold",
} as const;
