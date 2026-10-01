import { Stack } from "expo-router";

import { OrgThemeScope } from "@/providers/org-theme-provider";

/**
 * Signed-IN area. Reachable only with a session (see app/_layout.tsx).
 *
 * Everything in here wears the active organisation's colour (OrgThemeScope →
 * NativeWind vars) — the mobile app is the adviser portal. A plain Stack for
 * now; becomes tabs when the dashboard step lands.
 */
export default function AppLayout() {
  return (
    <OrgThemeScope>
      <Stack screenOptions={{ headerShown: false }} />
    </OrgThemeScope>
  );
}
