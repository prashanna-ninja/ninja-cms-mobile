/**
 * Notices — CMS `GET /api/notices?adviceId=` (list, lib/queries/notice.ts
 * `getNotices`) and `GET /api/notices/[id]` (detail with content).
 */
export type NoticeListItem = {
  id: string;
  title: string;
  /** ISO date string. */
  createdAt: string;
};

export type NoticeListResponse = {
  data: NoticeListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type NoticeDetail = {
  id: string;
  title: string;
  /** Grid-builder rows (unvalidated JSON) — run through `parseRows`. */
  content: unknown;
  createdAt: string;
  adviceIds: string[];
};
