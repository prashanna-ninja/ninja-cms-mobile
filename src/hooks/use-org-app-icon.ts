import * as React from "react";
import { AppState, Platform } from "react-native";

import { appIconForColor, canChangeAppIcon, setAppIcon } from "@/lib/app-icon";
import { useOrgTheme } from "@/providers/org-theme-provider";
import { useSession } from "@/providers/session-provider";

/**
 * Keeps the home-screen icon in step with the active org (docs/08-APP-ICONS.md):
 * signed in with an org → that org's icon (nearest preset colour); signed out or
 * no org yet → the default Ninja CMS blue icon.
 *
 * When it switches:
 *  - **iOS:** immediately (iOS shows its own one-line "icon changed" alert).
 *  - **Android:** when the app next goes to the background. The switch disables
 *    the launcher alias the app is running under; doing that in the foreground can
 *    close the app on some launchers. The library also needs the activity to still
 *    exist, which it does at the background transition.
 *
 * No-op in Expo Go / web (no native module) — needs a development build.
 */
export function useOrgAppIcon() {
  const { data: session, isPending } = useSession();
  const { org } = useOrgTheme();
  const signedIn = !!session?.user;
  const desired = signedIn && org ? appIconForColor(org.colorTheme) : null;
  const pending = React.useRef<string | null | undefined>(undefined);

  React.useEffect(() => {
    // Don't flip to the default icon during cold start, before the stored session has loaded.
    if (isPending) return;
    if (__DEV__) {
      // Dev-only trace so "why didn't my icon change?" is answerable from the Metro log.
      console.log(
        `[app-icon] org=${org?.name ?? "none"} colour=${org?.colorTheme ?? "-"} → icon=${desired ?? "Default"}` +
          (canChangeAppIcon()
            ? ""
            : " — NOT APPLIED: no native module (Expo Go / web). Use a development build: npx expo run:ios"),
      );
    }
    if (!canChangeAppIcon()) return;
    if (Platform.OS === "ios") {
      void setAppIcon(desired);
    } else {
      pending.current = desired;
    }
  }, [desired, isPending, org?.name, org?.colorTheme]);

  React.useEffect(() => {
    if (Platform.OS !== "android" || !canChangeAppIcon()) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background" && pending.current !== undefined) {
        const next = pending.current;
        pending.current = undefined;
        void setAppIcon(next);
      }
    });
    return () => sub.remove();
  }, []);
}
