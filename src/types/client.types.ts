/**
 * Client Records — CMS `GET /api/portal/[adviceId]/client-records`
 * (app/api/portal/[adviceId]/client-records/route.ts). Prisma enums ClientType /
 * ClientSource in prisma/schema/client.prisma.
 */
export type ClientType = "individual" | "company" | "trust" | "smsf";
export type ClientSource = "manual" | "id_verification" | "client_forms" | "document_upload";

export type ClientTag = { id: string; name: string; color: string | null };

export type ClientRecord = {
  id: string;
  type: ClientType | string;
  source: ClientSource | string;
  name: string;
  email: string | null;
  phone: string | null;
  /** ISO. */
  createdAt: string;
  archivedAt: string | null;
  tags: ClientTag[];
};

export type ClientRecordsResponse = {
  clients: ClientRecord[];
  /** All the adviser's tags (for the tag filter). */
  tags: ClientTag[];
  total: number;
  page: number;
  /** 50 on the server. */
  pageSize: number;
};

/** List filters — mirror the web page's controls (search, tag, type, source, Active/Archived). */
export type ClientFilters = {
  search: string;
  tag: string;
  type: ClientType | "";
  source: ClientSource | "";
  archived: boolean;
};

export const DEFAULT_CLIENT_FILTERS: ClientFilters = {
  search: "",
  tag: "",
  type: "",
  source: "",
  archived: false,
};
