// Android per-org launcher icons that never disable the real activity (docs/08-APP-ICONS.md §6).
//
// expo-alternate-app-icons generates the per-org mipmaps and `.MainActivity<Name>` aliases, but its
// switch DISABLES `.MainActivity`, which breaks `expo run:android`, the dev client and some deep links.
// This plugin reshapes its manifest output, and modules/ninja-app-icon then only toggles aliases:
//   .MainActivity        real activity: keeps deep links, loses its launcher entry, never disabled
//   .MainActivityDefault launcher alias with the default icon (enabled)
//   .MainActivity<Name>  launcher alias per org icon (disabled), launcher filter ONLY: no copied
//                        deep-link filters, so links never show a two-entry "open with" chooser
//
// ⚠️ Must be listed BEFORE expo-alternate-app-icons in app.config.ts: manifest mods run in reverse
// registration order, and this one has to see the aliases that plugin adds.
const { AndroidConfig, withAndroidManifest } = require("expo/config-plugins");

const MAIN = "android.intent.action.MAIN";
const LAUNCHER = "android.intent.category.LAUNCHER";

const isLauncherFilter = (filter) =>
  (filter.action ?? []).some((a) => a.$["android:name"] === MAIN) &&
  (filter.category ?? []).some((c) => c.$["android:name"] === LAUNCHER);

const launcherFilter = () => ({
  action: [{ $: { "android:name": MAIN } }],
  category: [{ $: { "android:name": LAUNCHER } }],
});

module.exports = function withAndroidIconAliases(config) {
  return withAndroidManifest(config, (cfg) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);

    const main = (app.activity ?? []).find((a) => a.$["android:name"] === ".MainActivity");
    if (!main) throw new Error("with-android-icon-aliases: .MainActivity not found in AndroidManifest.xml");
    main.$["android:exported"] = "true";
    main["intent-filter"] = (main["intent-filter"] ?? []).filter((f) => !isLauncherFilter(f));

    const aliases = (app["activity-alias"] ?? []).filter((a) => a.$["android:name"] !== ".MainActivityDefault");
    for (const alias of aliases) {
      if (alias.$["android:name"].startsWith(".MainActivity")) alias["intent-filter"] = [launcherFilter()];
    }

    app["activity-alias"] = [
      {
        $: {
          "android:name": ".MainActivityDefault",
          "android:enabled": "true",
          "android:exported": "true",
          "android:icon": "@mipmap/ic_launcher",
          "android:roundIcon": "@mipmap/ic_launcher_round",
          "android:targetActivity": ".MainActivity",
        },
        "intent-filter": [launcherFilter()],
      },
      ...aliases,
    ];
    return cfg;
  });
};
