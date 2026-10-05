/**
 * Query key factory — the ONLY place query keys are defined.
 * Screens/hooks call e.g. `qk.me()`; invalidation uses the same helpers,
 * so a typo can never leave stale data behind.
 *
 * Add a section per domain as screens are built (dashboard, portal, notices, …).
 */
export const qk = {
  session: () => ["session"] as const,
  me: () => ["me"] as const,
  /** GET /api/advice/my — orgs (Advice) for the signed-in user. */
  myOrgs: () => ["advice", "my"] as const,
  /** GET /api/notices?adviceId= — an org's notices (list, no content). */
  notices: (adviceId: string) => ["notices", adviceId] as const,
  /** GET /api/notices/[id] — one notice with content. */
  notice: (id: string) => ["notice", id] as const,
  /** GET /api/portal/[adviceId]/client-records (infinite, per filter set). */
  clientRecords: (adviceId: string, filters: object) => ["client-records", adviceId, filters] as const,
  /** Whether the user can use Client Records in this org (403 → no). */
  clientRecordsAccess: (adviceId: string) => ["client-records-access", adviceId] as const,
  /** GET …/client-records/[clientId] — one client. */
  client: (adviceId: string, clientId: string) => ["client", adviceId, clientId] as const,
  /** A client sub-section (partner, tags, workflows, revenue, fact-find, files, notes, annual-consent, activity). */
  clientSection: (clientId: string, section: string, ...rest: string[]) => ["client", clientId, section, ...rest] as const,
};
