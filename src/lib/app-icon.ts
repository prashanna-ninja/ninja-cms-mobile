import { Platform } from "react-native";

import appIcons from "@/constants/app-icons.json";
import { normalizeHex } from "@/lib/org-theme";

/**
 * Per-org home-screen icon (docs/08-APP-ICONS.md).
 *
 * The icons are prebuilt at build time — native apps can't paint a new icon at
 * runtime — so each org is matched to the **nearest preset colour** in
 * src/constants/app-icons.json. An org whose colour isn't close to any preset
 * keeps the default (Ninja CMS blue) icon.
 */

type NativeIcons = typeof import("expo-alternate-app-icons");

/**
 * The native module, or null where it doesn't exist (Expo Go, web). Importing
 * the package in Expo Go throws "Cannot find native module", so it's loaded
 * lazily inside a try.
 */
let native: NativeIcons | null | undefined;
/** Why the native module is unavailable (shown in the dev log). */
let unavailableReason = "";
function getNative(): NativeIcons | null {
  if (native !== undefined) return native;
  if (Platform.OS === "web") {
    unavailableReason = "web";
    return (native = null);
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    native = require("expo-alternate-app-icons") as NativeIcons;
    if (!native.supportsAlternateIcons) {
      unavailableReason = "device reports supportsAlternateIcons = false";
      native = null;
    }
  } catch (err) {
    // Expo Go, OR a dev build whose native project predates this module
    // (stale ios/ or android/ folder → `npx expo prebuild --clean`). docs/08 §5.
    unavailableReason = err instanceof Error ? err.message : String(err);
    native = null;
  }
  return native;
}

/** Dev diagnostics: why icons can't switch in this build ("" when they can). */
export function appIconUnavailableReason(): string {
  getNative();
  return unavailableReason;
}

/** Whether this build can switch icons (false in Expo Go / web). */
export const canChangeAppIcon = () => getNative() !== null;

/**
 * Max RGB distance for an org colour to count as "that preset". Generous enough
 * for small CMS tweaks (e.g. #71AF43 vs #6DAE43 ≈ 6), tight enough that a
 * different brand (e.g. AIAFSL navy vs Cobalt blue ≈ 70) falls back to default.
 */
const MATCH_DISTANCE = 48;

function rgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}

function distance(a: string, b: string) {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

/** Alternate icon name for an org colour, or null for the default icon. */
export function appIconForColor(colorTheme: string | null | undefined): string | null {
  const color = normalizeHex(colorTheme);
  if (!color) return null;
  let best: { name: string; d: number } | null = null;
  for (const icon of appIcons.alternates) {
    const d = distance(color, icon.color);
    if (!best || d < best.d) best = { name: icon.name, d };
  }
  // Closer to the default blue than to any alternate → default.
  if (best && distance(color, appIcons.default.color) < best.d) return null;
  return best && best.d <= MATCH_DISTANCE ? best.name : null;
}

/** The icon currently on the home screen (null = default), or undefined if unknown. */
export function currentAppIcon(): string | null | undefined {
  const mod = getNative();
  if (!mod) return undefined;
  try {
    return mod.getAppIconName();
  } catch {
    return undefined;
  }
}

/**
 * Switch the home-screen icon. Never throws — an icon is cosmetic.
 * iOS shows a one-line system alert ("You have changed the icon for …").
 */
export async function setAppIcon(name: string | null): Promise<void> {
  const mod = getNative();
  if (!mod) return;
  try {
    if (mod.getAppIconName() === name) return;
    // The generated union type only exists after prebuild; names come from the same JSON.
    await mod.setAlternateAppIcon(name as Parameters<NativeIcons["setAlternateAppIcon"]>[0]);
  } catch (err) {
    if (__DEV__) console.warn("[app-icon] couldn't switch icon:", err);
  }
}
