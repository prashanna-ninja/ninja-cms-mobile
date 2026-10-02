import { Image } from "expo-image";

/** Source art is 838×464 (docs/03 §5). */
const ASPECT = 838 / 464;

/** The default (no org yet) tint — re-exported so screens import it with the logo. */
export { NINJA_CMS_BLUE } from "@/lib/org-theme";

/**
 * The CMS NINJA wordmark in any colour.
 *
 * The asset is white-on-transparent, so `tintColor` recolours every opaque pixel:
 *  - signed-out hero: white (no tint)
 *  - signed-in, no org yet (org picker): Ninja CMS blue
 *  - signed-in with an org: pass `useOrgTheme().theme.logoTint` — the org colour
 *    (darkened if too pale to read on white), Ninja CMS blue if the org has none.
 */
export function NinjaCmsLogo({
  width = 120,
  color,
}: {
  width?: number;
  /** Omit for the white original. */
  color?: string;
}) {
  return (
    <Image
      source={require("@/assets/images/ninja-cms-logo.png")}
      style={{ width, height: Math.round(width / ASPECT) }}
      contentFit="contain"
      tintColor={color}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Ninja CMS"
    />
  );
}
