import * as React from "react";
import { AppState, Platform } from "react-native";

import { appIconForColor, appIconUnavailableReason, canChangeAppIcon, currentAppIcon, setAppIcon } from "@/lib/app-icon";
import { useOrgTheme } from "@/providers/org-theme-provider";
import { useSession } from "@/providers/session-provider";

/**
 * Per-org home-screen icon — **iOS only** (docs/08-APP-ICONS.md §6).
 *
 * iOS: signed in with an org → that org's icon (nearest preset colour); signed out
 * / no org → the default Ninja CMS blue. Switches immediately (iOS shows its own
 * one-line "icon changed" alert).
 *
 * Android: always the DEFAULT icon. expo-alternate-app-icons switches on Android by
 * DISABLING the real `.MainActivity` and enabling an alias. After that, anything that
 * launches `.MainActivity` explicitly — `expo run:android`, the dev client, some deep
 * links — fails with "Unable to find explicit activity class … .MainActivity". That
 * disabled state also survives app updates (reported 2026-10-06). So on Android we
 * never switch, and if a phone was switched by an earlier build we put it back to the
 * default the next time the app goes to the background (re-enables `.MainActivity`).
 *
 * No-op in Expo Go / web (no native module).
 */
export function useOrgAppIcon() {
  const { data: session, isPending } = useSession();
  const { org } = useOrgTheme();
  const signedIn = !!session?.user;
  const desired = Platform.OS === "ios" && signedIn && org ? appIconForColor(org.colorTheme) : null;

  React.useEffect(() => {
    // Don't flip to the default icon during cold start, before the stored session has loaded.
    if (isPending) return;
    if (__DEV__) {
      // Dev-only trace so "why didn't my icon change?" is answerable from the Metro log.
      console.log(
        `[app-icon] org=${org?.name ?? "none"} colour=${org?.colorTheme ?? "-"} → icon=${desired ?? "Default"}` +
          (Platform.OS === "android" ? " (Android: per-org icons disabled — default only)" : "") +
          (canChangeAppIcon()
            ? ""
            : ` — NOT APPLIED: native module unavailable (${appIconUnavailableReason()}). ` +
              "In Expo Go: use a dev build. In a dev build: its native project is stale — " +
              "run `npx expo prebuild --clean` then `npx expo run:ios`."),
      );
    }
    if (Platform.OS === "ios" && canChangeAppIcon()) void setAppIcon(desired);
  }, [desired, isPending, org?.name, org?.colorTheme]);

  // Android heal: an earlier build may have disabled `.MainActivity` by switching icon.
  // Reset to the default when the app next goes to the background — switching the
  // running alias while in the foreground can close the app on some launchers.
  React.useEffect(() => {
    if (Platform.OS !== "android" || !canChangeAppIcon()) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background" && currentAppIcon()) void setAppIcon(null);
    });
    return () => sub.remove();
  }, []);
}
