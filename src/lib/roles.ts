import type { Role } from "@/types/auth.types";

/**
 * Portal access, ported from the CMS (lib/staff.ts `canAccessPortal`):
 *  - members: adviser-like roles (adviser, onboarding) + staff
 *  - preview: admin, superadmin, orgadmin (can open any org they're shown)
 * editor / user are back-office only — the web sends them to /dashboard, and this
 * app (the adviser portal) shows them a "use the web" message instead.
 *
 * UI gating only — every portal API checks membership server-side anyway.
 */
const PORTAL_MEMBER_ROLES: Role[] = ["adviser", "onboarding", "staff"];
const PORTAL_PREVIEW_ROLES: Role[] = ["admin", "superadmin", "orgadmin"];

export function canAccessPortal(role: Role | null | undefined): boolean {
  return !!role && (PORTAL_MEMBER_ROLES.includes(role) || PORTAL_PREVIEW_ROLES.includes(role));
}

export function isPortalPreviewRole(role: Role | null | undefined): boolean {
  return !!role && PORTAL_PREVIEW_ROLES.includes(role);
}
