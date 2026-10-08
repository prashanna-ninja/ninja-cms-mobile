import * as React from "react";
import { AppState, Platform } from "react-native";

import { appIconForColor, appIconSwitchAllowed, appIconUnavailableReason, canChangeAppIcon, currentAppIcon, setAppIcon } from "@/lib/app-icon";
import { useOrgTheme } from "@/providers/org-theme-provider";
import { useSession } from "@/providers/session-provider";

/**
 * Per-org home-screen icon (docs/08-APP-ICONS.md).
 *
 * Signed in with an org → that org's icon (nearest preset colour); signed out / no org →
 * the default Ninja CMS blue.
 *
 * iOS: switches immediately (iOS shows its own one-line "icon changed" alert).
 *
 * Android: switches when the app goes to the BACKGROUND. Changing the launcher alias of a
 * running app can close it on some launchers, so we wait until the user leaves (e.g. after
 * signing in, the icon changes once they go home). Skipped while the app's own picker / share
 * sheet / browser is open (holdAppIconSwitch). Uses modules/ninja-app-icon, which only
 * toggles launcher aliases. It never disables `.MainActivity`, the 2026-10-06 bug with
 * expo-alternate-app-icons (docs/08 §6).
 *
 * No-op in Expo Go / web (no native module).
 */
export function useOrgAppIcon() {
  const { data: session, isPending } = useSession();
  const { org } = useOrgTheme();
  const signedIn = !!session?.user;
  const desired = signedIn && org ? appIconForColor(org.colorTheme) : null;

  React.useEffect(() => {
    // Don't flip to the default icon during cold start, before the stored session has loaded.
    if (isPending) return;
    if (__DEV__) {
      // Dev-only trace so "why didn't my icon change?" is answerable from the Metro log.
      console.log(
        `[app-icon] org=${org?.name ?? "none"} colour=${org?.colorTheme ?? "-"} → icon=${desired ?? "Default"}` +
          (Platform.OS === "android" ? " (Android: applied when the app goes to the background)" : "") +
          (canChangeAppIcon()
            ? ""
            : ` — NOT APPLIED: native module unavailable (${appIconUnavailableReason()}). ` +
              "In Expo Go: use a dev build. In a dev build: its native project is stale — " +
              "run `npx expo prebuild --clean` then `npx expo run:ios|android`."),
      );
    }
    if (Platform.OS === "ios" && canChangeAppIcon()) void setAppIcon(desired);
  }, [desired, isPending, org?.name, org?.colorTheme]);

  // Android: apply the latest wanted icon when the app is backgrounded.
  const wanted = React.useRef<string | null | undefined>(undefined);
  React.useEffect(() => {
    if (!isPending) wanted.current = desired;
  }, [desired, isPending]);
  React.useEffect(() => {
    if (Platform.OS !== "android" || !canChangeAppIcon()) return;
    const sub = AppState.addEventListener("change", (state) => {
      const next = wanted.current;
      // Not while the app itself opened a picker / share sheet / browser (holdAppIconSwitch).
      if (state === "background" && next !== undefined && appIconSwitchAllowed() && currentAppIcon() !== next) void setAppIcon(next);
    });
    return () => sub.remove();
  }, []);
}
