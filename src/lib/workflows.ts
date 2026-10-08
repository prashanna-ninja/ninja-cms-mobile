import { todayYmd } from "@/components/forms/date-field";
import type { BoardCard } from "@/types/workflow.types";

/**
 * Stage names often end in who does the work: "Research (Admin)", "Generate Advice (Adviser)".
 * The CMS stores that as plain text; on a phone we show it as a small badge so the name fits.
 */
export function splitStageName(name: string): { title: string; role: string | null } {
  const m = /^(.*\S)\s*\(([^()]{1,24})\)\s*$/.exec(name);
  return m ? { title: m[1], role: m[2] } : { title: name, role: null };
}

/** "YYYY-MM-DD" before today (Brisbane), like the web's isOverdueDueOn. */
export const isOverdue = (dueOn: string | null | undefined) => !!dueOn && dueOn.slice(0, 10) < todayYmd();

/** A card is flagged (red ring on the web) when its own due date or any checklist item is overdue. */
export const cardIsOverdue = (card: Pick<BoardCard, "dueOn" | "checklistOverdue">) => isOverdue(card.dueOn) || card.checklistOverdue;

/** Board search: name, email or phone (the web's "Find a client"). */
export function cardMatches(card: BoardCard, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const c = card.client;
  return [c.name, c.email, c.phone].some((v) => v?.toLowerCase().includes(q));
}
