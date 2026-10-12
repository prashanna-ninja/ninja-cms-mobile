/**
 * My Revenue — shapes from the CMS `/api/my-revenue/*` routes
 * (lib/queries/revenue-transactions.ts). Money is a decimal string ("1234.50").
 */

export type RevenueEntity = "Cobalt" | "Beryllium" | "AIAFSL" | "CLS";

export type RevenueTransaction = {
  id: string;
  entity: string;
  adviserId: string | null;
  rawAdviserName: string | null;
  adviserCode: string | null;
  accountNumber: string | null;
  accountName: string | null;
  productProvider: string | null;
  subproductName: string | null;
  feeType: "upfront" | "ongoing" | null;
  feeTypeName: string | null;
  datePaid: string;
  grossAmount: string;
  netAmount: string;
  client: { id: string; name: string; type: string } | null;
};

export type RevenueTransactionsResponse = {
  data: RevenueTransaction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type RevenueStats = {
  transactionCount: number;
  grossAmount: string;
  netAmount: string;
  /** Distinct client accounts in this view. */
  accountCount: number;
  /** Distinct clients (mapped client, else account) — the web's "Total Clients" card. */
  clientCount: number;
  upfrontNet: string;
  upfrontCount: number;
  ongoingNet: string;
  ongoingCount: number;
};

/** Filters shared by the transactions list and the stats (web MyRevenueClient). */
export type RevenueFilters = {
  /** Account name / number only (accountOnlySearch). */
  search: string;
  entity: RevenueEntity | "";
  /** "YYYY-MM-DD" or "". */
  datePaidFrom: string;
  datePaidTo: string;
  /** "" = newest first (server default). */
  sortBy: "" | "datePaid" | "-netAmount" | "netAmount";
};

export const DEFAULT_REVENUE_FILTERS: RevenueFilters = {
  search: "",
  entity: "",
  datePaidFrom: "",
  datePaidTo: "",
  sortBy: "",
};

/**
 * One revenue account — the Map Clients list. Since CMS #122 an account is **product provider + account
 * number** (key "p:<provider>|n:<number>"); a transaction with no account number is its own row
 * (key "t:<id>", `transactionId` + `datePaid` set) and maps alone. `accountName` joins the names seen.
 */
export type RevenueAccountGroup = {
  key: string;
  transactionId: string | null;
  productProvider: string | null;
  accountNumber: string | null;
  accountName: string | null;
  datePaid: string | null;
  transactionCount: number;
  grossAmount: string;
  netAmount: string;
  client: { id: string; name: string; type: string } | null;
};

export type MappedFilter = "all" | "mapped" | "unmapped";

export type RevenueAccountGroupsResponse = {
  data: RevenueAccountGroup[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  counts: Record<MappedFilter, number>;
};

/** A client in the "map to client" picker (your own clients). */
export type PickableClient = { id: string; name: string; type: string };
