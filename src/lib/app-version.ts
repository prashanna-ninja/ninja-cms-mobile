import Constants from "expo-constants";

/**
 * App version + build for Settings ("1.0.0 (7)").
 *
 * `expo-application` gives the real native values — the build number is the
 * EAS/TestFlight build. It's a native module, so it's loaded defensively: a dev
 * build compiled before it was added (or web) falls back to app.json's version
 * with no build number instead of crashing the Settings tab. Rebuild the dev
 * client (`npx expo prebuild --clean` → `npx expo run:ios`) to get the build number.
 */
type ApplicationModule = typeof import("expo-application");

function loadApplication(): ApplicationModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-application") as ApplicationModule;
  } catch {
    return null;
  }
}

export function appVersion(): { version: string; build: string | null } {
  const app = loadApplication();
  let version: string | null = null;
  let build: string | null = null;
  try {
    version = app?.nativeApplicationVersion ?? null;
    build = app?.nativeBuildVersion ?? null;
  } catch {
    // native module missing at access time — fall through to the config version
  }
  return { version: version ?? Constants.expoConfig?.version ?? "—", build };
}
