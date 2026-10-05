import type { ClientSource, ClientType } from "@/types/client.types";

/** Labels + badge colours — same as the web (components/clients/ClientTypeBadge.tsx, lib/clients/source.ts). */
export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  individual: "Individual",
  company: "Company",
  trust: "Trust",
  smsf: "SMSF",
};

/** Web: blue / violet / amber / emerald -50 bg, -700 text, -200 ring (Tailwind). */
export const CLIENT_TYPE_STYLES: Record<ClientType, { bg: string; fg: string; ring: string }> = {
  individual: { bg: "#EFF6FF", fg: "#1D4ED8", ring: "#BFDBFE" },
  company: { bg: "#F5F3FF", fg: "#6D28D9", ring: "#DDD6FE" },
  trust: { bg: "#FFFBEB", fg: "#B45309", ring: "#FDE68A" },
  smsf: { bg: "#ECFDF5", fg: "#047857", ring: "#A7F3D0" },
};

export const CLIENT_SOURCE_LABELS: Record<ClientSource, string> = {
  manual: "Manual",
  id_verification: "ID Verification",
  client_forms: "Client Forms",
  document_upload: "Request documents",
};

export const CLIENT_TYPES = Object.keys(CLIENT_TYPE_LABELS) as ClientType[];
export const CLIENT_SOURCES = Object.keys(CLIENT_SOURCE_LABELS) as ClientSource[];

export const clientTypeLabel = (t: string) => CLIENT_TYPE_LABELS[t as ClientType] ?? t;
export const clientSourceLabel = (s: string) => CLIENT_SOURCE_LABELS[s as ClientSource] ?? s;
export const clientTypeStyle = (t: string) =>
  CLIENT_TYPE_STYLES[t as ClientType] ?? { bg: "#F5F5F5", fg: "#404040", ring: "#E5E5E5" };

/** Web default for tags without a colour (slate-500). */
export const DEFAULT_TAG_COLOR = "#64748B";
