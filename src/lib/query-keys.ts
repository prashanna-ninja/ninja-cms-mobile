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
};
