import type { Role, SessionUser } from "@/types/auth.types";

/** Human labels for CMS roles (prisma enum `Role`). */
const ROLE_LABELS: Record<Role, string> = {
  superadmin: "Super admin",
  admin: "Admin",
  orgadmin: "Org admin",
  adviser: "Adviser",
  onboarding: "Onboarding",
  staff: "Staff",
  editor: "Editor",
  user: "User",
};

export function roleLabel(role: Role | null | undefined): string {
  return role ? (ROLE_LABELS[role] ?? role) : "";
}

/** The name to show: the user's name, else the email's local part. */
export function displayName(user: Pick<SessionUser, "name" | "email"> | null | undefined): string {
  return user?.name?.trim() || user?.email?.split("@")[0] || "";
}

/** "Jane Adviser" → "JA"; "jane@x.com" → "J". */
export function initials(user: Pick<SessionUser, "name" | "email"> | null | undefined): string {
  const source = displayName(user);
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0]?.[0] ?? "?");
  return letters.toUpperCase();
}
