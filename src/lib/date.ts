/**
 * Dates, matching the CMS (lib/date.ts): adviser-facing dates are shown in
 * Brisbane time as DD/MM/YYYY, whatever timezone the phone is in.
 */
export const PRODUCT_TIME_ZONE = "Australia/Brisbane";

const DAY_MS = 24 * 60 * 60 * 1000;
export const WEEK_MS = 7 * DAY_MS;
export const MONTH_MS = 30 * DAY_MS;

let formatter: Intl.DateTimeFormat | null | undefined;
function brisbaneFormatter(): Intl.DateTimeFormat | null {
  if (formatter !== undefined) return formatter;
  try {
    formatter = new Intl.DateTimeFormat("en-AU", {
      timeZone: PRODUCT_TIME_ZONE,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    formatter = null; // engine without timezone data → fall back to device time
  }
  return formatter;
}

/** "2026-09-29T…Z" → "29/09/2026" (Brisbane). */
export function formatDate(input: string | number | Date): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  const f = brisbaneFormatter();
  if (f) {
    const parts = Object.fromEntries(f.formatToParts(date).map((p) => [p.type, p.value]));
    return `${parts.day}/${parts.month}/${parts.year}`;
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}
