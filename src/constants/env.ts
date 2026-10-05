/**
 * Public runtime config. `EXPO_PUBLIC_*` vars are read from `.env` at build time and
 * inlined into the app bundle — they are NOT secret, never put secrets here.
 *
 * After changing `.env`, restart Metro with the cache cleared: `npx expo start -c`.
 */
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");

if (!API_BASE_URL) {
  console.warn(
    "[env] EXPO_PUBLIC_API_BASE_URL is not set. Add it to .env (see .env.example) " +
      "and restart with `npx expo start -c`. Auth/API calls will fail until then.",
  );
}

/** Deep-link scheme (must match app.json `scheme`) — also the prefix for SecureStore keys. */
export const APP_SCHEME = "ninjacms";

/**
 * Where account-deletion requests go (Settings → Delete account, a `mailto:` like
 * Ninja CRM mobile). ⚠️ TEMPORARY: this is the Ninja CRM support inbox, chosen by
 * the user on 2026-10-05 "for now" — change it to a Ninja CMS / Advice Ninja inbox
 * before the App Store submission. Tracked in HANDOVER §8 and docs/10-RELEASE-IOS.md §6.
 */
export const SUPPORT_EMAIL = "support@ninjacrm.com.au";
