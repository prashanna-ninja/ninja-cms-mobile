import { PRODUCT_TIME_ZONE, formatShortDate } from "@/lib/date";

/** "1234.5" → "$1,234.50" (web ClientRevenueTab: $ + toFixed(2) with thousands separators). */
export function formatMoney(value: string | number | null | undefined): string {
  const n = typeof value === "number" ? value : parseFloat(value ?? "0");
  if (!Number.isFinite(n)) return "$0.00";
  const sign = n < 0 ? "-" : "";
  const [int, dec] = Math.abs(n).toFixed(2).split(".");
  return `${sign}$${int.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${dec}`;
}

/** Web Files tab: < 1 KB → "N B", < 1 MB → "N.N KB", else "N.N MB". */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

let timeFormatter: Intl.DateTimeFormat | null | undefined;
/** Web formatPortalDateTime: "D MMM YYYY, h:mm A" in Brisbane — "22 Jul 2026, 12:40 PM". */
export function formatDateTime(input: string | number | Date | null | undefined): string {
  if (!input) return "—";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "—";
  if (timeFormatter === undefined) {
    try {
      timeFormatter = new Intl.DateTimeFormat("en-AU", {
        timeZone: PRODUCT_TIME_ZONE,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      timeFormatter = null;
    }
  }
  let time = "";
  if (timeFormatter) {
    const p = Object.fromEntries(timeFormatter.formatToParts(date).map((x) => [x.type, x.value]));
    time = `${p.hour}:${p.minute} ${(p.dayPeriod ?? "").toUpperCase()}`.trim();
  } else {
    time = date.toTimeString().slice(0, 5);
  }
  return `${formatShortDate(date)}, ${time}`;
}

/**
 * "YYYY-MM-DD" (a calendar date, no time) → "6 Sep 2006". Parsed as a local
 * calendar date so it never shifts a day across timezones.
 */
export function formatCalendarDate(ymd: string | null | undefined): string {
  if (!ymd) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(ymd);
  if (!m) return ymd;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${Number(m[3])} ${months[Number(m[2]) - 1]} ${m[1]}`;
}

/** Web initialsFor: 0 parts "?", 1 part → first 2 letters, else first + last initial. */
export function nameInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
