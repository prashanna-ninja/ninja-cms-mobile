import { requireOptionalNativeModule } from "expo";
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

/** Our Android module (modules/ninja-app-icon): toggles launcher aliases, never MainActivity. */
type AndroidIcons = {
  getIcon(names: string[]): string | null;
  setIcon(name: string | null, names: string[]): void;
};
const ALTERNATE_NAMES = appIcons.alternates.map((i) => i.name);

/**
 * One API over both platforms: iOS → expo-alternate-app-icons; Android → NinjaAppIcon
 * (expo-alternate-app-icons' Android switch disables MainActivity — docs/08 §6).
 */
type IconBackend = { get(): string | null; set(name: string | null): Promise<void> };

/**
 * The native module, or null where it doesn't exist (Expo Go, web). Importing
 * the package in Expo Go throws "Cannot find native module", so it's loaded
 * lazily inside a try.
 */
let native: IconBackend | null | undefined;
/** Why the native module is unavailable (shown in the dev log). */
let unavailableReason = "";
function getNative(): IconBackend | null {
  if (native !== undefined) return native;
  if (Platform.OS === "web") {
    unavailableReason = "web";
    return (native = null);
  }
  if (Platform.OS === "android") {
    const mod = requireOptionalNativeModule<AndroidIcons>("NinjaAppIcon");
    if (!mod) {
      unavailableReason = "native module NinjaAppIcon isn't in this build (Expo Go, or a dev build that needs rebuilding)";
      return (native = null);
    }
    return (native = {
      get: () => mod.getIcon(ALTERNATE_NAMES),
      set: async (name) => mod.setIcon(name, ALTERNATE_NAMES),
    });
  }
  // Probe first: requiring the package when its native side is missing throws (and
  // React Native dev reports it as a red error even inside try/catch).
  if (!requireOptionalNativeModule("ExpoAlternateAppIcons")) {
    unavailableReason = "native module ExpoAlternateAppIcons isn't in this build (Expo Go, or a dev build that needs rebuilding)";
    return (native = null);
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ios = require("expo-alternate-app-icons") as NativeIcons;
    if (!ios.supportsAlternateIcons) {
      unavailableReason = "device reports supportsAlternateIcons = false";
      return (native = null);
    }
    native = {
      get: () => ios.getAppIconName(),
      // The generated union type only exists after prebuild; names come from the same JSON.
      set: async (name) => void (await ios.setAlternateAppIcon(name as Parameters<NativeIcons["setAlternateAppIcon"]>[0])),
    };
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
 * 64 since 2026-10-08: Berrylium's #c93636 is ≈ 60 from the Beryllium preset (#8F2A2A).
 */
const MATCH_DISTANCE = 64;

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
    return mod.get();
  } catch {
    return undefined;
  }
}

/**
 * Switch the home-screen icon. Never throws — an icon is cosmetic.
 * iOS shows a one-line system alert ("You have changed the icon for …"). Android has no alert;
 * call it while the app is in the background there (see use-org-app-icon.ts).
 */
export async function setAppIcon(name: string | null): Promise<void> {
  const mod = getNative();
  if (!mod) return;
  try {
    if (mod.get() === name) return;
    await mod.set(name);
  } catch (err) {
    if (__DEV__) console.warn("[app-icon] couldn't switch icon:", err);
  }
}

/**
 * Android switches the icon when the app goes to the background (use-org-app-icon.ts). But the
 * app ALSO goes to the background when it opens a system screen itself: document picker, share
 * sheet, in-app browser. Switching the launcher alias then disrupts the app, the picker's
 * result is lost, and expo-document-picker stays "in progress" ("Different document picking in
 * progress", reported 2026-10-08). Wrap those calls in `holdAppIconSwitch`: no switch while one
 * is open, nor for a short grace period after (Android's browser call resolves before the app
 * actually backgrounds).
 */
let holds = 0;
let holdUntil = 0;
const HOLD_GRACE_MS = 2000;

export async function holdAppIconSwitch<T>(fn: () => Promise<T>): Promise<T> {
  holds += 1;
  try {
    return await fn();
  } finally {
    holds -= 1;
    holdUntil = Date.now() + HOLD_GRACE_MS;
  }
}

/** False while the app has its own system screen open (see holdAppIconSwitch). */
export const appIconSwitchAllowed = () => holds === 0 && Date.now() > holdUntil;
