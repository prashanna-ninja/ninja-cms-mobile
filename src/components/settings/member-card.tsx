import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

import { OrgLogo } from "@/components/org-logo";
import { displayName, initials, roleLabel } from "@/lib/user-display";
import { useOrgTheme } from "@/providers/org-theme-provider";
import { useSession } from "@/providers/session-provider";

const FONT = {
  regular: "BricolageGrotesque_400Regular",
  medium: "BricolageGrotesque_500Medium",
  semibold: "BricolageGrotesque_600SemiBold",
  bold: "BricolageGrotesque_700Bold",
};

/**
 * The signed-in user as an org "member card" — the centrepiece of Settings.
 *
 * Org gradient + the org logo, like the web portal nav, with the same faint
 * concentric circles PortalNav draws top-right. Below: an initials monogram,
 * name, email, and a letter-spaced role tag. Reads like an adviser's pass for
 * the organisation they're working in.
 */
export function MemberCard() {
  const { data: session } = useSession();
  const { org, theme } = useOrgTheme();
  const user = session?.user;
  const onDark = theme.onBase === "#FFFFFF";
  const veil = onDark ? "rgba(255,255,255," : "rgba(13,27,62,";

  return (
    <LinearGradient
      colors={theme.gradient}
      start={{ x: 0.05, y: 0 }}
      end={{ x: 0.95, y: 1 }}
      style={{
        borderRadius: 24,
        padding: 20,
        gap: 22,
        overflow: "hidden",
        shadowColor: theme.base,
        shadowOpacity: 0.25,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 4,
      }}
    >
      {/* Decorative concentric rings, top-right (web PortalNav motif). */}
      <View pointerEvents="none" style={{ position: "absolute", top: -90, right: -70 }}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              width: 220 + i * 46,
              height: 220 + i * 46,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: `${veil}${0.09 - i * 0.015})`,
              top: -i * 23,
              right: -i * 23,
            }}
          />
        ))}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <OrgLogo height={30} maxWidth={150} />
        {user?.role ? (
          <View
            style={{
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
              backgroundColor: `${veil}0.16)`,
              borderWidth: 1,
              borderColor: `${veil}0.22)`,
            }}
          >
            <Text style={{ fontFamily: FONT.semibold, fontSize: 10.5, letterSpacing: 1.4, color: theme.onBase }}>
              {roleLabel(user.role).toUpperCase()}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <View
          style={{
            width: 58,
            height: 58,
            borderRadius: 29,
            backgroundColor: onDark ? "#FFFFFF" : theme.base,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 3,
            borderColor: `${veil}0.25)`,
          }}
        >
          <Text style={{ fontFamily: FONT.bold, fontSize: 20, color: onDark ? theme.text : "#FFFFFF" }}>
            {initials(user)}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text numberOfLines={1} style={{ fontFamily: FONT.bold, fontSize: 21, letterSpacing: -0.3, color: theme.onBase }}>
            {displayName(user)}
          </Text>
          <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 14, color: theme.onBase, opacity: 0.85 }}>
            {user?.email}
          </Text>
        </View>
      </View>

      <View style={{ height: 1, backgroundColor: `${veil}0.18)` }} />

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontFamily: FONT.medium, fontSize: 11, letterSpacing: 1.6, color: theme.onBase, opacity: 0.75 }}>
          ADVISER PORTAL
        </Text>
        <Text numberOfLines={1} style={{ flexShrink: 1, marginLeft: 12, fontFamily: FONT.semibold, fontSize: 13, color: theme.onBase }}>
          {org?.name}
        </Text>
      </View>
    </LinearGradient>
  );
}
