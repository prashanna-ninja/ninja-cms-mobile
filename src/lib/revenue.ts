import { todayYmd } from "@/components/forms/date-field";
import { PRODUCT_TIME_ZONE } from "@/lib/date";
import type { RevenueEntity, RevenueFilters } from "@/types/revenue.types";

/** Licensees (web ENTITY_OPTIONS), with the web's badge colours (data colours, not brand). */
export const REVENUE_ENTITIES: RevenueEntity[] = ["Cobalt", "Beryllium", "AIAFSL", "CLS"];

const ENTITY_STYLES: Record<string, { bg: string; fg: string }> = {
  Cobalt: { bg: "#E0F2FE", fg: "#0369A1" },
  Beryllium: { bg: "#D1FAE5", fg: "#047857" },
  AIAFSL: { bg: "#FFEDD5", fg: "#C2410C" },
  CLS: { bg: "#F3E8FF", fg: "#7E22CE" },
};
export const entityStyle = (entity: string) => ENTITY_STYLES[entity] ?? { bg: "#F1F5F9", fg: "#475569" };

export const FEE_STYLES = {
  upfront: { bg: "#DBEAFE", fg: "#1D4ED8", label: "Upfront" },
  ongoing: { bg: "#F3E8FF", fg: "#7E22CE", label: "Ongoing" },
} as const;

export const SORT_OPTIONS: { value: RevenueFilters["sortBy"]; label: string }[] = [
  { value: "", label: "Newest first" },
  { value: "datePaid", label: "Oldest first" },
  { value: "-netAmount", label: "Highest net" },
  { value: "netAmount", label: "Lowest net" },
];

/* ── date presets (web RevenueDateRangeFilter), as Brisbane calendar dates ── */

const pad = (n: number) => String(n).padStart(2, "0");
const parseYmd = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return { y, m, d };
};

export type DatePreset = "week" | "month" | "fy";

/** Start of the preset, "YYYY-MM-DD" — week starts Monday; FY starts 1 July. */
export function presetStart(preset: DatePreset, today = todayYmd()): string {
  const { y, m, d } = parseYmd(today);
  if (preset === "month") return `${y}-${pad(m)}-01`;
  if (preset === "fy") return `${m >= 7 ? y : y - 1}-07-01`;
  const date = new Date(Date.UTC(y, m - 1, d));
  const dow = date.getUTCDay(); // 0 = Sunday
  date.setUTCDate(d - (dow === 0 ? 6 : dow - 1));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export const DATE_PRESETS: { key: DatePreset; label: string }[] = [
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "fy", label: "This financial year" },
];

/** Which preset (if any) a from/to pair is — so the chip can say "This month" instead of dates. */
export function matchPreset(from: string, to: string): DatePreset | null {
  if (!from || to !== todayYmd()) return null;
  return DATE_PRESETS.find((p) => presetStart(p.key) === from)?.key ?? null;
}

/* ── month grouping for the ledger list ── */

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

let monthFormatter: Intl.DateTimeFormat | null | undefined;
/** ISO timestamp → { key: "2026-08", label: "August 2026", day: "21", dow: "Fri" } in Brisbane. */
export function paidParts(iso: string): { key: string; label: string; day: string; dow: string } {
  const date = new Date(iso);
  if (monthFormatter === undefined) {
    try {
      monthFormatter = new Intl.DateTimeFormat("en-AU", {
        timeZone: PRODUCT_TIME_ZONE,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        weekday: "short",
      });
    } catch {
      monthFormatter = null;
    }
  }
  let y: number, m: number, d: number, dow: string;
  if (monthFormatter) {
    const p = Object.fromEntries(monthFormatter.formatToParts(date).map((x) => [x.type, x.value]));
    y = Number(p.year);
    m = Number(p.month);
    d = Number(p.day);
    dow = p.weekday ?? "";
  } else {
    y = date.getFullYear();
    m = date.getMonth() + 1;
    d = date.getDate();
    dow = date.toDateString().slice(0, 3);
  }
  return { key: `${y}-${pad(m)}`, label: `${MONTH_NAMES[m - 1]} ${y}`, day: String(d), dow: dow.slice(0, 3) };
}

/** An account's display name: the reported name, else its number. */
export const accountLabel = (a: { accountName: string | null; accountNumber: string | null }) =>
  a.accountName ?? a.accountNumber ?? "Unnamed account";
