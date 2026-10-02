import type { ConfigContext, ExpoConfig } from "expo/config";

import appIcons from "./src/constants/app-icons.json";

/**
 * Dynamic config on top of app.json (Expo merges them: app.json → `config`).
 *
 * Only job for now: register the per-org home-screen icons with
 * expo-alternate-app-icons from the same JSON the icon generator and the app use
 * (src/constants/app-icons.json), so the list can't drift. Every alternate shares
 * the Android adaptive foreground (white CMS NINJA wordmark); only the background
 * colour differs. Regenerate the PNGs with `node scripts/generate-app-icons.mjs`.
 *
 * Alternate icons are native: after changing this list, rebuild the dev client
 * (they do nothing in Expo Go). See docs/08-APP-ICONS.md.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  plugins: [
    ...(config.plugins ?? []),
    [
      "expo-alternate-app-icons",
      appIcons.alternates.map((icon) => ({
        name: icon.name,
        ios: `./assets/app-icons/${icon.name}.png`,
        android: {
          foregroundImage: "./assets/app-icons/adaptive-foreground.png",
          monochromeImage: "./assets/app-icons/monochrome.png",
          backgroundColor: icon.color,
        },
      })),
    ],
  ],
});
