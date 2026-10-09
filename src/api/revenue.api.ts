import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError, apiFetch } from "@/lib/api-client";
import { qk } from "@/lib/query-keys";
import {
  DEFAULT_REVENUE_FILTERS,
  type MappedFilter,
  type PickableClient,
  type RevenueAccountGroupsResponse,
  type RevenueFilters,
  type RevenueStats,
  type RevenueTransactionsResponse,
} from "@/types/revenue.types";

/**
 * My Revenue — web /portal/[adviceId]/my-revenue (+ /map-client). The routes live under
 * `/api/my-revenue/*` and are scoped by the server to the signed-in user's own revenue
 * (resolveMyRevenueAccess: admin/orgadmin, or an adviser with `revenueVisibilityEnabled`;
 * everyone else → 403). Not org-scoped, so keys carry no adviceId; sign-out clears the cache.
 */

const json = (body: unknown) => ({ body: JSON.stringify(body) });
const noRetryOn4xx = (count: number, err: unknown) => !(err instanceof ApiError && err.status >= 400 && err.status < 500) && count < 1;

const PAGE_SIZE = 25;

function filterParams(f: RevenueFilters) {
  const p = new URLSearchParams();
  if (f.search.trim()) p.set("search", f.search.trim());
  if (f.entity) p.set("entity", f.entity);
  if (f.datePaidFrom) p.set("datePaidFrom", f.datePaidFrom);
  if (f.datePaidTo) p.set("datePaidTo", f.datePaidTo);
  return p;
}

/** Totals for the current filters (sort doesn't change them, so it's left out of the key). */
export function useRevenueStats(filters: RevenueFilters) {
  const { sortBy: _sort, ...rest } = filters;
  return useQuery({
    queryKey: qk.revenueStats(rest),
    queryFn: () => apiFetch<RevenueStats>(`/api/my-revenue/stats?${filterParams(filters).toString()}`),
    placeholderData: keepPreviousData,
    retry: noRetryOn4xx,
  });
}

/** Transactions, newest first by default, pages of 25 as you scroll. */
export function useRevenueTransactions(filters: RevenueFilters) {
  return useInfiniteQuery({
    queryKey: qk.revenueTransactions(filters),
    queryFn: ({ pageParam }) => {
      const p = filterParams(filters);
      if (filters.sortBy) p.set("sortBy", filters.sortBy);
      p.set("page", String(pageParam));
      p.set("pageSize", String(PAGE_SIZE));
      return apiFetch<RevenueTransactionsResponse>(`/api/my-revenue/transactions?${p.toString()}`);
    },
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    retry: noRetryOn4xx,
  });
}

/**
 * Can this user see Revenue? Asks the server (the unfiltered stats — the same query the
 * screen shows first, so opening the tab is instant): true → show, false → 403 hide,
 * undefined → still checking. Other errors count as "show" so the screen can explain.
 */
export function useRevenueAccess(): boolean | undefined {
  const q = useRevenueStats(DEFAULT_REVENUE_FILTERS);
  if (q.isError) return !(q.error instanceof ApiError && q.error.status === 403);
  return q.data ? true : undefined;
}

/** Map Clients — one row per revenue account; unmapped first, then by net (server order). */
export function useRevenueAccounts(mapped: MappedFilter, search: string) {
  return useInfiniteQuery({
    queryKey: qk.revenueAccounts({ mapped, search }),
    queryFn: ({ pageParam }) => {
      const p = new URLSearchParams({ page: String(pageParam), pageSize: String(PAGE_SIZE) });
      if (search) p.set("search", search);
      if (mapped !== "all") p.set("mapped", mapped);
      return apiFetch<RevenueAccountGroupsResponse>(`/api/my-revenue/account-groups?${p.toString()}`);
    },
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    placeholderData: keepPreviousData,
    retry: noRetryOn4xx,
  });
}

/** Your own clients for the picker (server caps at 20; `search` narrows on the server). */
export function useRevenueClients(search: string, enabled: boolean) {
  return useQuery({
    queryKey: qk.revenueClients(search),
    queryFn: async () => {
      const p = new URLSearchParams({ pageSize: "20" });
      if (search) p.set("search", search);
      const res = await apiFetch<{ data: PickableClient[] }>(`/api/my-revenue/clients?${p.toString()}`);
      return res.data;
    },
    enabled,
    placeholderData: keepPreviousData,
    retry: noRetryOn4xx,
  });
}

type MapBody = { accountNumber: string | null; accountName: string | null; clientId: string | null };
const bulkAssign = (body: MapBody) =>
  apiFetch<{ count: number }>("/api/my-revenue/bulk-assign-client", { method: "POST", ...json(body) });

/**
 * Map (clientId) or unmap (null) every transaction of one account.
 *
 * Changing an already-mapped account to another client = unmap, then map: the server's
 * map only touches *unmapped* transactions (lib/clients/revenue-mapping.ts), so a direct
 * remap answers 404 "No unmapped transactions" (the web's "Save" has that bug).
 *
 * Refreshes everything revenue-related, plus the client pages' Revenue + Activity sections.
 */
export function useMapRevenueAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ remap, ...body }: MapBody & { remap?: boolean }) => {
      if (remap && body.clientId) await bulkAssign({ ...body, clientId: null });
      return bulkAssign(body);
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: qk.revenue() }),
        queryClient.invalidateQueries({
          predicate: (q) => q.queryKey[0] === "client" && (q.queryKey[2] === "revenue" || q.queryKey[2] === "activity"),
        }),
      ]),
  });
}
