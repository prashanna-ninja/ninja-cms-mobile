import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { qk } from "@/lib/query-keys";
import type { OrgSummary } from "@/types/advice.types";

/**
 * GET /api/advice/my — the orgs the signed-in user belongs to (admins: all orgs).
 * Each item carries `colorTheme` + `logo`, which is everything org theming needs.
 * Used by the org picker / auto-select (docs/07-ORG-THEMING.md §4).
 */
export const getMyOrgs = () => apiFetch<OrgSummary[]>("/api/advice/my");

export function useMyOrgs(enabled = true) {
  return useQuery({ queryKey: qk.myOrgs(), queryFn: getMyOrgs, enabled });
}
