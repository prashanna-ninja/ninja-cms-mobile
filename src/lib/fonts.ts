import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
} from "@expo-google-fonts/bricolage-grotesque";

/**
 * Brand font (the CMS web uses Bricolage Grotesque everywhere), loaded once at startup
 * via `useFonts` in src/app/_layout.tsx.
 *
 * The KEYS become the `fontFamily` names used in tailwind.config.js
 * (`font-sans`, `font-sans-medium`, `font-sans-semibold`, `font-display`) — keep them in sync.
 */
export const appFonts = {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
};
