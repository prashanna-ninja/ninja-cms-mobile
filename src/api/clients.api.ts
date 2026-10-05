import { useInfiniteQuery, useQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";

import { ApiError, apiFetch } from "@/lib/api-client";
import { qk } from "@/lib/query-keys";
import {
  DEFAULT_CLIENT_FILTERS,
  type ClientFilters,
  type ClientRecordsResponse,
} from "@/types/client.types";

/**
 * GET /api/portal/[adviceId]/client-records — the acting adviser's clients in this
 * org, 50 per page, newest first (archived view: most recently archived first).
 * The server decides access (getPortalClientRecordsAccess, lib/clients/access.ts):
 * adviser `clientRecordsEnabled`, staff need their own flag + a managing adviser,
 * admin/orgadmin preview → 403 with a message otherwise.
 */
export function getClientRecords(adviceId: string, filters: ClientFilters, page = 1) {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.type) params.set("type", filters.type);
  if (filters.source) params.set("source", filters.source);
  if (filters.archived) params.set("archived", "1");
  params.set("page", String(page));
  return apiFetch<ClientRecordsResponse>(
    `/api/portal/${encodeURIComponent(adviceId)}/client-records?${params.toString()}`,
  );
}

/** Infinite list for the Clients tab (pull more as you scroll). */
export function useClientRecords(adviceId: string | undefined, filters: ClientFilters) {
  return useInfiniteQuery({
    queryKey: qk.clientRecords(adviceId ?? "", filters),
    queryFn: ({ pageParam }) => getClientRecords(adviceId!, filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page * last.pageSize < last.total ? last.page + 1 : undefined),
    enabled: !!adviceId,
    // A 403 means "no access" — retrying won't change it.
    retry: (count, err) => !(err instanceof ApiError && err.status === 403) && count < 1,
  });
}

/**
 * Can this user see Client Records in this org? Asks the server itself (one
 * page-1 request) instead of re-implementing the web's access rules — so the tab
 * appears exactly when the web portal would show the section.
 *
 *   true  → show the tab      false → 403, hide it      undefined → still checking
 * Other errors (offline, 500) count as "show": the screen then shows the error.
 */
export function useClientRecordsAccess(adviceId: string | undefined): boolean | undefined {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: qk.clientRecordsAccess(adviceId ?? ""),
    queryFn: async () => {
      try {
        const first = await getClientRecords(adviceId!, DEFAULT_CLIENT_FILTERS, 1);
        // Seed the unfiltered list with this page, so opening the tab doesn't refetch it.
        queryClient.setQueryData<InfiniteData<ClientRecordsResponse, number>>(
          qk.clientRecords(adviceId!, DEFAULT_CLIENT_FILTERS),
          { pages: [first], pageParams: [1] },
        );
        return true;
      } catch (err) {
        if (err instanceof ApiError && err.status === 403) return false;
        throw err;
      }
    },
    enabled: !!adviceId,
    staleTime: 5 * 60_000,
    retry: false,
  });
  if (query.isError) return true;
  return query.data;
}
