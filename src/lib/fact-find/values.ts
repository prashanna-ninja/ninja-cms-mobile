import type { FactFindFieldDef } from "@/lib/fact-find/config";

/** Helpers for reading and editing the stored fact-find JSON (shared by the read view and the editor). */
export type Obj = Record<string, unknown>;

export const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);

/** A stored value as a trimmed string ("" when missing). */
export const str = (v: unknown) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");

/** The raw (untrimmed) string for an input's `value`. */
export const raw = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");

/** Respect the web's `dependsOn` (e.g. "country of residence" only when not a resident). */
export function isFieldVisible(def: FactFindFieldDef, obj: Obj): boolean {
  const dep = def.dependsOn;
  if (!dep) return true;
  const sibling = str(obj[dep.field]);
  if (dep.showWhen !== undefined) return ([] as string[]).concat(dep.showWhen).includes(sibling);
  return !([] as string[]).concat(dep.unless ?? []).includes(sibling);
}

/** Visible fields of `obj`, first definition per name (the web reuses a name for alternative inputs). */
export function visibleFields(fields: FactFindFieldDef[], obj: Obj): FactFindFieldDef[] {
  const seen = new Set<string>();
  return fields.filter((def) => {
    if (seen.has(def.name) || !isFieldVisible(def, obj)) return false;
    seen.add(def.name);
    return true;
  });
}

/** Web money inputs keep only digits and a single decimal point. */
export function sanitizeMoney(input: string): string {
  const digitsAndDots = input.replace(/[^0-9.]/g, "");
  const firstDot = digitsAndDots.indexOf(".");
  if (firstDot === -1) return digitsAndDots;
  return digitsAndDots.slice(0, firstDot + 1) + digitsAndDots.slice(firstDot + 1).replace(/\./g, "");
}

/** List-row id. The server only needs a unique string (the web uses crypto.randomUUID, which Hermes may lack). */
export const newRowId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * What we PATCH: blank strings are dropped (the server's enums reject "" and "not set" is a missing key,
 * like the web's Select), empty person objects are dropped, list rows keep their `id`.
 */
export function cleanForSave(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cleanForSave);
  if (!isObj(value)) return typeof value === "string" ? value.trim() : value;
  const out: Obj = {};
  for (const [k, v] of Object.entries(value)) {
    const c = cleanForSave(v);
    if (c === undefined || c === null || c === "") continue;
    if (isObj(c) && Object.keys(c).length === 0) continue;
    out[k] = c;
  }
  return out;
}
