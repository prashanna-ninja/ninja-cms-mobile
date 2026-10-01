import * as SecureStore from "expo-secure-store";
import { vars } from "nativewind";
import * as React from "react";
import { View } from "react-native";

import { APP_SCHEME } from "@/constants/env";
import { buildOrgTheme, type OrgTheme } from "@/lib/org-theme";
import { useSession } from "@/providers/session-provider";
import type { ActiveOrg, OrgSummary } from "@/types/advice.types";

/** Last-used org (web equivalent: localStorage `portal_advice_id`). Not secret, just per device. */
const STORAGE_KEY = `${APP_SCHEME}_active_org`;

type OrgThemeState = {
  /** The org being worked in — null until one is chosen (or after sign-out / user switch). */
  org: OrgSummary | null;
  /** Colours for `org` (or the Ninja CMS default when there's no org / no colour). */
  theme: OrgTheme;
  /** Switch org (org picker / single-org auto-select). `null` clears it. */
  setOrg: (org: OrgSummary | null) => void;
};

const OrgThemeContext = React.createContext<OrgThemeState | null>(null);

function readStored(): ActiveOrg | null {
  try {
    const raw = SecureStore.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ActiveOrg) : null;
  } catch {
    return null;
  }
}

/**
 * Holds the active organisation and its theme for the signed-in area.
 *
 * The app is the **adviser portal** on mobile, so — like the web `/portal/[adviceId]`
 * — everything behind sign-in wears the org's colour and logo. Pre-login screens
 * (sign-in, forgot password, boot) stay Ninja CMS branded: we don't know the org yet.
 *
 * - The remembered org is keyed to the user who picked it; if a different user
 *   signs in on this device it is ignored (no flash of someone else's branding).
 * - Org selection itself (GET /api/advice/my → 0 / 1 auto / many → picker) lands
 *   with the org-picker step; this provider is what it calls (`setOrg`).
 * - Wrap content in <OrgThemeScope> to apply the colours to NativeWind classes.
 */
export function OrgThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const userId = session?.user.id ?? null;

  // Synchronous read on first render: SecureStore.getItem is sync, so a returning
  // user sees their org colours on the very first frame (no default-colour flash).
  const [stored, setStored] = React.useState<ActiveOrg | null>(readStored);

  const org = stored && userId && stored.userId === userId ? stored : null;
  const theme = React.useMemo(() => buildOrgTheme(org?.colorTheme), [org?.colorTheme]);

  const setOrg = React.useCallback(
    (next: OrgSummary | null) => {
      if (!next || !userId) {
        setStored(null);
        void SecureStore.deleteItemAsync(STORAGE_KEY).catch(() => {});
        return;
      }
      const value: ActiveOrg = { ...next, userId };
      setStored(value);
      void SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(value)).catch(() => {});
    },
    [userId],
  );

  const value = React.useMemo<OrgThemeState>(
    () => ({ org, theme, setOrg }),
    [org, theme, setOrg],
  );

  return <OrgThemeContext.Provider value={value}>{children}</OrgThemeContext.Provider>;
}

/** The active org + theme. Must be used under <OrgThemeProvider>. */
export function useOrgTheme(): OrgThemeState {
  const ctx = React.useContext(OrgThemeContext);
  if (!ctx) throw new Error("useOrgTheme must be used within <OrgThemeProvider>");
  return ctx;
}

/**
 * Applies the active org's colours to every NativeWind class below it
 * (`bg-primary`, `text-primary`, `bg-accent`, `bg-secondary`, `ring`…) by
 * overriding the CSS variables from src/global.css with NativeWind's `vars()`.
 *
 * For values that can't be a class (gradients, icon `color` props, StatusBar),
 * read `useOrgTheme().theme` directly.
 */
export function OrgThemeScope({ children }: { children: React.ReactNode }) {
  const { theme } = useOrgTheme();
  return <View style={[{ flex: 1 }, vars(theme.cssVars)]}>{children}</View>;
}
