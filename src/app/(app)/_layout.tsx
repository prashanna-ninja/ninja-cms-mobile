import { Stack } from "expo-router";
import * as React from "react";

import { useMyOrgs } from "@/api/advice.api";
import {
  NoOrganisations,
  NotAPortalUser,
  OrgGateLoading,
  OrgsLoadError,
} from "@/components/orgs/org-gate-states";
import { canAccessPortal } from "@/lib/roles";
import { OrgThemeScope, useOrgTheme } from "@/providers/org-theme-provider";
import { useSession } from "@/providers/session-provider";
import type { OrgSummary } from "@/types/advice.types";

const sameOrg = (a: OrgSummary | null, b: OrgSummary) =>
  !!a && a.id === b.id && a.name === b.name && a.colorTheme === b.colorTheme && a.logo === b.logo;

/**
 * Signed-IN area = the adviser portal. Before any portal screen, an organisation
 * must be active (web: /portal → /portal/[adviceId]). This layout is that gate:
 *
 *   not a portal role  → "use the web"            (editor / user)
 *   GET /api/advice/my → 0 orgs → "No organisations assigned"
 *                      → 1 org  → selected automatically, straight in
 *                      → many   → remembered org if still valid, else the picker
 *
 * The remembered org is refreshed from the server list every time (colour/logo
 * edits in the CMS show up on next open; a removed membership drops it).
 * A returning user with a remembered org goes straight in while the list
 * refreshes in the background — no spinner on every launch.
 *
 * Everything below wears the active org's colour (OrgThemeScope → NativeWind vars).
 * docs/07-ORG-THEMING.md.
 */
export default function AppLayout() {
  const { data: session } = useSession();
  const { org, setOrg } = useOrgTheme();
  const isPortalUser = canAccessPortal(session?.user.role);
  const orgsQuery = useMyOrgs(isPortalUser);
  const orgs = orgsQuery.data;

  // Keep the active org in step with the server list.
  React.useEffect(() => {
    if (!orgs) return;
    if (orgs.length === 1) {
      if (!sameOrg(org, orgs[0])) setOrg(orgs[0]); // single org → direct login
      return;
    }
    if (org) {
      const fresh = orgs.find((o) => o.id === org.id);
      if (!fresh) setOrg(null); // membership removed → back to the picker
      else if (!sameOrg(org, fresh)) setOrg(fresh); // colour / logo / name changed
    }
  }, [orgs, org, setOrg]);

  if (!isPortalUser) return <NotAPortalUser />;

  if (!org) {
    if (orgsQuery.isPending) return <OrgGateLoading />;
    if (orgsQuery.isError) {
      return <OrgsLoadError message={orgsQuery.error.message} onRetry={() => void orgsQuery.refetch()} />;
    }
    if (orgs?.length === 0) return <NoOrganisations />;
    // Exactly one: the effect above is selecting it — hold for that one frame.
    if (orgs?.length === 1) return <OrgGateLoading />;
  }

  return (
    <OrgThemeScope>
      {/* Only one is reachable at a time; setOrg(org | null) flips between them. */}
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Protected guard={!!org}>
          <Stack.Screen name="index" />
        </Stack.Protected>
        <Stack.Protected guard={!org}>
          <Stack.Screen name="select-org" />
        </Stack.Protected>
      </Stack>
    </OrgThemeScope>
  );
}
