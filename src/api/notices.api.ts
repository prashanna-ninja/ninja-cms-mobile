import { useQueries, useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { qk } from "@/lib/query-keys";
import type { NoticeDetail, NoticeListResponse } from "@/types/notice.types";

/**
 * The org's notices, newest first — `GET /api/notices?adviceId=` (membership-checked
 * server-side; admins see any org). The web portal home shows them all, so we ask
 * for the max page size (100) rather than paging.
 */
export const getNotices = (adviceId: string) =>
  apiFetch<NoticeListResponse>(
    `/api/notices?adviceId=${encodeURIComponent(adviceId)}&pageSize=100&sortBy=-createdAt`,
  );

export const getNotice = (id: string) => apiFetch<NoticeDetail>(`/api/notices/${encodeURIComponent(id)}`);

export function useNotices(adviceId: string | undefined) {
  return useQuery({
    queryKey: qk.notices(adviceId ?? ""),
    queryFn: () => getNotices(adviceId!),
    enabled: !!adviceId,
    select: (res) => res.data,
  });
}

/**
 * Each notice's content (`GET /api/notices/[id]`), prefetched for every listed
 * notice — the list endpoint has no content, but the collapsed card shows the
 * image/attachment counts (like the web) and expanding should be instant.
 * Notices change rarely → 5 min staleness.
 */
export function useNoticeDetails(ids: string[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: qk.notice(id),
      queryFn: () => getNotice(id),
      staleTime: 5 * 60_000,
    })),
  });
}
