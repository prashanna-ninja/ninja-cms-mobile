import type { ConfigContext, ExpoConfig } from "expo/config";

import appIcons from "./src/constants/app-icons.json";

/**
 * Store/preview builds must talk to the real CMS over HTTPS. EAS injects the URL
 * from eas.json (`build.<profile>.env`) — `.env` is never uploaded (.easignore).
 * Fail the build here rather than ship an app that can't sign in.
 */
function assertReleaseEnv() {
  const appEnv = process.env.APP_ENV;
  if (appEnv !== "production" && appEnv !== "preview") return;
  const url = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";
  if (!url.startsWith("https://")) {
    throw new Error(
      `[app.config] ${appEnv} build needs EXPO_PUBLIC_API_BASE_URL=https://… (got "${url}"). ` +
        `Set it in eas.json build.${appEnv}.env.`,
    );
  }
}

/**
 * Dynamic config on top of app.json (Expo merges them: app.json → `config`).
 *
 * 1. Guards release builds (above).
 * 2. Registers the per-org home-screen icons with expo-alternate-app-icons from
 *    the same JSON the icon generator and the app use (src/constants/app-icons.json),
 *    so the list can't drift. Each alternate has its own Android foreground/monochrome
 *    (the org's brand logo, or the CMS NINJA wordmark when `style` is "ninja").
 *    Regenerate the PNGs with `node scripts/generate-app-icons.mjs`.
 *
 * Alternate icons are native: after changing this list, rebuild the dev client
 * (they do nothing in Expo Go). See docs/08-APP-ICONS.md, docs/10-RELEASE-IOS.md.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  assertReleaseEnv();
  return {
    ...(config as ExpoConfig),
    plugins: [
      ...(config.plugins ?? []),
      [
        "expo-alternate-app-icons",
        appIcons.alternates.map((icon) => ({
          name: icon.name,
          ios: `./assets/app-icons/${icon.name}.png`,
          android: {
            foregroundImage: `./assets/app-icons/${icon.name}-foreground.png`,
            monochromeImage: `./assets/app-icons/${icon.name}-monochrome.png`,
            backgroundColor: icon.color,
          },
        })),
      ],
    ],
  };
};
