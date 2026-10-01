/**
 * An organisation ("Advice" in the CMS — a licensee / AFSL / practice).
 * Shape of `GET /api/advice/my` items (CMS app/api/advice/my/route.ts):
 * `{ id, name, colorTheme, logo }`. See docs/07-ORG-THEMING.md.
 */
export type OrgSummary = {
  id: string;
  name: string;
  /** Hex colour set per org in the CMS (e.g. "#0B2D6F"); null → default theme. */
  colorTheme: string | null;
  /** Org logo URL (S3); null → initials tile. */
  logo: string | null;
};

/** The org the signed-in user is working in, remembered per user on this device. */
export type ActiveOrg = OrgSummary & {
  /** Who selected it — an org saved by a previous user is never applied to the next one. */
  userId: string;
};
