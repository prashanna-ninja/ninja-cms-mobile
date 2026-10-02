import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { qk } from "@/lib/query-keys";
import type { OrgSummary } from "@/types/advice.types";

/**
 * GET /api/advice/my — the orgs the signed-in user belongs to (admins: all orgs).
 * Each item carries `colorTheme` + `logo`, which is everything org theming needs
 * (CMS app/api/advice/my/route.ts). docs/07-ORG-THEMING.md.
 *
 * ⚠️ Known gap vs the web picker: for strict advisers the web lists the ACTING
 * adviser's orgs (lib/portal-acting-adviser.ts); this endpoint uses the signed-in
 * user's own memberships. Fine until acting-adviser lands on mobile.
 */
export const getMyOrgs = () => apiFetch<OrgSummary[]>("/api/advice/my");

const byName = (a: OrgSummary, b: OrgSummary) => a.name.localeCompare(b.name);

export function useMyOrgs(enabled = true) {
  return useQuery({
    queryKey: qk.myOrgs(),
    queryFn: getMyOrgs,
    enabled,
    // The endpoint has no ORDER BY for members; the web admin list is by name.
    select: (orgs) => [...orgs].sort(byName),
  });
}
